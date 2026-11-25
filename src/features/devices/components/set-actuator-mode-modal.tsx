"use client";

import { useState, useEffect } from "react";
import {
    X,
    Sliders,
    Power,
    Play,
    Cpu,
    Calendar,
    AlertCircle,
    AlertTriangle,
    Loader2,
    Check,
} from "lucide-react";
import { setActuatorMode } from "../services/device-service";
import type { Actuator, ActuatorControlMode } from "../types/device";

interface SetActuatorModeModalProps {
    actuator: Actuator | null;
    isOpen: boolean;
    onClose: () => void;
    onModeChanged: () => void;
}

const MODES: {
    key: ActuatorControlMode;
    label: string;
    description: string;
    icon: typeof Power;
    badgeClass: string;
}[] = [
    {
        key: "Off",
        label: "Manual Off",
        description: "Turns the actuator off and keeps it off manually.",
        icon: Power,
        badgeClass: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    },
    {
        key: "On",
        label: "Manual On",
        description: "Turns the actuator on and keeps it running continuously.",
        icon: Play,
        badgeClass: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
    },
    {
        key: "Auto",
        label: "Auto (Rules)",
        description: "Actuator is automatically driven by sensor triggers and automation rules.",
        icon: Cpu,
        badgeClass: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
    },
    {
        key: "Schedule",
        label: "Schedule",
        description: "Actuator follows programmed recurring timers and daily time windows.",
        icon: Calendar,
        badgeClass: "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400",
    },
];

export default function SetActuatorModeModal({
    actuator,
    isOpen,
    onClose,
    onModeChanged,
}: SetActuatorModeModalProps) {
    const [selectedMode, setSelectedMode] = useState<ActuatorControlMode>("Off");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && actuator) {
            setError(null);
            const current = actuator.controlMode?.trim();
            const matched = MODES.find(
                (m) => m.key.toLowerCase() === current?.toLowerCase()
            );
            setSelectedMode(matched ? matched.key : "Off");
        }
    }, [isOpen, actuator]);

    if (!isOpen || !actuator) return null;

    const isRemoteDisabled = !actuator.isRemoteEnabled;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isRemoteDisabled) {
            setError(
                "Remote control is disabled for this actuator. You must enable remote control before changing modes."
            );
            return;
        }

        setSubmitting(true);
        try {
            await setActuatorMode(actuator.id, selectedMode);
            onModeChanged();
            onClose();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to change actuator mode");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="set-actuator-mode-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl z-10 transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3]">
                            <Sliders size={18} />
                        </div>
                        <div>
                            <h3
                                id="set-actuator-mode-title"
                                className="text-base font-bold text-gray-900 dark:text-gray-100"
                            >
                                Set Control Mode
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {actuator.name} (ID #{actuator.id})
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Error Banner */}
                    {error && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span className="flex-1">{error}</span>
                        </div>
                    )}

                    {/* Remote Disabled Warning */}
                    {isRemoteDisabled && (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-relaxed">
                                <strong>Remote control is disabled.</strong> You cannot change the control mode until remote control is enabled via <em>Update Actuator</em>.
                            </span>
                        </div>
                    )}

                    {/* Mode Selection Cards */}
                    <div className="space-y-2.5">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Select Mode
                        </label>
                        {MODES.map((m) => {
                            const isSelected = selectedMode === m.key;
                            const isCurrent =
                                actuator.controlMode?.toLowerCase() === m.key.toLowerCase();
                            const IconComponent = m.icon;

                            return (
                                <button
                                    key={m.key}
                                    type="button"
                                    disabled={submitting || isRemoteDisabled}
                                    onClick={() => setSelectedMode(m.key)}
                                    className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                                        isSelected
                                            ? "border-[#004C4B] dark:border-[#00E5A3] bg-[#E8F2EF]/60 dark:bg-[#142623]/60 ring-1 ring-[#004C4B] dark:ring-[#00E5A3]"
                                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1E] hover:border-gray-300 dark:hover:border-gray-700"
                                    } ${isRemoteDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    <div
                                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                            isSelected
                                                ? "bg-[#004C4B] text-white dark:bg-[#00E5A3] dark:text-[#001A1A]"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                        }`}
                                    >
                                        <IconComponent size={16} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                                {m.label}
                                            </span>
                                            {isCurrent && (
                                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                            {m.description}
                                        </p>
                                    </div>

                                    {isSelected && (
                                        <div className="text-[#004C4B] dark:text-[#00E5A3] shrink-0 self-center">
                                            <Check size={16} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Override Notice */}
                    {actuator.override && (
                        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 p-2.5 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                            <span className="text-[11px] leading-relaxed">
                                ℹ️ This actuator has an active override. Changing the mode will automatically remove the active override.
                            </span>
                        </div>
                    )}

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
                            type="submit"
                            disabled={submitting || isRemoteDisabled}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-5 py-2 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] disabled:opacity-50 transition cursor-pointer shadow-xs"
                        >
                            {submitting && <Loader2 size={13} className="animate-spin" />}
                            <span>{submitting ? "Saving Mode..." : "Apply Mode"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
