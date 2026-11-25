"use client";

import { useState } from "react";
import { Trash2, AlertCircle, Loader2, X } from "lucide-react";
import { deleteActuator } from "../services/device-service";
import type { Actuator } from "../types/device";

interface DeleteActuatorModalProps {
    actuator: Actuator | null;
    isOpen: boolean;
    onClose: () => void;
    onActuatorDeleted: () => void;
}

export default function DeleteActuatorModal({
    actuator,
    isOpen,
    onClose,
    onActuatorDeleted,
}: DeleteActuatorModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !actuator) return null;

    const handleDelete = async () => {
        setError(null);
        setSubmitting(true);
        try {
            await deleteActuator(actuator.id);
            onActuatorDeleted();
            onClose();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to delete actuator");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-actuator-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl z-10 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                            <Trash2 size={18} />
                        </div>
                        <div>
                            <h3
                                id="delete-actuator-title"
                                className="text-base font-bold text-gray-900 dark:text-gray-100"
                            >
                                Delete Actuator
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Permanent removal from device
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                        className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-4 space-y-4">
                    {/* Error Banner */}
                    {error && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span className="flex-1">{error}</span>
                        </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            &quot;{actuator.name}&quot;
                        </span>{" "}
                        (ID #{actuator.id})?
                    </p>

                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                        <p className="font-semibold">Important Notes:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                            <li>Its active override, auto rules, and schedules will be removed.</li>
                            <li>Its history is preserved.</li>
                            <li>Its name and channel can be reused by another actuator.</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-full px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition cursor-pointer shadow-xs"
                        >
                            {submitting && <Loader2 size={13} className="animate-spin" />}
                            <span>{submitting ? "Deleting..." : "Delete Actuator"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
