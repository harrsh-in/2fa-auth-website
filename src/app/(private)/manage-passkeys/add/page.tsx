import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Add Passkey | 2FA Auth",
    description: "Add a new passkey for passwordless authentication.",
};

export default function AddPasskeyPage() {
    return <PageContent />;
}
