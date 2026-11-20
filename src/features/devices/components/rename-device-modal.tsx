"use client";

import { useState, useEffect } from "react";
import { X, Tag, Cpu } from "lucide-react";
import { renameDevice } from "../services/device-service";

interface RenameDeviceModalProps {
    device: {
        id: number;
        name: string;
        deviceType?: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onDeviceRenamed: () => void;
}

export default function RenameDeviceModal({
    device,
    isOpen,
    onClose,
    onDeviceRenamed,
}: RenameDeviceModalProps) {
    const [name, setName] = useState(device.name ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName(device.name ?? "");
            setError(null);
        }
    }, [isOpen, device]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmed = name.trim();
        if (!trimmed) {
            setError("Device name cannot be empty.");
            return;
        }

        if (trimmed.length > 64) {
            setError("Device name cannot exceed 64 characters.");
            return;
        }

        if (trimmed === device.name) {
            onClose();
            return;
        }

        setSubmitting(true);
        try {
            await renameDevice(device.id, trimmed);
            onDeviceRenamed();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to rename device");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-device-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 shadow-xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Tag className="text-[#004C4B] dark:text-[#00E5A3]" size={20} />
                        <h2
                            id="rename-device-title"
                            className="text-lg font-semibold text-[#004C4B] dark:text-[#00E5A3]"
                        >
                            Rename Device
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Device Info */}
                <div className="mb-5 rounded-xl bg-[#EEF4F1] dark:bg-[#142623] px-4 py-3 flex items-center gap-3">
                    <Cpu className="text-[#004C4B] dark:text-[#00E5A3] shrink-0" size={18} />
                    <div className="min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Current Name</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {device.name}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Device Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={64}
                            required
                            placeholder="Enter new device name"
                            autoFocus
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] transition"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                            <span>Must be unique among this farm&apos;s devices</span>
                            <span>{name.length}/64</span>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="flex-1 rounded-xl bg-[#004C4B] dark:bg-[#00E5A3] px-4 py-2.5 text-sm font-medium text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {submitting ? "Saving…" : "Save Name"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
