import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Signup | 2FA Auth",
    description: "Create a new account.",
};

export default function SignupPage() {
    return <PageContent />;
}
