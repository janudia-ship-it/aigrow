"use client";

import { useState, useEffect } from "react";
import {
    X,
    Clock,
    AlertCircle,
    AlertTriangle,
    Loader2,
    ToggleLeft,
    ToggleRight,
    Zap,
    RotateCcw,
} from "lucide-react";
import { setActuatorOverride, clearActuatorOverride, setActuatorMode } from "../services/device-service";
import type { Actuator } from "../types/device";

interface SetActuatorOverrideModalProps {
    actuator: Actuator | null;
    isOpen: boolean;
    onClose: () => void;
    onOverrideSet: () => void;
}

type DurationOption = "none" | "15m" | "30m" | "1h" | "4h" | "24h" | "custom";

export default function SetActuatorOverrideModal({
    actuator,
    isOpen,
    onClose,
    onOverrideSet,
}: SetActuatorOverrideModalProps) {
    const [overrideState, setOverrideState] = useState<boolean>(true);
    const [durationOption, setDurationOption] = useState<DurationOption>("none");
    const [customDateTime, setCustomDateTime] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [switchingMode, setSwitchingMode] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isManualMode =
        actuator?.controlMode?.toLowerCase() === "on" ||
        actuator?.controlMode?.toLowerCase() === "off";

    const isRemoteDisabled = !actuator?.isRemoteEnabled;

    useEffect(() => {
        if (isOpen && actuator) {
            setError(null);
            // Default target override state: opposite of current value, or true
            setOverrideState(actuator.value === 1 ? false : true);
            setDurationOption("none");
            setCustomDateTime("");
        }
    }, [isOpen, actuator]);

    if (!isOpen || !actuator) return null;

    // Calculate maximum allowed custom date (at most 7 days ahead)
    const now = new Date();
    const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const maxDateTimeString = maxDate.toISOString().slice(0, 16);
    const minDateTimeString = now.toISOString().slice(0, 16);

    const computeExpiresAt = (): string | null => {
        if (durationOption === "none") return null;

        const base = new Date();
        let target: Date;

        switch (durationOption) {
            case "15m":
                target = new Date(base.getTime() + 15 * 60 * 1000);
                break;
            case "30m":
                target = new Date(base.getTime() + 30 * 60 * 1000);
                break;
            case "1h":
                target = new Date(base.getTime() + 60 * 60 * 1000);
                break;
            case "4h":
                target = new Date(base.getTime() + 4 * 60 * 60 * 1000);
                break;
            case "24h":
                target = new Date(base.getTime() + 24 * 60 * 60 * 1000);
                break;
            case "custom":
                if (!customDateTime) {
                    throw new Error("Please select a custom expiration date and time.");
                }
                target = new Date(customDateTime);
                if (isNaN(target.getTime())) {
                    throw new Error("Invalid custom expiration date and time.");
                }
                if (target <= base) {
                    throw new Error("Expiration must be in the future.");
                }
                if (target > maxDate) {
                    throw new Error("Expiration cannot be more than 7 days ahead.");
                }
                break;
            default:
                return null;
        }

        // Return ISO string ending in Z (UTC)
        return target.toISOString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isRemoteDisabled) {
            setError("Remote control is disabled for this actuator.");
            return;
        }

        if (!isManualMode) {
            setError(
                `Overrides require manual mode ('On' or 'Off'). Actuator is currently in '${actuator.controlMode}' mode.`
            );
            return;
        }

        let expiresAt: string | null = null;
        try {
            expiresAt = computeExpiresAt();
        } catch (validationErr: any) {
            setError(validationErr.message);
            return;
        }

        setSubmitting(true);
        try {
            await setActuatorOverride(actuator.id, {
                state: overrideState,
                expiresAt,
            });
            onOverrideSet();
            onClose();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to set actuator override");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClearActiveOverride = async () => {
        setError(null);
        setClearing(true);
        try {
            await clearActuatorOverride(actuator.id, actuator.controlMode);
            onOverrideSet();
            onClose();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to clear active override");
        } finally {
            setClearing(false);
        }
    };

    const handleSwitchToManual = async (targetMode: "On" | "Off") => {
        setError(null);
        setSwitchingMode(true);
        try {
            await setActuatorMode(actuator.id, targetMode);
            onOverrideSet();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to switch mode");
        } finally {
            setSwitchingMode(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="set-actuator-override-title"
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
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                            <Zap size={18} />
                        </div>
                        <div>
                            <h3
                                id="set-actuator-override-title"
                                className="text-base font-bold text-gray-900 dark:text-gray-100"
                            >
                                Set Manual Override
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {actuator.name} (ID #{actuator.id})
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting || clearing}
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

                    {/* Mode Notice & Requirements */}
                    {!isManualMode ? (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3.5 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                                <span className="leading-snug">
                                    Overrides require manual mode (<strong>&quot;On&quot;</strong> or <strong>&quot;Off&quot;</strong>). Currently in <strong>&quot;{actuator.controlMode}&quot;</strong> mode.
                                </span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleSwitchToManual("Off")}
                                    disabled={switchingMode || isRemoteDisabled}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#1A1A1E] border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
                                >
                                    {switchingMode ? "Switching..." : "Switch to Manual Off"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSwitchToManual("On")}
                                    disabled={switchingMode || isRemoteDisabled}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#1A1A1E] border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
                                >
                                    {switchingMode ? "Switching..." : "Switch to Manual On"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl bg-gray-50 dark:bg-[#1A1A1E] p-2.5 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                            <span>Current Control Mode</span>
                            <span className="font-semibold px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                {actuator.controlMode}
                            </span>
                        </div>
                    )}

                    {/* Remote Disabled Advisory */}
                    {isRemoteDisabled && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span>
                                Remote control is disabled for this actuator. Overrides cannot be set while remote control is disabled.
                            </span>
                        </div>
                    )}

                    {/* Active Override Indicator with Clear Action */}
                    {actuator.override && (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                            <div>
                                <span className="font-semibold block">
                                    Active Override: {actuator.override.state ? "FORCE ON" : "FORCE OFF"}
                                </span>
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">
                                    {actuator.override.expiresAt
                                        ? `Expires at ${new Date(actuator.override.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                        : "Permanent until manually cleared"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleClearActiveOverride}
                                disabled={clearing || submitting}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-300 transition cursor-pointer"
                            >
                                {clearing ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <RotateCcw size={12} />
                                )}
                                <span>Clear Override</span>
                            </button>
                        </div>
                    )}

                    {/* Override Target State (ON vs OFF) */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Override State <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setOverrideState(true)}
                                disabled={!isManualMode || isRemoteDisabled}
                                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                                    overrideState === true
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500"
                                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1E] text-gray-600 dark:text-gray-300 hover:border-gray-300"
                                } ${!isManualMode || isRemoteDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <ToggleRight size={20} className={overrideState === true ? "text-emerald-600" : "text-gray-400"} />
                                <span className="text-xs font-bold">FORCE ON</span>
                                <span className="text-[10px] text-gray-500">Run device now</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setOverrideState(false)}
                                disabled={!isManualMode || isRemoteDisabled}
                                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                                    overrideState === false
                                        ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 ring-1 ring-red-500"
                                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1E] text-gray-600 dark:text-gray-300 hover:border-gray-300"
                                } ${!isManualMode || isRemoteDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <ToggleLeft size={20} className={overrideState === false ? "text-red-600" : "text-gray-400"} />
                                <span className="text-xs font-bold">FORCE OFF</span>
                                <span className="text-[10px] text-gray-500">Stop device now</span>
                            </button>
                        </div>
                    </div>

                    {/* Expiration Preset Options */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                            <span>Override Duration</span>
                            <span className="text-[10px] text-gray-400 font-normal">Max: 7 days</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            {[
                                { key: "none", label: "Until Cleared" },
                                { key: "15m", label: "15 min" },
                                { key: "30m", label: "30 min" },
                                { key: "1h", label: "1 hour" },
                                { key: "4h", label: "4 hours" },
                                { key: "24h", label: "24 hours" },
                            ].map((preset) => (
                                <button
                                    key={preset.key}
                                    type="button"
                                    onClick={() => setDurationOption(preset.key as DurationOption)}
                                    disabled={!isManualMode || isRemoteDisabled}
                                    className={`py-2 px-2.5 rounded-lg border text-center transition cursor-pointer font-medium ${
                                        durationOption === preset.key
                                            ? "border-[#004C4B] dark:border-[#00E5A3] bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3] font-semibold"
                                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1E] text-gray-700 dark:text-gray-300 hover:border-gray-300"
                                    } ${!isManualMode || isRemoteDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Expiry Option */}
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={() => setDurationOption("custom")}
                                disabled={!isManualMode || isRemoteDisabled}
                                className={`w-full py-1.5 px-3 rounded-lg border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                                    durationOption === "custom"
                                        ? "border-[#004C4B] dark:border-[#00E5A3] bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3] font-semibold"
                                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1E] text-gray-700 dark:text-gray-300 hover:border-gray-300"
                                } ${!isManualMode || isRemoteDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <span className="flex items-center gap-1.5">
                                    <Clock size={13} />
                                    Custom Expiration Time
                                </span>
                                <span className="text-[10px] text-gray-400">Specify date/time</span>
                            </button>

                            {durationOption === "custom" && (
                                <div className="mt-2 pl-1">
                                    <input
                                        type="datetime-local"
                                        min={minDateTimeString}
                                        max={maxDateTimeString}
                                        value={customDateTime}
                                        onChange={(e) => setCustomDateTime(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Must be in the future and at most 7 days ahead.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-400 italic">
                        * A new override replaces any active override. Changing the actuator control mode will also remove the override.
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting || clearing}
                            className="rounded-full px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || clearing || !isManualMode || isRemoteDisabled}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-5 py-2 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] disabled:opacity-50 transition cursor-pointer shadow-xs"
                        >
                            {submitting && <Loader2 size={13} className="animate-spin" />}
                            <span>{submitting ? "Applying..." : "Apply Override"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
