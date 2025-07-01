import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Login | Chat App",
    description: "Login to your account.",
};

export default function LoginPage() {
    return <PageContent />;
}
