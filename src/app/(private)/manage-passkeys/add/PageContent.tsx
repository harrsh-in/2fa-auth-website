"use client";

import { Input } from "@/components/form/Input";
import axios from "@/libs/axiosInterceptor";
import { startRegistration } from "@simplewebauthn/browser";
import type {
    RegistrationResponseJSON,
    PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/browser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const addPasskeySchema = z.object({
    label: z
        .string()
        .min(1, { message: "Passkey name is required" })
        .max(50, { message: "Passkey name must be 50 characters or less" }),
});

type AddPasskeyFormValues = z.infer<typeof addPasskeySchema>;

interface RegistrationVerifyRequest {
    label: string;
    credential: RegistrationResponseJSON;
}

export default function PageContent() {
    const router = useRouter();
    const [isCreatingPasskey, setIsCreatingPasskey] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<AddPasskeyFormValues>({
        resolver: zodResolver(addPasskeySchema),
        defaultValues: {
            label: "",
        },
    });

    // Get registration options
    const getOptionsMutation = useMutation({
        mutationFn: async (
            label: string
        ): Promise<{
            options: PublicKeyCredentialCreationOptionsJSON;
            label: string;
        }> => {
            const { data } = await axios.post<{
                options: PublicKeyCredentialCreationOptionsJSON;
                label: string;
            }>("/auth/passkey/registration/options", { label });
            return data;
        },
    });

    // Verify registration
    const verifyMutation = useMutation({
        mutationFn: async (verifyData: RegistrationVerifyRequest) => {
            await axios.post("/auth/passkey/registration/verify", verifyData);
        },
        onSuccess: () => {
            router.push("/manage-passkeys");
        },
    });

    const onSubmit = async (data: AddPasskeyFormValues) => {
        setIsCreatingPasskey(true);

        try {
            // Step 1: Get registration options from server
            const response = await getOptionsMutation.mutateAsync(data.label);

            // Step 2: Start registration using SimpleWebAuthn
            const registrationResponse = await startRegistration({
                optionsJSON: response.options,
            });

            // Step 3: Send verification to server
            const verificationData: RegistrationVerifyRequest = {
                label: data.label,
                credential: registrationResponse,
            };

            await verifyMutation.mutateAsync(verificationData);
        } catch (error) {
            console.error("Passkey creation failed:", error);

            let errorMessage = "Failed to create passkey. Please try again.";

            if (error instanceof Error) {
                if (error.name === "NotAllowedError") {
                    errorMessage =
                        "Passkey creation was cancelled or not allowed.";
                } else if (error.name === "NotSupportedError") {
                    errorMessage = "This device doesn&apos;t support passkeys.";
                } else if (error.name === "SecurityError") {
                    errorMessage = "Security error occurred. Please try again.";
                } else if (error.name === "InvalidStateError") {
                    errorMessage =
                        "A passkey already exists for this account on this device.";
                }
            }

            alert(errorMessage);
        } finally {
            setIsCreatingPasskey(false);
        }
    };

    const isLoading =
        isCreatingPasskey ||
        getOptionsMutation.status === "pending" ||
        verifyMutation.status === "pending";

    const hasError = !isValid;

    const getErrorMessage = (error: unknown) => {
        if (isAxiosError(error) && error.response?.data?.message) {
            return error.response.data.message;
        }
        return "An error occurred. Please try again.";
    };

    return (
        <div className="mx-auto max-w-md space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    Add New Passkey
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                    Create a new passkey for secure, passwordless
                    authentication.
                </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start space-x-3">
                    <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-blue-800">
                            Before You Continue
                        </h3>
                        <div className="mt-1 text-sm text-blue-700">
                            <ul className="list-disc space-y-1 pl-5">
                                <li>
                                    Make sure your device supports passkeys
                                    (fingerprint, face ID, or security key)
                                </li>
                                <li>
                                    You&apos;ll be prompted to use your
                                    device&apos;s authentication method
                                </li>
                                <li>
                                    Give your passkey a memorable name to
                                    identify it later
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
            >
                <Input
                    autoFocus
                    label="Passkey Name"
                    type="text"
                    placeholder="e.g., My iPhone, Work Laptop, Security Key"
                    isError={!!errors.label}
                    isLoading={isLoading}
                    helper={
                        errors.label?.message ||
                        "Choose a name that helps you identify this passkey"
                    }
                    {...register("label")}
                />

                {(getOptionsMutation.error || verifyMutation.error) && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-600">
                            {getErrorMessage(
                                getOptionsMutation.error || verifyMutation.error
                            )}
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        type="submit"
                        className={`w-full rounded px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                            hasError
                                ? "cursor-not-allowed bg-gray-400"
                                : "cursor-pointer bg-blue-600 hover:bg-blue-700 focus:bg-blue-700"
                        }`}
                        disabled={isLoading || hasError}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>
                                    {isCreatingPasskey
                                        ? "Creating Passkey..."
                                        : getOptionsMutation.status ===
                                            "pending"
                                          ? "Preparing..."
                                          : "Verifying..."}
                                </span>
                            </div>
                        ) : (
                            "Create Passkey"
                        )}
                    </button>

                    <Link
                        href="/manage-passkeys"
                        className="block w-full rounded border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                </div>
            </form>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-gray-900">
                    What happens next?
                </h3>
                <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600">
                    <li>
                        Click &quot;Create Passkey&quot; to start the process
                    </li>
                    <li>
                        Your browser will ask you to authenticate with your
                        device
                    </li>
                    <li>
                        Use fingerprint, face ID, PIN, or security key as
                        prompted
                    </li>
                    <li>Your new passkey will be saved and ready to use</li>
                </ol>
            </div>
        </div>
    );
}
