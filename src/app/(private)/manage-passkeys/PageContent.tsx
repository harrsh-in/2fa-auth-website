"use client";

import axios from "@/libs/axiosInterceptor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useState } from "react";

interface Passkey {
    id: string;
    credentialId: string;
    label: string;
    deviceType: string;
    backedUp: boolean;
    transports: string[];
    lastUsedAt?: string;
    createdAt: string;
}

interface PasskeysResponse {
    passkeys: Passkey[];
    count: number;
}

export default function PageContent() {
    const queryClient = useQueryClient();
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");

    // Fetch passkeys
    const {
        data: passkeyData,
        isLoading,
        error,
    } = useQuery<PasskeysResponse>({
        queryKey: ["passkeys"],
        queryFn: async () => {
            const { data } = await axios.get<PasskeysResponse>(
                "/auth/passkey/me/passkeys"
            );
            return data;
        },
    });

    const passkeys = passkeyData?.passkeys || [];

    // Rename passkey mutation
    const renamePasskeyMutation = useMutation({
        mutationFn: async ({ id, label }: { id: string; label: string }) => {
            await axios.patch(`/auth/passkey/me/passkeys/${id}`, { label });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["passkeys"] });
            setRenamingId(null);
            setNewName("");
        },
    });

    // Delete passkey mutation
    const deletePasskeyMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/auth/passkey/me/passkeys/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["passkeys"] });
        },
    });

    const handleRename = (passkey: Passkey) => {
        setRenamingId(passkey.id);
        setNewName(passkey.label);
    };

    const handleSaveRename = () => {
        if (renamingId && newName.trim()) {
            renamePasskeyMutation.mutate({
                id: renamingId,
                label: newName.trim(),
            });
        }
    };

    const handleCancelRename = () => {
        setRenamingId(null);
        setNewName("");
    };

    const handleDelete = (id: string) => {
        if (
            confirm(
                "Are you sure you want to delete this passkey? This action cannot be undone."
            )
        ) {
            deletePasskeyMutation.mutate(id);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getErrorMessage = (error: unknown) => {
        if (isAxiosError(error) && error.response?.data?.message) {
            return error.response.data.message;
        }
        return "An error occurred. Please try again.";
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center text-red-500">
                    <h2 className="mb-2 text-xl font-medium">
                        Error Loading Passkeys
                    </h2>
                    <p>{getErrorMessage(error)}</p>
                </div>
            </div>
        );
    }
    console.log(passkeys);

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Manage Passkeys
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Passkeys provide secure, passwordless authentication for
                        your account.
                    </p>
                </div>
                <Link
                    href="/manage-passkeys/add"
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700"
                >
                    Add New Passkey
                </Link>
            </div>

            {passkeys.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <svg
                            className="h-6 w-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 019 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                        No passkeys found
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                        You haven&apos;t added any passkeys yet. Add your first
                        passkey to enable passwordless authentication.
                    </p>
                    <Link
                        href="/manage-passkeys/add"
                        className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700"
                    >
                        Add Your First Passkey
                    </Link>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-medium text-gray-900">
                            Your Passkeys ({passkeys.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {passkeys.map((passkey) => (
                            <div key={passkey.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        {renamingId === passkey.id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) =>
                                                        setNewName(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="block w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                                                    placeholder="Passkey name"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter")
                                                            handleSaveRename();
                                                        if (e.key === "Escape")
                                                            handleCancelRename();
                                                    }}
                                                />
                                                <button
                                                    onClick={handleSaveRename}
                                                    disabled={
                                                        !newName.trim() ||
                                                        renamePasskeyMutation.status ===
                                                            "pending"
                                                    }
                                                    className="rounded bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 focus:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelRename}
                                                    disabled={
                                                        renamePasskeyMutation.status ===
                                                        "pending"
                                                    }
                                                    className="rounded border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {passkey.label}
                                                </h3>
                                                <div className="mt-1 text-xs text-gray-500">
                                                    <p>
                                                        Created:{" "}
                                                        {formatDate(
                                                            passkey.createdAt
                                                        )}
                                                    </p>
                                                    {passkey.lastUsedAt && (
                                                        <p>
                                                            Last used:{" "}
                                                            {formatDate(
                                                                passkey.lastUsedAt
                                                            )}
                                                        </p>
                                                    )}
                                                    <p>
                                                        Device:{" "}
                                                        {passkey.deviceType}
                                                    </p>
                                                    {passkey.transports.length >
                                                        0 && (
                                                        <p>
                                                            Methods:{" "}
                                                            {passkey.transports.join(
                                                                ", "
                                                            )}
                                                        </p>
                                                    )}
                                                    {passkey.backedUp && (
                                                        <p className="text-green-600">
                                                            ✓ Synced to cloud
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {renamingId !== passkey.id && (
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleRename(passkey)
                                                }
                                                className="rounded border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Rename
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(passkey.id)
                                                }
                                                disabled={
                                                    deletePasskeyMutation.status ===
                                                    "pending"
                                                }
                                                className="rounded bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 focus:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deletePasskeyMutation.status ===
                                                "pending"
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start space-x-3">
                    <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-blue-800">
                            About Passkeys
                        </h3>
                        <div className="mt-1 text-sm text-blue-700">
                            <p>
                                Passkeys are a secure, passwordless way to sign
                                in. They use your device&apos;s built-in
                                security features like fingerprint, face
                                recognition, or device PIN.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <Link
                    href="/home"
                    className="inline-flex items-center rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
