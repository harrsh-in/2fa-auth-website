"use client";

import { Input } from "@/components/form/Input";
import {
    IAuthenticatedUser,
    useAuth,
} from "@/components/providers/AuthProvider";
import axios from "@/libs/axiosInterceptor";
import { startAuthentication } from "@simplewebauthn/browser";
import type {
    AuthenticationResponseJSON,
    PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passkeyLoginSchema = z.object({
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(20, { message: "Username must not exceed 20 characters" })
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores"
        ),
});

type PasskeyLoginFormValues = z.infer<typeof passkeyLoginSchema>;

interface AuthenticationOptionsResponse {
    options: PublicKeyCredentialRequestOptionsJSON;
    authNonce: string;
}

interface AuthenticationVerifyRequest {
    authNonce: string;
    credential: AuthenticationResponseJSON;
}

export default function PageContent() {
    const router = useRouter();
    const { setAuthState } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showPasskeyButton, setShowPasskeyButton] = useState(false);
    const [authNonce, setAuthNonce] = useState<string>("");

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<PasskeyLoginFormValues>({
        resolver: zodResolver(passkeyLoginSchema),
        defaultValues: {
            username: "",
        },
    });

    // Get authentication options
    const getOptionsMutation = useMutation({
        mutationFn: async (
            username: string
        ): Promise<AuthenticationOptionsResponse> => {
            const { data } = await axios.post<AuthenticationOptionsResponse>(
                "/auth/passkey/authentication/options",
                { username }
            );
            return data;
        },
        onSuccess: (data) => {
            setAuthNonce(data.authNonce);
            setShowPasskeyButton(true);
        },
    });

    // Verify authentication
    const verifyMutation = useMutation({
        mutationFn: async (verifyData: AuthenticationVerifyRequest) => {
            const { data } = await axios.post<IAuthenticatedUser>(
                "/auth/passkey/authentication/verify",
                verifyData
            );
            return data;
        },
        onSuccess: (data) => {
            setAuthState(data);
            router.push("/home");
        },
    });

    const onSubmit = async (data: PasskeyLoginFormValues) => {
        try {
            await getOptionsMutation.mutateAsync(data.username);
        } catch (error) {
            console.error("Failed to get authentication options:", error);
        }
    };

    const handlePasskeyLogin = async () => {
        setIsAuthenticating(true);

        try {
            const response = getOptionsMutation.data;
            if (!response) {
                throw new Error("No authentication options available");
            }

            // Step 1: Start authentication using SimpleWebAuthn
            const authenticationResponse = await startAuthentication({
                optionsJSON: response.options,
            });

            // Step 2: Send verification to server
            const verificationData: AuthenticationVerifyRequest = {
                authNonce,
                credential: authenticationResponse,
            };

            await verifyMutation.mutateAsync(verificationData);
        } catch (error) {
            console.error("Passkey authentication failed:", error);

            let errorMessage =
                "Failed to authenticate with passkey. Please try again.";

            if (error instanceof Error) {
                if (error.name === "NotAllowedError") {
                    errorMessage =
                        "Authentication was cancelled or not allowed.";
                } else if (error.name === "NotSupportedError") {
                    errorMessage = "This device doesn&apos;t support passkeys.";
                } else if (error.name === "SecurityError") {
                    errorMessage = "Security error occurred. Please try again.";
                } else if (error.name === "InvalidStateError") {
                    errorMessage =
                        "No passkey found for this account on this device.";
                } else if (error.message?.includes("not supported")) {
                    errorMessage = "WebAuthn is not supported in this browser.";
                }
            }

            alert(errorMessage);
        } finally {
            setIsAuthenticating(false);
        }
    };

    const isLoading =
        isAuthenticating ||
        getOptionsMutation.status === "pending" ||
        verifyMutation.status === "pending";

    const getErrorMessage = (error: unknown) => {
        if (isAxiosError(error) && error.response?.data?.message) {
            return error.response.data.message;
        }
        return "An error occurred. Please try again.";
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Sign in with Passkey
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {showPasskeyButton
                            ? "Use your device's built-in security to sign in securely"
                            : "Enter your username to begin passkey authentication"}
                    </p>
                </div>

                <div className="space-y-4">
                    {!showPasskeyButton && (
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
                                        Quick & Secure
                                    </h3>
                                    <p className="mt-1 text-sm text-blue-700">
                                        Use fingerprint, face ID, or your
                                        security key to sign in instantly
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {(getOptionsMutation.error || verifyMutation.error) && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm text-red-600">
                                {getErrorMessage(
                                    getOptionsMutation.error ||
                                        verifyMutation.error
                                )}
                            </p>
                        </div>
                    )}

                    {!showPasskeyButton ? (
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            <Input
                                autoFocus
                                autoComplete="username"
                                label="Username"
                                type="text"
                                placeholder="Enter your username"
                                isError={!!errors.username}
                                isLoading={
                                    getOptionsMutation.status === "pending"
                                }
                                helper={errors.username?.message}
                                {...register("username")}
                            />
                            <button
                                type="submit"
                                disabled={
                                    !isValid ||
                                    getOptionsMutation.status === "pending"
                                }
                                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {getOptionsMutation.status === "pending" ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        <span>Preparing...</span>
                                    </div>
                                ) : (
                                    "Continue"
                                )}
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={handlePasskeyLogin}
                            disabled={isLoading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span>
                                        {isAuthenticating
                                            ? "Authenticating..."
                                            : "Verifying..."}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 019 0z"
                                        />
                                    </svg>
                                    <span>Sign in with Passkey</span>
                                </div>
                            )}
                        </button>
                    )}

                    <div className="text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">
                                    Or
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Sign in with Password
                    </Link>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
