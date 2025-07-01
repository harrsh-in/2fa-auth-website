"use client";

import { Input } from "@/components/form/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import axios from "@/libs/axiosInterceptor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { QRCodeSVG } from "qrcode.react";
import { z } from "zod";

const verifySchema = z.object({
    token: z
        .string()
        .regex(/^\d{6}$/, { message: "Must be a 6-digit code" })
        .min(6, { message: "Authentication code is required" }),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

interface Setup2FAResponse {
    otpauthUri: string;
}

export default function PageContent() {
    const router = useRouter();
    const { user, setAuthState } = useAuth();
    const [qrCodeUri, setQrCodeUri] = useState<string>("");
    const [showVerification, setShowVerification] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
    });

    const setup2FAMutation = useMutation({
        mutationFn: async () => {
            const { data } =
                await axios.post<Setup2FAResponse>("/auth/2fa/setup");
            return data;
        },
        onSuccess: (data) => {
            setQrCodeUri(data.otpauthUri);
            setShowVerification(true);
        },
    });

    const verify2FAMutation = useMutation({
        mutationFn: async (data: VerifyFormValues) => {
            await axios.post("/auth/2fa/verify", data);
        },
        onSuccess: () => {
            // Update user state to reflect 2FA is now enabled
            if (user) {
                setAuthState({
                    ...user,
                    twoFactorEnabled: true,
                });
            }
            router.push("/home");
        },
    });

    const handleSetup2FA = () => {
        setup2FAMutation.mutate();
    };

    const onSubmitVerification = (data: VerifyFormValues) => {
        verify2FAMutation.mutate(data);
    };

    const handleBack = () => {
        setShowVerification(false);
        setQrCodeUri("");
        reset();
    };

    const isSetupLoading = setup2FAMutation.status === "pending";
    const isVerifyLoading =
        isSubmitting || verify2FAMutation.status === "pending";
    const hasError = !isValid;

    if (showVerification && qrCodeUri) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
                    <div className="text-center">
                        <h1 className="mb-4 text-2xl font-bold">
                            Setup Two-Factor Authentication
                        </h1>
                        <p className="mb-6 text-sm text-gray-600">
                            Scan this QR code with your authenticator app, then
                            enter the 6-digit code to complete setup.
                        </p>

                        <div className="mb-6 flex justify-center">
                            <div className="rounded-lg border-2 border-gray-200 p-4">
                                <QRCodeSVG value={qrCodeUri} size={200} />
                            </div>
                        </div>

                        <div className="mb-4 rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">
                                Can&apos;t scan? Use this code manually:
                            </p>
                            <code className="mt-1 block text-xs break-all text-gray-700">
                                {qrCodeUri.split("secret=")[1]?.split("&")[0]}
                            </code>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmitVerification)}
                        noValidate
                    >
                        <Input
                            autoFocus
                            label="Authentication Code"
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            isError={!!errors.token}
                            isLoading={isVerifyLoading}
                            helper={errors.token?.message}
                            {...register("token")}
                        />

                        <div className="mt-6 space-y-3">
                            <button
                                type="submit"
                                className={`w-full rounded px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                                    hasError
                                        ? "cursor-not-allowed bg-red-600 focus:bg-red-700"
                                        : "cursor-pointer bg-blue-600 hover:bg-blue-700 focus:bg-blue-700"
                                }`}
                                disabled={isVerifyLoading || hasError}
                            >
                                {isVerifyLoading
                                    ? "Verifying..."
                                    : "Complete Setup"}
                            </button>

                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-full rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                disabled={isVerifyLoading}
                            >
                                Back
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold">
                        Setup Two-Factor Authentication
                    </h1>
                    <p className="mb-6 text-gray-600">
                        Add an extra layer of security to your account by
                        enabling two-factor authentication.
                    </p>

                    <div className="mb-6 space-y-3 text-left text-sm text-gray-600">
                        <div className="flex items-start space-x-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                                1
                            </span>
                            <p>
                                Download an authenticator app like Google
                                Authenticator or Authy
                            </p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                                2
                            </span>
                            <p>
                                Click &quot;Generate QR Code&quot; to get your
                                unique setup code
                            </p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                                3
                            </span>
                            <p>
                                Scan the QR code and enter the verification code
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSetup2FA}
                    disabled={isSetupLoading}
                    className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSetupLoading ? "Generating..." : "Generate QR Code"}
                </button>

                <button
                    onClick={() => router.push("/home")}
                    className="w-full rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
