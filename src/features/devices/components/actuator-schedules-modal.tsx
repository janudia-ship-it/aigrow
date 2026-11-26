"use client";

import { useState, useEffect, useCallback } from "react";
import {
    X,
    Calendar,
    Clock,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Power,
    Info,
    MoreVertical,
    Check,
} from "lucide-react";
import type {
    Actuator,
    ActuatorSchedule,
    CreateActuatorSchedulePayload,
} from "../types/device";
import {
    getActuatorSchedules,
    createActuatorSchedule,
    updateActuatorSchedule,
    deleteActuatorSchedule,
} from "../services/device-service";

interface ActuatorSchedulesModalProps {
    actuator: Actuator | null;
    isOpen: boolean;
    canManage: boolean;
    onClose: () => void;
    onSchedulesChanged?: () => void;
}

const WEEKDAYS = [
    { value: 1, label: "Mon", full: "Monday" },
    { value: 2, label: "Tue", full: "Tuesday" },
    { value: 3, label: "Wed", full: "Wednesday" },
    { value: 4, label: "Thu", full: "Thursday" },
    { value: 5, label: "Fri", full: "Friday" },
    { value: 6, label: "Sat", full: "Saturday" },
    { value: 0, label: "Sun", full: "Sunday" },
];

function formatDuration(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return "0s";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(" ");
}

function parseCronHuman(cron: string): string {
    try {
        const parts = cron.trim().split(/\s+/);
        if (parts.length !== 5) return cron;
        const [minute, hour, , , day] = parts;

        const hoursList = hour.split(",").map((h) => h.padStart(2, "0"));
        const minStr = minute.padStart(2, "0");
        const timesStr = hoursList.map((h) => `${h}:${minStr}`).join(", ");

        let daysStr = "Every day";
        if (day !== "*") {
            const dayNums = day.split(",").map(Number);
            const dayNames = dayNums.map((d) => {
                const found = WEEKDAYS.find((w) => w.value === d);
                return found ? found.label : `${d}`;
            });
            daysStr = dayNames.join(", ");
        }

        return `At ${timesStr} on ${daysStr}`;
    } catch {
        return cron;
    }
}

