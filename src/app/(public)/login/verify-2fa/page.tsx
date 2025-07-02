import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Verify Two-Factor Authentication | 2FA Auth",
    description: "Enter your authentication code to complete login.",
};

export default function Verify2FAPage() {
    return <PageContent />;
}
