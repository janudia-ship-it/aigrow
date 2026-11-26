"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    MoreVertical,
    Tag,
    MapPin,
    Trash2,
    Settings2,
    Sliders,
    Calendar,
    History,
    ToggleLeft,
    ToggleRight,
    Loader2,
    Zap,
    RotateCcw,
    Clock,
} from "lucide-react";
import type { Actuator, ActuatorType } from "../types/device";
import { setActuatorMode, setActuatorOverride, deleteActuatorOverride } from "../services/device-service";
import ActuatorRulesModal from "./actuator-rules-modal";
import ActuatorSchedulesModal from "./actuator-schedules-modal";

interface ActuatorCardProps {
    actuator: Actuator;
    actuatorTypeInfo?: ActuatorType | null;
    canManage: boolean;
    isAdmin?: boolean;
    deviceId?: number;
    onRename: (actuator: Actuator) => void;
    onUpdateActuator?: (actuator: Actuator) => void;
    onUpdateArea?: (actuator: Actuator) => void;
    onDelete?: (actuator: Actuator) => void;
    onModeChanged?: () => void;
}

export default function ActuatorCard({
    actuator,
    actuatorTypeInfo,
    canManage,
    isAdmin = false,
    deviceId,
    onRename,
    onUpdateActuator,
    onUpdateArea,
    onDelete,
    onModeChanged,
}: ActuatorCardProps) {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [changingMode, setChangingMode] = useState(false);
    const [clearingOverride, setClearingOverride] = useState(false);
    const [settingOverride, setSettingOverride] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [isSchedulesOpen, setIsSchedulesOpen] = useState(false);
    const [modeError, setModeError] = useState<string | null>(null);
    const [localMode, setLocalMode] = useState<string>(actuator.controlMode);
    const [localValue, setLocalValue] = useState<number | null>(actuator.value);
    const menuRef = useRef<HTMLDivElement>(null);

    // Inline override panel: what the user has selected to apply
    const [overrideState, setOverrideState] = useState<boolean>(actuator.override?.state ?? true);
    const [overrideDuration, setOverrideDuration] = useState<number | null>(null);

    // The currently APPLIED override state (null = no active override).
    // Maintained separately so Current State can reflect it immediately,
    // independently of server round-trips.
    const [appliedOverrideState, setAppliedOverrideState] = useState<boolean | null>(
        actuator.override?.state ?? null
    );

    const DURATION_PRESETS = [
        { label: "Until Cleared", minutes: null },
        { label: "15m", minutes: 15 },
        { label: "30m", minutes: 30 },
        { label: "1h", minutes: 60 },
        { label: "4h", minutes: 240 },
        { label: "24h", minutes: 1440 },
    ] as const;

    // Sync local state whenever fresh actuator data arrives from the parent.
    useEffect(() => {
        setLocalMode(actuator.controlMode);
        setLocalValue(actuator.value);
        setAppliedOverrideState(actuator.override?.state ?? null);
    }, [actuator.controlMode, actuator.value, actuator.override]);

    const normalizedMode = localMode?.toLowerCase() ?? "off";
    const isManualMode = normalizedMode === "on" || normalizedMode === "off";
    const isManualOn = normalizedMode === "on";
    const hasActiveOverride = appliedOverrideState !== null;

    // Priority: active override > manual mode > raw sensor value (Auto/Schedule)
    const isOn = hasActiveOverride
        ? appliedOverrideState          // override is active — it wins
        : isManualMode
            ? isManualOn                // Manual On/Off — mode IS the state
            : localValue === 1;         // Auto/Schedule — live sensor reading

    const displayName = actuatorTypeInfo?.displayName || actuator.actuatorType;
    const showMenu = isAdmin || canManage;

    const handleGoToHistory = () => {
        if (deviceId) {
            router.push(`/devices/${deviceId}/actuators/${actuator.id}/history`);
        } else {
            router.push(`/actuators/${actuator.id}/history`);
        }
    };

    const handleClearOverride = async () => {
        const prevApplied = appliedOverrideState;
        setClearingOverride(true);
        // Optimistically remove override — restore underlying mode/sensor state
        setAppliedOverrideState(null);
        try {
            await deleteActuatorOverride(actuator.id);
            onModeChanged?.();
        } catch (err: unknown) {
            // Rollback
            setAppliedOverrideState(prevApplied);
            setModeError(err instanceof Error ? err.message : "Failed to clear override");
        } finally {
            setClearingOverride(false);
        }
    };

    const handleApplyOverride = async () => {
        const prevApplied = appliedOverrideState;
        setSettingOverride(true);
        setModeError(null);
        // Optimistically update Current State immediately
        setAppliedOverrideState(overrideState);
        try {
            const expiresAt = overrideDuration !== null
                ? new Date(Date.now() + overrideDuration * 60 * 1000).toISOString()
                : null;
            await setActuatorOverride(actuator.id, { state: overrideState, expiresAt });
            onModeChanged?.();
        } catch (err: unknown) {
            // Rollback on failure
            setAppliedOverrideState(prevApplied);
            setModeError(err instanceof Error ? err.message : "Failed to apply override");
        } finally {
            setSettingOverride(false);
        }
    };

    const handleQuickModeChange = async (newMode: "Off" | "On" | "Auto" | "Schedule") => {
        if (newMode.toLowerCase() === localMode?.toLowerCase()) return;
        setModeError(null);

        if (!actuator.isRemoteEnabled) {
            setModeError("Remote control is disabled");
            return;
        }

        const prevMode = localMode;
        const prevValue = localValue;
        const prevAppliedOverride = appliedOverrideState;

        // Optimistically update mode & current state when switching Manual On / Off
        setLocalMode(newMode);
        // Changing mode removes active override per API contract
        setAppliedOverrideState(null);
        if (newMode === "On") {
            setLocalValue(1);
        } else if (newMode === "Off") {
            setLocalValue(0);
        }

        setChangingMode(true);
        try {
            await setActuatorMode(actuator.id, newMode);
            onModeChanged?.();
        } catch (err: unknown) {
            setLocalMode(prevMode);
            setLocalValue(prevValue);
            setAppliedOverrideState(prevAppliedOverride);
            setModeError(err instanceof Error ? err.message : "Failed to change mode");
        } finally {
            setChangingMode(false);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        if (!menuOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-[#EEF4F1]/60 dark:bg-[#142623]/60 p-4 transition hover:border-[#004C4B]/40 dark:hover:border-[#00E5A3]/40 space-y-3 relative">
            {/* Header: Type, ID, and Action Menu */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-[#DCE7E1] text-[#2D5A46] dark:bg-[#203D36] dark:text-[#A7F3D0] w-fit truncate">
                        {displayName}
                    </span>
                    {actuatorTypeInfo?.displayName &&
                        actuatorTypeInfo.displayName.toLowerCase() !==
                        actuator.actuatorType.toLowerCase() && (
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5 pl-1 truncate">
                                {actuator.actuatorType}
                            </span>
                        )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-gray-400">
                        ID: #{actuator.id}
                    </span>
                    {/* Vertical Dots Button */}
                    {showMenu && (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen((prev) => !prev);
                                }}
                                aria-label="Actuator options"
                                className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800 cursor-pointer transition"
                            >
                                <MoreVertical size={14} />
                            </button>

                            {menuOpen && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-xl py-1.5 z-30"
                                >
                                    {/* Auto Rules Option in Menu */}
                                    {/* <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setIsRulesOpen(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                    >
                                        <Sliders size={12} />
                                        <span>Auto Rules</span>
                                    </button> */}

                                    {/* Schedules Option in Menu */}
                                    {/* <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setIsSchedulesOpen(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                    >
                                        <Calendar size={12} />
                                        <span>Schedules</span>
                                    </button> */}
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onUpdateActuator?.(actuator);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                        >
                                            <Settings2 size={12} />
                                            <span>Update Actuator</span>
                                        </button>
                                    )}

                                    {/* Clear Override if active */}
                                    {hasActiveOverride && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                handleClearOverride();
                                            }}
                                            disabled={clearingOverride}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition text-left cursor-pointer disabled:opacity-50"
                                        >
                                            <RotateCcw size={12} />
                                            <span>Clear Override</span>
                                        </button>
                                    )}

                                    {/* Rename Actuator (accessible by Admin, SuperAdmin, or Device Manager) */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onRename(actuator);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                    >
                                        <Tag size={12} />
                                        <span>Rename Actuator</span>
                                    </button>

                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onUpdateArea?.(actuator);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                        >
                                            <MapPin size={12} />
                                            <span>Update Actuator Areas</span>
                                        </button>
                                    )}

                                    {isAdmin && (
                                        <>
                                            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    onDelete?.(actuator);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                            >
                                                <Trash2 size={12} />
                                                <span>Delete Actuator</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Actuator Name & Control Mode */}
            <div className="space-y-2.5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {actuator.name}
                </p>

                {/* Mode Segmented Toggle: Manual | Auto | Schedule */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                            Control Mode
                        </span>
                        {changingMode && (
                            <Loader2
                                size={12}
                                className="animate-spin text-[#004C4B] dark:text-[#00E5A3]"
                            />
                        )}
                    </div>

                    {canManage ? (
                        <div
                            className="grid grid-cols-3 gap-1 rounded-xl bg-white/80 dark:bg-[#1A1A1E] p-1 border border-gray-200 dark:border-gray-800"
                            title={
                                !actuator.isRemoteEnabled
                                    ? "Remote control is disabled"
                                    : "Select control mode"
                            }
                        >
                            <button
                                type="button"
                                disabled={changingMode || !actuator.isRemoteEnabled}
                                onClick={() => {
                                    if (!isManualMode) {
                                        handleQuickModeChange(isOn ? "On" : "Off");
                                    }
                                }}
                                className={`rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isManualMode
                                    ? "bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] shadow-xs"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                Manual
                            </button>
                            <button
                                type="button"
                                disabled={changingMode || !actuator.isRemoteEnabled}
                                onClick={() => handleQuickModeChange("Auto")}
                                className={`rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${normalizedMode === "auto"
                                    ? "bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] shadow-xs"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                Auto
                            </button>
                            <button
                                type="button"
                                disabled={changingMode || !actuator.isRemoteEnabled}
                                onClick={() => handleQuickModeChange("Schedule")}
                                className={`rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${normalizedMode === "schedule"
                                    ? "bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] shadow-xs"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                Schedule
                            </button>
                        </div>
                    ) : (
                        <span className="inline-block text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {isManualMode ? `Manual (${localMode})` : localMode}
                        </span>
                    )}

                    {/* Manual Off / On Toggle (shown when Manual mode is active) */}
                    {canManage && isManualMode && (
                        <div className="flex items-center justify-between rounded-xl bg-white/70 dark:bg-[#1A1A1E]/80 px-3 py-2 border border-gray-200/80 dark:border-gray-800">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                Manual Control
                            </span>
                            <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    disabled={changingMode || !actuator.isRemoteEnabled}
                                    onClick={() => handleQuickModeChange("Off")}
                                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${!isManualOn
                                        ? "bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900 shadow-xs"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        }`}
                                >
                                    OFF
                                </button>
                                <button
                                    type="button"
                                    disabled={changingMode || !actuator.isRemoteEnabled}
                                    onClick={() => handleQuickModeChange("On")}
                                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isManualOn
                                        ? "bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] shadow-xs"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        }`}
                                >
                                    ON
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* <div className="flex flex-row gap-5">
                    {/* Rules Button */}
                {/* <button
                    type="button"
                    onClick={() => setIsRulesOpen(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#004C4B]/25 dark:border-[#00E5A3]/30 bg-white dark:bg-[#1A1A1E] text-[11px] font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer shadow-2xs"
                    title="Configure Auto Rules"
                >
                    <Sliders size={11} />
                    <span>Rules</span>
                </button> */}

                {/* Schedule Button */}
                {/* <button
                    type="button"
                    onClick={() => setIsSchedulesOpen(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#004C4B]/25 dark:border-[#00E5A3]/30 bg-white dark:bg-[#1A1A1E] text-[11px] font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer shadow-2xs"
                    title="Configure Actuator Schedules"
                >
                    <Calendar size={11} />
                    <span>Schedule</span>
                </button> */}

                {/* History Button */}
                {/* <button
                    type="button"
                    onClick={handleGoToHistory}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#004C4B]/25 dark:border-[#00E5A3]/30 bg-white dark:bg-[#1A1A1E] text-[11px] font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer shadow-2xs"
                    title="View Actuator History"
                >
                    <History size={11} />
                    <span>History</span>
                </button>
            </div> */}

                <div className="flex flex-wrap items-center gap-2">
                    {/* Rules Button */}
                    <button
                        type="button"
                        onClick={() => setIsRulesOpen(true)}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#004C4B]/20 bg-white px-3 text-xs font-medium text-[#004C4B] shadow-sm transition-all duration-200 hover:border-[#004C4B]/50 hover:bg-[#E8F2EF] hover:shadow-md active:scale-95 dark:border-[#00E5A3]/25 dark:bg-[#1A1A1E] dark:text-[#00E5A3] dark:hover:bg-[#102A27] cursor-pointer"
                        title="Configure Auto Rules"
                    >
                        <Sliders size={14} />
                        <span>Rules</span>
                    </button>

                    {/* Schedule Button */}
                    <button
                        type="button"
                        onClick={() => setIsSchedulesOpen(true)}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#004C4B]/20 bg-white px-3 text-xs font-medium text-[#004C4B] shadow-sm transition-all duration-200 hover:border-[#004C4B]/50 hover:bg-[#E8F2EF] hover:shadow-md active:scale-95 dark:border-[#00E5A3]/25 dark:bg-[#1A1A1E] dark:text-[#00E5A3] dark:hover:bg-[#102A27] cursor-pointer"
                        title="Configure Actuator Schedules"
                    >
                        <Calendar size={14} />
                        <span>Schedule</span>
                    </button>

                    {/* History Button */}
                    <button
                        type="button"
                        onClick={handleGoToHistory}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#004C4B]/20 bg-white px-3 text-xs font-medium text-[#004C4B] shadow-sm transition-all duration-200 hover:border-[#004C4B]/50 hover:bg-[#E8F2EF] hover:shadow-md active:scale-95 dark:border-[#00E5A3]/25 dark:bg-[#1A1A1E] dark:text-[#00E5A3] dark:hover:bg-[#102A27] cursor-pointer"
                        title="View Actuator History"
                    >
                        <History size={14} />
                        <span>History</span>
                    </button>
                </div>


                {/* Inline Override Panel — shown when Manual mode is active */}
                {canManage && isManualMode && actuator.isRemoteEnabled && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/20 p-3 space-y-2.5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                <Zap size={12} />
                                Manual Override
                            </span>
                            {hasActiveOverride && (
                                <span className="text-[10px] font-semibold bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                                    Active: {appliedOverrideState ? "ON" : "OFF"}
                                </span>
                            )}
                        </div>

                        {/* Override State Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">State:</span>
                            <div className="inline-flex items-center rounded-full bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-gray-700 p-0.5 gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => setOverrideState(false)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer ${!overrideState
                                        ? "bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        }`}
                                >
                                    OFF
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOverrideState(true)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer ${overrideState
                                        ? "bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A]"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        }`}
                                >
                                    ON
                                </button>
                            </div>
                        </div>

                        {/* Duration Presets */}
                        <div className="space-y-1">
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                <Clock size={10} /> Duration:
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {DURATION_PRESETS.map((p) => (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => setOverrideDuration(p.minutes)}
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition cursor-pointer ${overrideDuration === p.minutes
                                            ? "bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] border-[#004C4B] dark:border-[#00E5A3]"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#004C4B] dark:hover:border-[#00E5A3]"
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Apply + Clear buttons */}
                        <div className="flex items-center gap-2 pt-0.5">
                            <button
                                type="button"
                                onClick={handleApplyOverride}
                                disabled={settingOverride || clearingOverride}
                                className="flex-1 py-1.5 rounded-lg bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] text-[11px] font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {settingOverride ? "Applying…" : "Apply Override"}
                            </button>
                            {hasActiveOverride && (
                                <button
                                    type="button"
                                    onClick={handleClearOverride}
                                    disabled={clearingOverride || settingOverride}
                                    className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-[11px] font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {clearingOverride ? "Clearing…" : "Clear"}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {modeError && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">{modeError}</p>
                )}
            </div>

            {/* Current State */}
            <div className="pt-2 border-t border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current State</span>
                {localValue !== null ? (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isOn
                            ? "bg-[#D7E8DF] text-[#1E5440] dark:bg-[#1C3A32] dark:text-[#6EE7B7]"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                    >
                        {isOn ? (
                            <>
                                <ToggleRight size={14} /> ON
                            </>
                        ) : (
                            <>
                                <ToggleLeft size={14} /> OFF
                            </>
                        )}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400">—</span>
                )}
            </div>

            {/* Remote Enabled + Override Details */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-1 flex-wrap gap-1">
                <span>Remote: {actuator.isRemoteEnabled ? "Enabled" : "Disabled"}</span>
                {hasActiveOverride && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                            Override: {appliedOverrideState ? "ON" : "OFF"}
                        </span>
                        {canManage && (
                            <button
                                type="button"
                                onClick={handleClearOverride}
                                disabled={clearingOverride}
                                className="text-[10px] text-red-500 hover:text-red-700 dark:hover:text-red-300 underline cursor-pointer disabled:opacity-50"
                                title="Clear active override"
                            >
                                {clearingOverride ? "Clearing..." : "Clear"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Actuator Auto Rules Modal */}
            <ActuatorRulesModal
                actuator={actuator}
                isOpen={isRulesOpen}
                canManage={canManage}
                onClose={() => setIsRulesOpen(false)}
                onRulesChanged={onModeChanged}
            />

            {/* Actuator Schedules Modal */}
            <ActuatorSchedulesModal
                actuator={actuator}
                isOpen={isSchedulesOpen}
                canManage={canManage}
                onClose={() => setIsSchedulesOpen(false)}
                onSchedulesChanged={onModeChanged}
            />
        </div >
    );
}
