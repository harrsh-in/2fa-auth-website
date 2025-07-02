import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Manage Passkeys | 2FA Auth",
    description: "Manage your passkeys for passwordless authentication.",
};

export default function ManagePasskeysPage() {
    return <PageContent />;
}
