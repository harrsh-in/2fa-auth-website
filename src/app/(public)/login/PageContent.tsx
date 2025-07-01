"use client";

import { Input } from "@/components/form/Input";
import {
    IAuthenticatedUser,
    useAuth,
} from "@/components/providers/AuthProvider";
import axios from "@/libs/axiosInterceptor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
    username: z.string().min(3, { message: "Username is required" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponse {
    requiresTwoFactor?: boolean;
    loginNonce?: string;
    id?: string;
    username?: string;
    twoFactorEnabled?: boolean;
}

export default function PageContent() {
    const router = useRouter();
    const { setAuthState } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const loginMutation = useMutation({
        mutationFn: async (data: LoginFormValues) => {
            const { data: resData } = await axios.post<LoginResponse>(
                "/auth/login",
                data
            );
            return resData;
        },
        onSuccess: (data) => {
            if (data.requiresTwoFactor && data.loginNonce) {
                sessionStorage.setItem("login_nonce", data.loginNonce);
                router.push("/login/verify-2fa");
            } else if (data.id && data.username) {
                setAuthState(data as IAuthenticatedUser);
                reset();
                router.push("/home");
            }
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        loginMutation.mutate(data);
    };

    const hasError = !isValid;
    const isLoading = isSubmitting || loginMutation.status === "pending";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow"
                noValidate
            >
                <h1 className="mb-4 text-center text-2xl font-bold">Login</h1>
                <Input
                    autoFocus
                    autoComplete="username"
                    label="Username"
                    type="text"
                    placeholder="Your username..."
                    isError={!!errors.username}
                    isLoading={isLoading}
                    helper={errors.username?.message}
                    {...register("username")}
                />
                <Input
                    autoComplete="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    isError={!!errors.password}
                    isLoading={isLoading}
                    helper={errors.password?.message}
                    {...register("password")}
                />
                <button
                    type="submit"
                    className={`w-full rounded px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                        hasError
                            ? "cursor-not-allowed bg-red-600 focus:bg-red-700"
                            : "cursor-pointer bg-blue-600 hover:bg-blue-700 focus:bg-blue-700"
                    }`}
                    disabled={isLoading || hasError}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
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
                    href="/login/passkey"
                    className="block w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                    <div className="flex items-center justify-center space-x-2">
                        <svg
                            className="h-4 w-4"
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
                </Link>

                <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    );
}
