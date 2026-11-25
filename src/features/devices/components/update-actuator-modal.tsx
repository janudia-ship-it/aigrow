"use client";

import { useState, useEffect } from "react";
import { X, Sliders, Loader2, AlertCircle, Info } from "lucide-react";
import { updateActuator } from "../services/device-service";
import type { Actuator } from "../types/device";

interface UpdateActuatorModalProps {
    actuator: Actuator | null;
    isOpen: boolean;
    onClose: () => void;
    onActuatorUpdated: () => void;
}

export default function UpdateActuatorModal({
    actuator,
    isOpen,
    onClose,
    onActuatorUpdated,
}: UpdateActuatorModalProps) {
    const [name, setName] = useState(actuator?.name ?? "");
    const [channelIndex, setChannelIndex] = useState<number>(actuator?.channelIndex ?? 0);
    const [isRemoteEnabled, setIsRemoteEnabled] = useState<boolean>(actuator?.isRemoteEnabled ?? true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && actuator) {
            setName(actuator.name ?? "");
            setChannelIndex(actuator.channelIndex ?? 0);
            setIsRemoteEnabled(actuator.isRemoteEnabled ?? true);
            setError(null);
        }
    }, [isOpen, actuator]);

    if (!isOpen || !actuator) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmed = name.trim();
        if (!trimmed) {
            setError("Actuator name cannot be empty.");
            return;
        }

        if (trimmed.length > 64) {
            setError("Actuator name cannot exceed 64 characters.");
            return;
        }

        const channel = Number(channelIndex);
        if (Number.isNaN(channel) || channel < 0 || channel > 255) {
            setError("Channel index must be between 0 and 255.");
            return;
        }

        setSubmitting(true);
        try {
            await updateActuator(actuator.id, {
                name: trimmed,
                channelIndex: channel,
                isRemoteEnabled,
            });
            onActuatorUpdated();
            onClose();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to update actuator");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-actuator-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 shadow-xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto z-10">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3]">
                            <Sliders size={18} />
                        </div>
                        <div>
                            <h2
                                id="update-actuator-title"
                                className="text-base font-bold text-gray-900 dark:text-gray-100"
                            >
                                Update Actuator
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {actuator.name} (ID #{actuator.id})
                            </p>
                        </div>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Error message */}
                    {error && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span className="flex-1">{error}</span>
                        </div>
                    )}

                    {/* Actuator Type (read-only note) */}
                    <div className="rounded-xl bg-gray-50 dark:bg-[#1A1A1E] p-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                        <span>Actuator Type</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {actuator.actuatorType}
                        </span>
                    </div>

                    {/* Name input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Actuator Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={64}
                            placeholder="e.g. Irrigation Pump Main"
                            disabled={submitting}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Unique name among this device&apos;s actuators (max 64 characters).
                        </p>
                    </div>

                    {/* Channel Index */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Channel Index <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={255}
                            value={channelIndex}
                            onChange={(e) => setChannelIndex(Number(e.target.value))}
                            disabled={submitting}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Range: 0 – 255</p>
                    </div>

                    {/* Remote Enabled Toggle */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-[#EEF4F1]/40 dark:bg-[#142623]/40 p-3.5">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isRemoteEnabled}
                                onChange={(e) => setIsRemoteEnabled(e.target.checked)}
                                disabled={submitting}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-[#004C4B] dark:text-[#00E5A3] focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] accent-[#004C4B] dark:accent-[#00E5A3] cursor-pointer"
                            />
                            <div className="flex-1">
                                <span className="block text-xs font-semibold text-gray-800 dark:text-gray-200">
                                    Enable Remote Control
                                </span>
                                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    Allow switching and modifying control mode remotely from the app.
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Important Note */}
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                        <Info size={14} className="shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed">
                            Disabling remote control sets the control mode to <span className="font-semibold">Off</span> and removes any active override, stopping related rules and schedules.
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-full px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-5 py-2 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] disabled:opacity-50 transition cursor-pointer shadow-xs"
                        >
                            {submitting && <Loader2 size={13} className="animate-spin" />}
                            <span>{submitting ? "Updating..." : "Update Actuator"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
