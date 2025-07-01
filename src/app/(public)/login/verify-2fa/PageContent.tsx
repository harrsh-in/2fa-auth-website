"use client";

import { Input } from "@/components/form/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import axios from "@/libs/axiosInterceptor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const twoFASchema = z.object({
    token: z
        .string()
        .regex(/^\d{6}$/, { message: "Must be a 6-digit code" })
        .min(6, { message: "Authentication code is required" }),
});

type TwoFAFormValues = z.infer<typeof twoFASchema>;

interface IAuthenticatedUser {
    _id: string;
    username: string;
    twoFactorEnabled: boolean;
}

export default function PageContent() {
    const router = useRouter();
    const { setAuthState } = useAuth();
    const [loginNonce, setLoginNonce] = useState<string>("");
    const [isValidSession, setIsValidSession] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<TwoFAFormValues>({
        resolver: zodResolver(twoFASchema),
        defaultValues: {
            token: "",
        },
    });

    // Check for valid session on mount and handle page refresh
    useEffect(() => {
        const storedNonce = sessionStorage.getItem("login_nonce");
        if (!storedNonce) {
            // No valid session, redirect to login
            router.replace("/login");
        } else {
            setLoginNonce(storedNonce);
            setIsValidSession(true);
        }

        // Clear session on page refresh/navigation (but not React StrictMode remount)
        const handleBeforeUnload = () => {
            sessionStorage.removeItem("login_nonce");
        };

        // Add listener for actual page unload/refresh
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [router]);

    const verify2FAMutation = useMutation({
        mutationFn: async (data: TwoFAFormValues) => {
            const { data: resData } = await axios.post<IAuthenticatedUser>(
                "/auth/login/2fa",
                {
                    loginNonce,
                    token: data.token,
                }
            );
            return resData;
        },
        onSuccess: (data) => {
            // Clear session storage on success
            sessionStorage.removeItem("login_nonce");
            setAuthState(data);
            reset();
            router.push("/home");
        },
        onError: () => {
            // On error, keep user on this page for retry but clear the form
            reset();
        },
    });

    // Note: Removed cleanup useEffect as it was causing issues with React StrictMode
    // Session cleanup is already handled in onSuccess and handleBackToLogin

    const onSubmit = (data: TwoFAFormValues) => {
        verify2FAMutation.mutate(data);
    };

    const handleBackToLogin = () => {
        // Clear session storage when going back
        sessionStorage.removeItem("login_nonce");
        router.push("/login");
    };

    const hasError = !isValid;
    const isLoading = isSubmitting || verify2FAMutation.status === "pending";

    // Don't render if session is not valid (will redirect anyway)
    if (!isValidSession) {
        return null;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow"
                noValidate
            >
                <div className="text-center">
                    <h1 className="mb-2 text-2xl font-bold">
                        Two-Factor Authentication
                    </h1>
                    <p className="text-sm text-gray-600">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>
                <Input
                    autoFocus
                    label="Authentication Code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    isError={!!errors.token}
                    isLoading={isLoading}
                    helper={errors.token?.message}
                    {...register("token")}
                />
                <div className="space-y-3">
                    <button
                        type="submit"
                        className={`w-full rounded px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                            hasError
                                ? "cursor-not-allowed bg-red-600 focus:bg-red-700"
                                : "cursor-pointer bg-blue-600 hover:bg-blue-700 focus:bg-blue-700"
                        }`}
                        disabled={isLoading || hasError}
                    >
                        {isLoading ? "Verifying..." : "Verify"}
                    </button>
                    <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="w-full rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Back to Login
                    </button>
                </div>
            </form>
        </div>
    );
}
