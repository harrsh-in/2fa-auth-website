"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useUser } from "@/components/providers/UserProvider";
import axios from "@/libs/axiosInterceptor";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { user } = useUser();
    const { setAuthState } = useAuth();
    const router = useRouter();

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await axios.post("/auth/logout");
        },
        onSuccess: () => {
            // Clear auth state using the proper cleanup method
            setAuthState();

            // Navigate to login page
            router.replace("/login");
        },
        onError: () => {
            console.log("Logout failed");
        },
    });

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const isLoading = logoutMutation.status === "pending";

    return (
        <nav className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Chat App
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700">
                            Welcome, {user.username}
                        </span>

                        {/* 2FA Status and Actions */}
                        {user.twoFactorEnabled ? (
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    2FA Enabled
                                </span>
                                <button
                                    onClick={() => router.push("/disable-2fa")}
                                    className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:bg-red-700"
                                >
                                    Disable 2FA
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                    2FA Disabled
                                </span>
                                <button
                                    onClick={() => router.push("/setup-2fa")}
                                    className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:bg-green-700"
                                >
                                    Setup 2FA
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="rounded bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? "Logging out..." : "Logout"}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
