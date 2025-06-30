"use client";

import { createContext, PropsWithChildren, useContext } from "react";
import ScreenLoader from "../ScreenLoader";
import { IAuthenticatedUser, useAuth } from "./AuthProvider";

export const UserContext = createContext<{
    user: IAuthenticatedUser;
}>({} as { user: IAuthenticatedUser });

export const UserProvider = ({ children }: PropsWithChildren) => {
    const { isAuthenticated, user: authUser } = useAuth();

    if (!isAuthenticated || !authUser) {
        return <ScreenLoader />;
    }

    return (
        <UserContext.Provider
            value={{
                user: authUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): { user: IAuthenticatedUser } => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
