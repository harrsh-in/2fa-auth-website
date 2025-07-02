import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Login with Passkey | 2FA Auth",
    description: "Sign in securely with your passkey.",
};

export default function PasskeyLoginPage() {
    return <PageContent />;
}
