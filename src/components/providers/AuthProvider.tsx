"use client";

import axios from "@/libs/axiosInterceptor";
import { useQuery } from "@tanstack/react-query";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from "react";
import ScreenLoader from "../ScreenLoader";

export interface IAuthenticatedUser {
    _id: string;
    username: string;
    twoFactorEnabled: boolean;
}

interface IUnauthenticatedUser {
    isUnauthenticated: boolean;
}

type AuthResponse = IAuthenticatedUser | IUnauthenticatedUser;

export const AuthContext = createContext<{
    isAuthenticated: boolean;
    isLoading: boolean;
    user?: IAuthenticatedUser;
    setAuthState: (user?: IAuthenticatedUser) => void;
}>({
    isAuthenticated: false,
    isLoading: true,
    setAuthState: () => {},
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<IAuthenticatedUser | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { data, isError, status } = useQuery<AuthResponse>({
        queryKey: ["user/whoami"],
        queryFn: async () => {
            const { data } = await axios.get<AuthResponse>("/user/whoami");
            return data;
        },
    });

    // Function to set auth state externally (for login)
    const setAuthState = (userData?: IAuthenticatedUser) => {
        if (userData) {
            setIsAuthenticated(true);
            setUser(userData);
        } else {
            setIsAuthenticated(false);
            setUser(undefined);
        }
    };

    // Update state when query data changes
    useEffect(() => {
        if (data) {
            const authenticated = !("isUnauthenticated" in data);
            setIsAuthenticated(authenticated);
            setUser(authenticated ? data : undefined);
            setIsLoading(false);
        }
    }, [data]);

    // Handle error state
    useEffect(() => {
        if (isError) {
            setIsLoading(false);
        }
    }, [isError]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setAuthState();
        };
    }, []);

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

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                setAuthState,
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
