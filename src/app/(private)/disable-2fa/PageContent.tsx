"use client";

import { Input } from "@/components/form/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import { useUser } from "@/components/providers/UserProvider";
import axios from "@/libs/axiosInterceptor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const disableSchema = z.object({
    token: z
        .string()
        .regex(/^\d{6}$/, { message: "Must be a 6-digit code" })
        .min(6, { message: "Authentication code is required" }),
});

type DisableFormValues = z.infer<typeof disableSchema>;

export default function PageContent() {
    const router = useRouter();
    const { user } = useUser();
    const { setAuthState } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<DisableFormValues>({
        resolver: zodResolver(disableSchema),
    });

    const disable2FAMutation = useMutation({
        mutationFn: async (data: DisableFormValues) => {
            await axios.post("/auth/2fa/disable", data);
        },
        onSuccess: () => {
            // Update user state to reflect 2FA is now disabled
            setAuthState({
                ...user,
                twoFactorEnabled: false,
            });
            router.push("/home");
        },
    });

    const onSubmit = (data: DisableFormValues) => {
        disable2FAMutation.mutate(data);
    };

    const isLoading = isSubmitting || disable2FAMutation.status === "pending";
    const hasError = !isValid;

    // Redirect if 2FA is not enabled
    if (!user.twoFactorEnabled) {
        router.push("/home");
        return null;
    }

    const getErrorMessage = (error: unknown) => {
        if (isAxiosError(error) && error.response?.data?.message) {
            return error.response.data.message;
        }
        return "Failed to disable 2FA. Please try again.";
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold text-red-600">
                        Disable Two-Factor Authentication
                    </h1>
                    <p className="mb-6 text-gray-600">
                        Enter your current authentication code to disable 2FA
                        for your account.
                    </p>

                    {/* Warning Notice */}
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start space-x-2">
                            <svg
                                className="mt-0.5 h-5 w-5 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="text-left">
                                <h3 className="text-sm font-medium text-red-800">
                                    Security Warning
                                </h3>
                                <p className="mt-1 text-xs text-red-700">
                                    Disabling 2FA will make your account less
                                    secure. Only disable if you no longer have
                                    access to your authenticator app.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Input
                        autoFocus
                        label="Authentication Code"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        isError={!!errors.token}
                        isLoading={isLoading}
                        helper={
                            errors.token?.message ||
                            "Enter the 6-digit code from your authenticator app"
                        }
                        {...register("token")}
                    />

                    {disable2FAMutation.error && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm text-red-600">
                                {getErrorMessage(disable2FAMutation.error)}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 space-y-3">
                        <button
                            type="submit"
                            className={`w-full rounded px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                                hasError
                                    ? "cursor-not-allowed bg-red-400"
                                    : "cursor-pointer bg-red-600 hover:bg-red-700 focus:bg-red-700"
                            }`}
                            disabled={isLoading || hasError}
                        >
                            {isLoading
                                ? "Disabling..."
                                : "Disable Two-Factor Authentication"}
                        </button>

                        <Link
                            href="/home"
                            className="block w-full rounded border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Having trouble? Contact support for assistance.
                    </p>
                </div>
            </div>
        </div>
    );
}
