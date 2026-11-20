"use client";

import { useState } from "react";
import { X, AlertTriangle, Cpu } from "lucide-react";
import type { DeviceSummary } from "../types/device";
import { deleteDevice } from "../services/device-service";

interface DeleteDeviceModalProps {
    device: {
        id: number;
        name: string;
        deviceType?: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onDeviceDeleted: () => void;
}

export default function DeleteDeviceModal({
    device,
    isOpen,
    onClose,
    onDeviceDeleted,
}: DeleteDeviceModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDelete = async () => {
        setError(null);
        setSubmitting(true);
        try {
            await deleteDevice(device.id);
            onDeviceDeleted();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete device");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-device-title"
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
                        <AlertTriangle className="text-red-500" size={20} />
                        <h2
                            id="delete-device-title"
                            className="text-lg font-semibold text-gray-800 dark:text-gray-100"
                        >
                            Delete Device
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
                    <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            {device.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {device.deviceType}
                        </p>
                    </div>
                </div>

                {/* Warning */}
                <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 space-y-1.5">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        This action is permanent and cannot be undone.
                    </p>
                    <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside space-y-0.5">
                        <li>All sensors and actuators will be deleted</li>
                        <li>Recipes, fertilizer tanks and feeds will be deleted</li>
                        <li>Sensor history will be retained</li>
                        <li>The MAC address and name can be reused</li>
                    </ul>
                    <p className="text-xs text-red-500 dark:text-red-400 pt-1">
                        Deletion is blocked if another device&apos;s auto rule uses this device&apos;s sensors.
                    </p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {device.name}
                    </span>
                    ?
                </p>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={submitting}
                        className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {submitting ? "Deleting…" : "Delete Device"}
                    </button>
                </div>
            </div>
        </div>
    );
}
