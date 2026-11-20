"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle, UserMinus } from "lucide-react";
import { removeFarmMember } from "../services/member-service";
import type { FarmMember } from "../types/member.types";

interface DeleteMemberModalProps {
    farmId: number;
    member: FarmMember | null;
    isOpen: boolean;
    onClose: () => void;
    onMemberDeleted: () => void;
}

export default function DeleteMemberModal({
    farmId,
    member,
    isOpen,
    onClose,
    onMemberDeleted,
}: DeleteMemberModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !member) return null;

    const handleDelete = async () => {
        try {
            setSubmitting(true);
            setError(null);
            await removeFarmMember(farmId, member.userId);

            onMemberDeleted();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove member");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle size={20} />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Remove Farm Member
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-600 dark:text-red-300 flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Confirmation Body */}
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <p>
                        Are you sure you want to remove{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            "{member.fullName || member.userName}"
                        </span>{" "}
                        from this farm?
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-2.5 rounded-xl">
                        This action will immediately revoke all farm and device permissions for this user.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-full border border-gray-300 dark:border-gray-700 px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Removing...</span>
                            </>
                        ) : (
                            <>
                                <UserMinus size={14} />
                                <span>Remove Member</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
