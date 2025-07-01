import { Metadata } from "next";
import PageContent from "./PageContent";

export const metadata: Metadata = {
    title: "Home | Chat App",
    description: "Your dashboard and recent conversations.",
};

export default function HomePage() {
    return <PageContent />;
}
