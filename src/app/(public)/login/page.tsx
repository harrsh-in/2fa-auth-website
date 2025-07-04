import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Login | 2FA Auth",
    description: "Login to your account.",
};

export default function LoginPage() {
    return <PageContent />;
}
