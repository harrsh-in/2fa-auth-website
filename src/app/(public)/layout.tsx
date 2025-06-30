"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { redirect } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

export default function PublicLayout({ children }: PropsWithChildren) {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            redirect("/home");
        }
    }, [isAuthenticated]);

    // Show loading or prevent flash while checking auth
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex min-h-screen items-center justify-center">
                <div className="w-full max-w-md space-y-8">{children}</div>
            </div>
        </div>
    );
}
