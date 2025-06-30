"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import ScreenLoader from "@/components/ScreenLoader";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            redirect("/home");
        } else {
            redirect("/login");
        }
    }, [isAuthenticated]);

    // Show loader while redirecting
    return <ScreenLoader />;
}
