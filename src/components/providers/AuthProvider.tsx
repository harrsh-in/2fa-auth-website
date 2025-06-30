"use client";

import axios from "@/libs/axiosInterceptor";
import { useQuery } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useContext } from "react";
import ScreenLoader from "../ScreenLoader";

export interface IAuthenticatedUser {
    _id: string;
    username: string;
}

interface IUnauthenticatedUser {
    isUnauthenticated: boolean;
}

type AuthResponse = IAuthenticatedUser | IUnauthenticatedUser;

export const AuthContext = createContext<{
    isAuthenticated: boolean;
    user?: IAuthenticatedUser;
}>({
    isAuthenticated: false,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const { data, isError, status } = useQuery<AuthResponse>({
        queryKey: ["user/whoami"],
        queryFn: async () => {
            const { data } = await axios.get<AuthResponse>("/user/whoami");
            return data;
        },
    });

    if (status === "pending") {
        return <ScreenLoader />;
    }

    if (isError) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center text-red-500">
                    <h2 className="mb-2 text-xl font-medium">
                        Authentication Error
                    </h2>
                    <p>Failed to authenticate. Please try again.</p>
                </div>
            </div>
        );
    }

    const isAuthenticated = data ? !("isUnauthenticated" in data) : false;
    const user = isAuthenticated ? (data as IAuthenticatedUser) : undefined;

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
