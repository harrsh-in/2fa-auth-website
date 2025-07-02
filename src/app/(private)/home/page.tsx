import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Home | 2FA Auth",
    description: "Your dashboard and recent conversations.",
};

export default function HomePage() {
    return <PageContent />;
}
