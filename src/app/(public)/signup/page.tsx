"use client";

import { Input } from "@/components/form/Input";
import axios from "@/libs/axiosInterceptor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signupSchema = z
    .object({
        username: z.string().min(3, { message: "Username is required" }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters" }),
        confirmPassword: z.string().min(6, {
            message: "Confirm password must be at least 6 characters",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    });

    const signupMutation = useMutation({
        mutationFn: async (data: SignupFormValues) => {
            const res = await axios.post("/auth/signup", {
                username: data.username,
                password: data.password,
                confirmPassword: data.confirmPassword,
            });
            return res.data;
        },
        onSuccess: () => {
            router.push("/login");
        },
    });

    const onSubmit = (data: SignupFormValues) => {
        signupMutation.mutate(data);
    };

    const hasError = !isValid;
    const isLoading = isSubmitting || signupMutation.status === "pending";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow"
                noValidate
            >
                <h1 className="mb-4 text-center text-2xl font-bold">Sign Up</h1>
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
                <Input
                    autoComplete="confirm-password"
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    isError={!!errors.confirmPassword}
                    isLoading={isLoading}
                    helper={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
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
                    {isLoading ? "Creating account..." : "Sign Up"}
                </button>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}
