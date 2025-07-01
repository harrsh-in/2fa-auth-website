import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Login with Passkey | Chat App",
    description: "Sign in securely with your passkey.",
};

export default function PasskeyLoginPage() {
    return <PageContent />;
}
