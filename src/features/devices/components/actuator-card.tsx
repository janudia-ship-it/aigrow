"use client";

import { useState, useRef, useEffect } from "react";
import {
    MoreVertical,
    Pencil,
    Tag,
    MapPin,
    Trash2,
    Sliders,
    ToggleLeft,
    ToggleRight,
    Loader2,
    Zap,
    RotateCcw,
} from "lucide-react";
import type { Actuator, ActuatorType } from "../types/device";
import { setActuatorMode, clearActuatorOverride } from "../services/device-service";

interface ActuatorCardProps {
    actuator: Actuator;
    actuatorTypeInfo?: ActuatorType | null;
    canManage: boolean;
    isAdmin?: boolean;
    onRename: (actuator: Actuator) => void;
    onUpdateActuator?: (actuator: Actuator) => void;
    onUpdateArea?: (actuator: Actuator) => void;
    onDelete?: (actuator: Actuator) => void;
    onChangeMode?: (actuator: Actuator) => void;
    onSetOverride?: (actuator: Actuator) => void;
    onModeChanged?: () => void;
}

export default function ActuatorCard({
    actuator,
    actuatorTypeInfo,
    canManage,
    isAdmin = false,
    onRename,
    onUpdateActuator,
    onUpdateArea,
    onDelete,
    onChangeMode,
    onSetOverride,
    onModeChanged,
}: ActuatorCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [changingMode, setChangingMode] = useState(false);
    const [clearingOverride, setClearingOverride] = useState(false);
    const [modeError, setModeError] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const isOn = actuator.value === 1;
    const displayName = actuatorTypeInfo?.displayName || actuator.actuatorType;
    const showMenu = isAdmin || canManage;

    const handleClearOverride = async () => {
        setClearingOverride(true);
        try {
            await clearActuatorOverride(actuator.id, actuator.controlMode);
            onModeChanged?.();
        } catch (err: any) {
            setModeError(err instanceof Error ? err.message : "Failed to clear override");
        } finally {
            setClearingOverride(false);
        }
    };

    const handleQuickModeChange = async (newMode: string) => {
        if (newMode.toLowerCase() === actuator.controlMode?.toLowerCase()) return;
        setModeError(null);

        if (!actuator.isRemoteEnabled) {
            setModeError("Remote control is disabled");
            return;
        }

        setChangingMode(true);
        try {
            await setActuatorMode(actuator.id, newMode);
            onModeChanged?.();
        } catch (err: any) {
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

                <div className="flex items-center gap-1 shrink-0">
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
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onUpdateActuator?.(actuator);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                        >
                                            <Sliders size={12} />
                                            <span>Update Actuator</span>
                                        </button>
                                    )}

                                    {/* Set Control Mode (accessible by Admin, SuperAdmin, or Device Manager) */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onChangeMode?.(actuator);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                    >
                                        <Sliders size={12} />
                                        <span>Set Control Mode</span>
                                    </button>

                                    {/* Set Manual Override (accessible by Admin, SuperAdmin, or Device Manager) */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onSetOverride?.(actuator);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                    >
                                        <Zap size={12} className="text-amber-500" />
                                        <span>Set Manual Override</span>
                                    </button>

                                    {/* Clear Override if active */}
                                    {actuator.override && (
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
            <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {actuator.name}
                </p>
                <div className="flex items-center justify-between mt-1.5 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                        Control Mode:
                    </span>
                    <div className="flex items-center gap-1.5">
                        {canManage ? (
                            <div className="relative flex items-center gap-1">
                                <select
                                    value={actuator.controlMode}
                                    onChange={(e) => handleQuickModeChange(e.target.value)}
                                    disabled={changingMode || !actuator.isRemoteEnabled}
                                    title={
                                        !actuator.isRemoteEnabled
                                            ? "Remote control is disabled"
                                            : "Change control mode"
                                    }
                                    className="text-xs font-semibold rounded-lg px-2 py-0.5 bg-white dark:bg-[#1A1A1E] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                                >
                                    <option value="Off">Off</option>
                                    <option value="On">On</option>
                                    <option value="Auto">Auto</option>
                                    <option value="Schedule">Schedule</option>
                                </select>
                                {changingMode && (
                                    <Loader2
                                        size={12}
                                        className="animate-spin text-[#004C4B] dark:text-[#00E5A3]"
                                    />
                                )}
                            </div>
                        ) : (
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {actuator.controlMode}
                            </span>
                        )}
                    </div>
                </div>
                {modeError && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">{modeError}</p>
                )}
            </div>

            {/* Current State */}
            <div className="pt-2 border-t border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current State</span>
                {actuator.value !== null ? (
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
                {actuator.override && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                            Override: {actuator.override.state ? "ON" : "OFF"}
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
        </div>
    );
}
