"use client";

import { useUser } from "@/components/providers/UserProvider";

export default function PageContent() {
    const { user } = useUser();

    return (
        <div>
            <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
    );
}
