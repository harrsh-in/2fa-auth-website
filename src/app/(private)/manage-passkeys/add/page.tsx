import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Add Passkey | Chat App",
    description: "Add a new passkey for passwordless authentication.",
};

export default function AddPasskeyPage() {
    return <PageContent />;
}