export default function ActuatorSchedulesModal({
    actuator,
    isOpen,
    canManage,
    onClose,
    onSchedulesChanged,
}: ActuatorSchedulesModalProps) {
    const [schedules, setSchedules] = useState<ActuatorSchedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // View: 'list' | 'create' | 'edit'
    const [view, setView] = useState<"list" | "create" | "edit">("list");
    const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
    const [deletingScheduleId, setDeletingScheduleId] = useState<number | null>(null);
    const [activeMenuScheduleId, setActiveMenuScheduleId] = useState<number | null>(null);

    // Form fields
    const [formName, setFormName] = useState("");
    const [formIsEnabled, setFormIsEnabled] = useState(true);

    // Cron builder state
    const [selectedMinute, setSelectedMinute] = useState<number>(0);
    const [selectedHours, setSelectedHours] = useState<number[]>([8]);
    const [isEveryDay, setIsEveryDay] = useState(true);
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

    // Duration builder state
    const [durationHours, setDurationHours] = useState<number>(0);
    const [durationMinutes, setDurationMinutes] = useState<number>(15);
    const [durationSeconds, setDurationSeconds] = useState<number>(0);

    // Close menu when clicking outside
    useEffect(() => {
        if (activeMenuScheduleId === null) return;
        const handleClickOutside = () => setActiveMenuScheduleId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [activeMenuScheduleId]);

    const loadSchedules = useCallback(async () => {
        if (!actuator) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getActuatorSchedules(actuator.id);
            setSchedules(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load schedules");
        } finally {
            setLoading(false);
        }
    }, [actuator]);

    useEffect(() => {
        if (isOpen && actuator) {
            setView("list");
            setEditingScheduleId(null);
            setDeletingScheduleId(null);
            loadSchedules();
        }
    }, [isOpen, actuator, loadSchedules]);

    if (!isOpen || !actuator) return null;

    // Build cron expression: "M H * * D"
    // H and D in ascending order per API requirements
    const buildCronExpression = (): string => {
        const sortedHours = Array.from(new Set(selectedHours))
            .filter((h) => Number.isInteger(h) && h >= 0 && h <= 23)
            .sort((a, b) => a - b);
        const hoursStr = sortedHours.length > 0 ? sortedHours.join(",") : "0";

        let daysStr = "*";
        if (!isEveryDay) {
            const sortedDays = Array.from(new Set(selectedWeekdays))
                .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
                .sort((a, b) => a - b);
            daysStr = sortedDays.length > 0 ? sortedDays.join(",") : "*";
        }

        const validMinute = Math.max(0, Math.min(59, selectedMinute || 0));
        return `${validMinute} ${hoursStr} * * ${daysStr}`;
    };

    const handleOpenCreate = () => {
        setFormName("");
        setFormIsEnabled(true);
        setSelectedMinute(0);
        setSelectedHours([8]);
        setIsEveryDay(true);
        setSelectedWeekdays([1, 2, 3, 4, 5]);
        setDurationHours(0);
        setDurationMinutes(15);
        setDurationSeconds(0);
        setFormError(null);
        setView("create");
    };

    const handleOpenEdit = (schedule: ActuatorSchedule) => {
        setEditingScheduleId(schedule.id);
        setFormName(schedule.name);
        setFormIsEnabled(schedule.isEnabled);

        // Parse cronExpression: "M H * * D"
        try {
            const parts = schedule.cronExpression.trim().split(/\s+/);
            if (parts.length === 5) {
                const [min, hrs, , , days] = parts;
                setSelectedMinute(Number(min) || 0);
                setSelectedHours(hrs.split(",").map(Number));
                if (days === "*") {
                    setIsEveryDay(true);
                    setSelectedWeekdays([1, 2, 3, 4, 5]);
                } else {
                    setIsEveryDay(false);
                    setSelectedWeekdays(days.split(",").map(Number));
                }
            }
        } catch {
            setSelectedMinute(0);
            setSelectedHours([8]);
            setIsEveryDay(true);
        }

        // Parse duration
        const dur = schedule.durationSeconds || 0;
        setDurationHours(Math.floor(dur / 3600));
        setDurationMinutes(Math.floor((dur % 3600) / 60));
        setDurationSeconds(dur % 60);

        setFormError(null);
        setView("edit");
    };

    const toggleHour = (hour: number) => {
        setSelectedHours((prev) => {
            if (prev.includes(hour)) {
                if (prev.length <= 1) return prev; // keep at least 1
                return prev.filter((h) => h !== hour);
            } else {
                return [...prev, hour].sort((a, b) => a - b);
            }
        });
    };

    const toggleWeekday = (day: number) => {
        setSelectedWeekdays((prev) => {
            if (prev.includes(day)) {
                if (prev.length <= 1) return prev; // keep at least 1
                return prev.filter((d) => d !== day);
            } else {
                return [...prev, day].sort((a, b) => a - b);
            }
        });
    };

    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const trimmedName = formName.trim();
        if (!trimmedName) {
            setFormError("Schedule name is required.");
            return;
        }
        if (trimmedName.length > 64) {
            setFormError("Schedule name cannot exceed 64 characters.");
            return;
        }

        if (selectedHours.length === 0) {
            setFormError("Please select at least one hour.");
            return;
        }

        if (!isEveryDay && selectedWeekdays.length === 0) {
            setFormError("Please select at least one weekday or choose Every Day.");
            return;
        }

        const calculatedDuration =
            (Number(durationHours) || 0) * 3600 +
            (Number(durationMinutes) || 0) * 60 +
            (Number(durationSeconds) || 0);

        if (calculatedDuration < 1 || calculatedDuration > 86400) {
            setFormError("Duration must be between 1 second and 86,400 seconds (24 hours).");
            return;
        }

        const cronStr = buildCronExpression();

        setActionLoading(true);
        try {
            const payload: CreateActuatorSchedulePayload = {
                name: trimmedName,
                cronExpression: cronStr,
                durationSeconds: calculatedDuration,
                isEnabled: formIsEnabled,
            };

            if (view === "create") {
                await createActuatorSchedule(actuator.id, payload);
            } else if (view === "edit" && editingScheduleId) {
                await updateActuatorSchedule(actuator.id, editingScheduleId, payload);
            }

            await loadSchedules();
            setView("list");
            onSchedulesChanged?.();
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : "Failed to save schedule");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (scheduleId: number) => {
        setActionLoading(true);
        setError(null);
        try {
            await deleteActuatorSchedule(actuator.id, scheduleId);
            setDeletingScheduleId(null);
            await loadSchedules();
            onSchedulesChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to delete schedule");
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuickToggleEnabled = async (schedule: ActuatorSchedule) => {
        if (!canManage) return;
        setActionLoading(true);
        try {
            await updateActuatorSchedule(actuator.id, schedule.id, {
                name: schedule.name,
                cronExpression: schedule.cronExpression,
                durationSeconds: schedule.durationSeconds,
                isEnabled: !schedule.isEnabled,
            });
            await loadSchedules();
            onSchedulesChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to toggle schedule");
        } finally {
            setActionLoading(false);
        }
    };

    const currentCronPreview = buildCronExpression();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div
                className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3]">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span>{actuator.name} Schedules</span>
                                {view !== "list" && (
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#004C4B]/10 text-[#004C4B] dark:bg-[#00E5A3]/10 dark:text-[#00E5A3] font-normal">
                                        {view === "create" ? "Create Schedule" : "Edit Schedule"}
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Executed when control mode is set to <strong>Schedule</strong>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* General Error Banner */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* View: Schedule List */}
                    {view === "list" && (
                        <div className="space-y-4">
                            {/* Action Bar */}
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {schedules.length} / 10 schedules defined
                                </div>

                                {canManage && (
                                    <button
                                        type="button"
                                        onClick={handleOpenCreate}
                                        disabled={schedules.length >= 10 || loading}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <Plus size={14} />
                                        <span>Create Schedule</span>
                                    </button>
                                )}
                            </div>

                            {/* Loading State */}
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                                    <Loader2 size={24} className="animate-spin text-[#004C4B] dark:text-[#00E5A3]" />
                                    <span className="text-xs">Loading actuator schedules…</span>
                                </div>
                            ) : schedules.length === 0 ? (
                                /* Empty State */
                                <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-2.5">
                                    <Calendar size={32} className="text-gray-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            No Schedules Configured
                                        </p>
                                        <p className="text-xs text-gray-400 max-w-sm mt-0.5">
                                            Schedules automatically turn this actuator ON for a set duration at designated times and days.
                                        </p>
                                    </div>
                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={handleOpenCreate}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#004C4B] dark:border-[#00E5A3] text-xs font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#142623] transition cursor-pointer"
                                        >
                                            <Plus size={13} />
                                            <span>Create First Schedule</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                /* Schedules List */
                                <div className="space-y-3">
                                    {schedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className={`rounded-xl border p-4 space-y-3 transition ${
                                                schedule.isEnabled
                                                    ? "border-gray-200 dark:border-gray-800 bg-[#EEF4F1]/40 dark:bg-[#142623]/30"
                                                    : "border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/30 opacity-75"
                                            }`}
                                        >
                                            {/* Schedule Header */}
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                        {schedule.name}
                                                    </span>

                                                    {/* Duration Pill */}
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#DCE7E1] text-[#2D5A46] dark:bg-[#203D36] dark:text-[#A7F3D0]">
                                                        <Clock size={10} />
                                                        <span>{formatDuration(schedule.durationSeconds)}</span>
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {canManage && (
                                                        <>
                                                            {/* Enabled / Disabled Toggle */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuickToggleEnabled(schedule)}
                                                                disabled={actionLoading}
                                                                title={schedule.isEnabled ? "Click to disable schedule" : "Click to enable schedule"}
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                                                                    schedule.isEnabled
                                                                        ? "bg-[#004C4B] text-white dark:bg-[#00E5A3] dark:text-[#001A1A]"
                                                                        : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                                }`}
                                                            >
                                                                <Power size={11} />
                                                                <span>{schedule.isEnabled ? "Enabled" : "Disabled"}</span>
                                                            </button>

                                                            {/* Vertical Dots Options Menu */}
                                                            <div className="relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveMenuScheduleId((prev) =>
                                                                            prev === schedule.id ? null : schedule.id
                                                                        );
                                                                    }}
                                                                    className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800 cursor-pointer transition"
                                                                    title="More options"
                                                                    aria-label="Schedule options"
                                                                >
                                                                    <MoreVertical size={14} />
                                                                </button>

                                                                {activeMenuScheduleId === schedule.id && (
                                                                    <div
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="absolute right-0 top-full mt-1 w-38 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setActiveMenuScheduleId(null);
                                                                                handleOpenEdit(schedule);
                                                                            }}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                                        >
                                                                            <Pencil size={12} />
                                                                            <span>Edit Schedule</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setActiveMenuScheduleId(null);
                                                                                setDeletingScheduleId(schedule.id);
                                                                            }}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                            <span>Delete Schedule</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delete Confirmation Prompt */}
                                            {deletingScheduleId === schedule.id && (
                                                <div className="flex items-center justify-between rounded-lg bg-red-50 dark:bg-red-950/40 p-2.5 border border-red-200 dark:border-red-900/60 text-xs">
                                                    <span className="text-red-700 dark:text-red-300">
                                                        Are you sure you want to delete this schedule?
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingScheduleId(null)}
                                                            disabled={actionLoading}
                                                            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(schedule.id)}
                                                            disabled={actionLoading}
                                                            className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
                                                        >
                                                            {actionLoading ? "Deleting…" : "Confirm Delete"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Schedule Details */}
                                            <div className="rounded-lg bg-white/70 dark:bg-[#1A1A1E]/80 border border-gray-100 dark:border-gray-800 p-2.5 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                                        {parseCronHuman(schedule.cronExpression)}
                                                    </span>
                                                    <span className="font-mono text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                                        {schedule.cronExpression}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* View: Create / Edit Schedule Form */}
                    {view !== "list" && (
                        <form onSubmit={handleSaveSchedule} className="space-y-4">
                            <button
                                type="button"
                                onClick={() => setView("list")}
                                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer"
                            >
                                <ArrowLeft size={13} />
                                <span>Back to Schedules List</span>
                            </button>

                            {formError && (
                                <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {/* Schedule Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Schedule Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Morning Irrigation"
                                    maxLength={64}
                                    required
                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1E] text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004C4B]/20 dark:focus:ring-[#00E5A3]/20 focus:border-[#004C4B] dark:focus:border-[#00E5A3]"
                                />
                                <span className="text-[10px] text-gray-400">
                                    Max 64 characters, unique for this actuator.
                                </span>
                            </div>

                            {/* Repeat Days Section */}
                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Repeat Days
                                    </label>
                                    <div className="flex items-center gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setIsEveryDay(true)}
                                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                                                isEveryDay
                                                    ? "bg-[#004C4B] text-white dark:bg-[#00E5A3] dark:text-[#001A1A]"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                            }`}
                                        >
                                            Every Day (*)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEveryDay(false)}
                                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                                                !isEveryDay
                                                    ? "bg-[#004C4B] text-white dark:bg-[#00E5A3] dark:text-[#001A1A]"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                            }`}
                                        >
                                            Specific Days
                                        </button>
                                    </div>
                                </div>

                                {!isEveryDay && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {WEEKDAYS.map((day) => {
                                            const isSelected = selectedWeekdays.includes(day.value);
                                            return (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    onClick={() => toggleWeekday(day.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                                        isSelected
                                                            ? "bg-[#004C4B] text-white dark:bg-[#00E5A3] dark:text-[#001A1A] border-[#004C4B] dark:border-[#00E5A3]"
                                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                                                    }`}
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Execution Hours & Minute */}
                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Execution Time (Hours & Minute)
                                </label>

                                {/* Minute input */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">At Minute:</span>
                                    <input
                                        type="number"
                                        min={0}
                                        max={59}
                                        value={selectedMinute}
                                        onChange={(e) => setSelectedMinute(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                                        className="w-20 px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1E] text-gray-800 dark:text-gray-100 font-semibold"
                                    />
                                    <span className="text-xs text-gray-400">(0 to 59)</span>
                                </div>

                                {/* Hours grid */}
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        At Hour(s) (click to toggle):
                                    </span>
                                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 pt-1">
                                        {Array.from({ length: 24 }).map((_, h) => {
                                            const isSelected = selectedHours.includes(h);
                                            const label = `${h.toString().padStart(2, "0")}:00`;
                                            return (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    onClick={() => toggleHour(h)}
                                                    className={`py-1 text-[11px] font-mono rounded border text-center transition cursor-pointer ${
                                                        isSelected
                                                            ? "bg-[#004C4B] text-white dark:bg-[#00E5A3] dark:text-[#001A1A] border-[#004C4B] dark:border-[#00E5A3] font-bold"
                                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Run Duration Section */}
                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Run Duration (Actuator stays ON)
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-[10px] text-gray-400">Hours (0-24)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={24}
                                            value={durationHours}
                                            onChange={(e) => setDurationHours(Math.max(0, Math.min(24, Number(e.target.value) || 0)))}
                                            className="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1E] px-2.5 py-1.5 text-gray-800 dark:text-gray-100 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400">Minutes (0-59)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={durationMinutes}
                                            onChange={(e) => setDurationMinutes(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                                            className="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1E] px-2.5 py-1.5 text-gray-800 dark:text-gray-100 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400">Seconds (0-59)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={durationSeconds}
                                            onChange={(e) => setDurationSeconds(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                                            className="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1E] px-2.5 py-1.5 text-gray-800 dark:text-gray-100 font-semibold"
                                        />
                                    </div>
                                </div>
                                <span className="text-[11px] text-gray-500">
                                    Total: {formatDuration(durationHours * 3600 + durationMinutes * 60 + durationSeconds)} (between 1s and 86,400s)
                                </span>
                            </div>

                            {/* Preview Box */}
                            <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 p-3 border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                                <div className="flex items-center justify-between text-gray-500">
                                    <span className="font-semibold">Cron Expression:</span>
                                    <span className="font-mono bg-white dark:bg-[#121214] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-bold text-[#004C4B] dark:text-[#00E5A3]">
                                        {currentCronPreview}
                                    </span>
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">
                                    {parseCronHuman(currentCronPreview)}
                                </div>
                            </div>

                            {/* Is Enabled */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="form-schedule-enabled"
                                    checked={formIsEnabled}
                                    onChange={(e) => setFormIsEnabled(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#004C4B] focus:ring-[#004C4B] cursor-pointer"
                                />
                                <label
                                    htmlFor="form-schedule-enabled"
                                    className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    Enable this schedule immediately
                                </label>
                            </div>

                            {/* Form Footer */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setView("list")}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-5 py-2 rounded-xl bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                                >
                                    {actionLoading ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Saving…</span>
                                        </>
                                    ) : (
                                        <span>{view === "create" ? "Create Schedule" : "Update Schedule"}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Modal Footer (List View) */}
                {view === "list" && (
                    <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-[#151518]/50">
                        <div className="flex items-center gap-1.5">
                            <Info size={13} className="text-[#004C4B] dark:text-[#00E5A3]" />
                            <span>Schedules execute automatically when mode is Schedule</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
