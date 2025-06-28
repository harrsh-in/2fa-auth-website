"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/form/Input";
import { useMutation } from "@tanstack/react-query";
import api from "@/libs/axiosInterceptor";
import Link from "next/link";

const loginSchema = z.object({
    username: z.string().min(3, { message: "Username is required" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [apiError, setApiError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useMutation({
        mutationFn: async (data: LoginFormValues) => {
            const res = await api.post("/auth/login", data);
            return res.data;
        },
        onSuccess: () => {
            setApiError(null);
            // Redirect or further logic here
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        setApiError(null);
        loginMutation.mutate(data);
    };

    const isLoading = isSubmitting || loginMutation.status === "pending";
    const hasError = !!errors.username || !!errors.password || !!apiError;

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
                {apiError && (
                    <div className="text-center text-sm text-red-600">
                        {apiError}
                    </div>
                )}
                <button
                    type="submit"
                    className={`w-full rounded px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                        hasError
                            ? "cursor-not-allowed bg-red-600 hover:bg-red-700 focus:bg-red-700"
                            : "cursor-pointer bg-blue-600 hover:bg-blue-700 focus:bg-blue-700"
                    }`}
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
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
