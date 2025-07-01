"use client";

import { Input } from "@/components/form/Input";
import { IAuthenticatedUser } from "@/components/providers/AuthProvider";
import axios from "@/libs/axiosInterceptor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function PageContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useMutation({
        mutationFn: async (data: LoginFormValues) => {
            const { data: resData } = await axios.post<IAuthenticatedUser>(
                "/auth/login",
                data
            );
            return resData;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["user/whoami"], data);
            reset();
            router.push("/home");
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
