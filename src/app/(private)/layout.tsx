"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { UserProvider } from "@/components/providers/UserProvider";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

export default function PrivateLayout({ children }: PropsWithChildren) {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            redirect("/login");
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <UserProvider>
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </UserProvider>
    );
}
