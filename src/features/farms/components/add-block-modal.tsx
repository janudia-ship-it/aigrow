"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle, Plus, LayoutGrid } from "lucide-react";
import { createZoneBlock } from "../services/zone-service";
import type { Zone } from "../types/zone.types";

interface AddBlockModalProps {
    zone: Zone | null;
    isOpen: boolean;
    onClose: () => void;
    onBlockCreated: () => void;
}

export default function AddBlockModal({
    zone,
    isOpen,
    onClose,
    onBlockCreated,
}: AddBlockModalProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !zone) return null;

    const handleClose = () => {
        setName("");
        setError(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Block name is required.");
            return;
        }

        try {
            setLoading(true);
            await createZoneBlock(zone.id, {
                name: trimmedName.slice(0, 64),
            });

            setName("");
            onBlockCreated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create block");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#004C4B] dark:text-[#00E5A3]">
                            Add Block
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        aria-label="Close"
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Zone Target Info */}
                <div className="mt-4 p-3 rounded-xl bg-[#FAFBF9] dark:bg-[#161618] border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400">Target Zone</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {zone.name}
                        </p>
                    </div>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#E8F2EF] dark:bg-[#102A27] text-[#004C4B] dark:text-[#00E5A3]">
                        {zone.zoneType || (zone.isOpenField ? "Open Field" : "Protected")}
                    </span>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-600 dark:text-red-300 flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Block Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Block Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={64}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Block 1 / North Section"
                            required
                            disabled={loading}
                            autoFocus
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Name must be unique within this zone (max 64 characters).
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-full border border-gray-300 dark:border-gray-700 px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] hover:bg-[#003B3A] text-white px-5 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={14} />
                                    <span>Create Block</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
