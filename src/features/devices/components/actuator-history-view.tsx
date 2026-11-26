"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
    ChevronRight,
    Calendar,
    ChevronDown,
    Loader2,
    AlertCircle,
    RotateCcw,
    Clock,
    Zap,
    Sliders,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    User,
    Info,
} from "lucide-react";
import type {
    ActuatorHistory,
    ActuatorStateHistory,
    DeviceDetails,
    Actuator,
} from "../types/device";
import {
    getActuatorHistory,
    getActuatorStateHistory,
    getDeviceById,
} from "../services/device-service";

interface ActuatorHistoryViewProps {
    actuatorId: number;
    deviceId?: number;
    actuatorName?: string;
    deviceName?: string;
    farmId?: number;
    farmName?: string;
}

type PresetRange = "today" | "yesterday" | "last7" | "last14" | "last30" | "custom";

const PRESET_OPTIONS: { value: PresetRange; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7", label: "Last 7 days" },
    { value: "last14", label: "Last 14 days" },
    { value: "last30", label: "Last 30 days" },
    { value: "custom", label: "Custom range" },
];

function formatDateYMD(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function formatDisplayDateTime(dateStr: string | null): string {
    if (!dateStr) return "now";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return dateStr;
    }
}

function getModeDisplay(modeStr: string): string {
    const m = (modeStr || "").toLowerCase();
    if (m === "on") return "Mode: Manual · On";
    if (m === "off") return "Mode: Manual · Off";
    if (m === "auto") return "Mode: Auto";
    if (m === "schedule") return "Mode: Schedule";
    if (m === "override") return "Mode: Override";
    return `Mode: ${modeStr}`;
}

export default function ActuatorHistoryView({
    actuatorId,
    deviceId: initialDeviceId,
    actuatorName: initialActuatorName,
    deviceName: initialDeviceName,
    farmId: initialFarmId,
    farmName: initialFarmName,
}: ActuatorHistoryViewProps) {
    // Device & Actuator details
    const [device, setDevice] = useState<DeviceDetails | null>(null);
    const [loadingDevice, setLoadingDevice] = useState(false);

    // Date range filter
    const [preset, setPreset] = useState<PresetRange>("last7");
    const [fromDate, setFromDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        return formatDateYMD(d);
    });
    const [toDate, setToDate] = useState<string>(() => formatDateYMD(new Date()));

    // History data
    const [historyData, setHistoryData] = useState<ActuatorHistory | null>(null);
    const [stateHistoryData, setStateHistoryData] = useState<ActuatorStateHistory | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load device details if deviceId provided
    useEffect(() => {
        if (!initialDeviceId) return;
        let isMounted = true;
        setLoadingDevice(true);
        getDeviceById(initialDeviceId)
            .then((dev) => {
                if (isMounted) setDevice(dev);
            })
            .catch(() => {})
            .finally(() => {
                if (isMounted) setLoadingDevice(false);
            });
        return () => {
            isMounted = false;
        };
    }, [initialDeviceId]);

    // Handle preset changes
    const handlePresetChange = (newPreset: PresetRange) => {
        setPreset(newPreset);
        const today = new Date();
        if (newPreset === "today") {
            const todayStr = formatDateYMD(today);
            setFromDate(todayStr);
            setToDate(todayStr);
        } else if (newPreset === "yesterday") {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            const yStr = formatDateYMD(y);
            setFromDate(yStr);
            setToDate(yStr);
        } else if (newPreset === "last7") {
            const past = new Date();
            past.setDate(past.getDate() - 6);
            setFromDate(formatDateYMD(past));
            setToDate(formatDateYMD(today));
        } else if (newPreset === "last14") {
            const past = new Date();
            past.setDate(past.getDate() - 13);
            setFromDate(formatDateYMD(past));
            setToDate(formatDateYMD(today));
        } else if (newPreset === "last30") {
            const past = new Date();
            past.setDate(past.getDate() - 29);
            setFromDate(formatDateYMD(past));
            setToDate(formatDateYMD(today));
        }
    };

    // Load history and state-history
    const loadData = useCallback(async () => {
        if (!actuatorId || !fromDate || !toDate) return;
        setLoading(true);
        setError(null);
        try {
            // For state-history: from and to with time
            const fromDateTime = `${fromDate}T00:00:00`;
            const toDateTime = `${toDate}T23:59:59`;

            const [historyRes, stateRes] = await Promise.all([
                getActuatorHistory(actuatorId, fromDate, toDate),
                getActuatorStateHistory(actuatorId, fromDateTime, toDateTime),
            ]);

            setHistoryData(historyRes);
            setStateHistoryData(stateRes);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load actuator history");
        } finally {
            setLoading(false);
        }
    }, [actuatorId, fromDate, toDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Computed names and breadcrumbs
    const currentActuator = useMemo(() => {
        if (!device) return null;
        return device.actuators.find((a) => a.id === actuatorId) || null;
    }, [device, actuatorId]);

    const displayActuatorName =
        currentActuator?.name || initialActuatorName || `Actuator #${actuatorId}`;
    const displayDeviceName =
        device?.name || initialDeviceName || (initialDeviceId ? `Device #${initialDeviceId}` : "Controller");
    const displayFarmName =
        device?.assignment?.farmName || initialFarmName || "Farm";
    const farmId = device?.assignment?.farmId || initialFarmId;

    // Timeline calculation for "On/Off state"
    const timelineData = useMemo(() => {
        if (!fromDate || !toDate) return { totalOnStr: "0 min in this period", segments: [], startLabel: "", endLabel: "" };

        const now = new Date();
        const isToDateToday = toDate === formatDateYMD(now);
        const endDateTime = isToDateToday ? now.toISOString() : `${toDate}T23:59:59`;

        const startMs = new Date(`${fromDate}T00:00:00`).getTime();
        const endMs = new Date(endDateTime).getTime();
        const totalDurationMs = Math.max(1, endMs - startMs);

        const startLabel = formatDisplayDateTime(`${fromDate}T00:00:00`);
        const endLabel = formatDisplayDateTime(endDateTime);

        const rawEvents = stateHistoryData?.events || [];
        if (rawEvents.length === 0) {
            return {
                totalOnStr: "0 min in this period",
                segments: [{ status: -1, widthPct: 100, label: "Not known" }],
                startLabel,
                endLabel,
            };
        }

        // Parse events with timestamps
        const sorted = rawEvents
            .map((e) => ({
                timeMs: new Date(e.time).getTime(),
                status: Number(e.status), // 1 = ON, 0 = OFF
                mode: e.mode,
            }))
            .sort((a, b) => a.timeMs - b.timeMs);

        // Build continuous segments
        interface Segment {
            status: number; // 1 = ON, 0 = OFF, -1 = Not known
            fromMs: number;
            toMs: number;
            widthPct: number;
        }

        const segments: Segment[] = [];
        let totalOnMs = 0;

        // Find initial state at startMs
        let currentStatus = -1;
        let lastTimeMs = startMs;

        // Check if there is an event before or at startMs
        const eventsBefore = sorted.filter((e) => e.timeMs <= startMs);
        if (eventsBefore.length > 0) {
            currentStatus = eventsBefore[eventsBefore.length - 1].status;
        }

        // Iterate through events inside [startMs, endMs]
        const eventsInside = sorted.filter((e) => e.timeMs > startMs && e.timeMs <= endMs);

        for (const ev of eventsInside) {
            const segDuration = ev.timeMs - lastTimeMs;
            if (segDuration > 0) {
                segments.push({
                    status: currentStatus,
                    fromMs: lastTimeMs,
                    toMs: ev.timeMs,
                    widthPct: (segDuration / totalDurationMs) * 100,
                });
                if (currentStatus === 1) {
                    totalOnMs += segDuration;
                }
            }
            currentStatus = ev.status;
            lastTimeMs = ev.timeMs;
        }

        // Final segment from lastTimeMs to endMs
        if (endMs > lastTimeMs) {
            const segDuration = endMs - lastTimeMs;
            segments.push({
                status: currentStatus,
                fromMs: lastTimeMs,
                toMs: endMs,
                widthPct: (segDuration / totalDurationMs) * 100,
            });
            if (currentStatus === 1) {
                totalOnMs += segDuration;
            }
        }

        // Format total ON duration
        const totalMinutes = Math.floor(totalOnMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        let totalOnStr = "";
        if (hours > 0) {
            totalOnStr = `${hours} h ${mins} min in this period`;
        } else {
            totalOnStr = `${mins} min in this period`;
        }

        return {
            totalOnStr,
            segments,
            startLabel,
            endLabel,
        };
    }, [fromDate, toDate, stateHistoryData]);

    // Unified history log events
    interface HistoryLogItem {
        id: string;
        timeMs: number;
        user: string | null;
        title: string;
        badge: {
            text: string;
            type: "on" | "off" | "auto" | "schedule" | "override" | "neutral";
        };
        timeRangeStr: string;
        details?: string;
    }

    const historyItems = useMemo(() => {
        if (!historyData) return [];
        const items: HistoryLogItem[] = [];

        // 1. Modes
        (historyData.modes || []).forEach((m, idx) => {
            const fromD = formatDisplayDateTime(m.from);
            const toD = formatDisplayDateTime(m.to);
            const badgeType: "on" | "off" | "auto" | "schedule" | "neutral" =
                m.mode?.toLowerCase() === "on"
                    ? "on"
                    : m.mode?.toLowerCase() === "off"
                    ? "off"
                    : m.mode?.toLowerCase() === "auto"
                    ? "auto"
                    : m.mode?.toLowerCase() === "schedule"
                    ? "schedule"
                    : "neutral";

            items.push({
                id: `mode_${idx}_${m.from}`,
                timeMs: new Date(m.from).getTime(),
                user: m.setBy,
                title: `${m.setBy || "System"} changed the mode to`,
                badge: {
                    text: getModeDisplay(m.mode),
                    type: badgeType,
                },
                timeRangeStr: `${fromD} – ${toD}`,
            });
        });

        // 2. Overrides
        (historyData.overrideEvents || []).forEach((o, idx) => {
            const atD = formatDisplayDateTime(o.at);
            const expD = o.expiresAt ? formatDisplayDateTime(o.expiresAt) : "until removed";

            let actionTitle = `${o.by || "System"} set override to`;
            if (o.kind === "Removed") {
                actionTitle = `${o.by || "System"} removed manual override`;
            } else if (o.kind === "Expired") {
                actionTitle = `Manual override expired`;
            }

            items.push({
                id: `override_${idx}_${o.at}`,
                timeMs: new Date(o.at).getTime(),
                user: o.by,
                title: actionTitle,
                badge: {
                    text: `Override: ${o.state ? "ON" : "OFF"} (${o.kind})`,
                    type: o.state ? "on" : "off",
                },
                timeRangeStr: `${atD} • Expires: ${expD}`,
            });
        });

        // 3. Rules
        (historyData.rules || []).forEach((r, idx) => {
            const fromD = formatDisplayDateTime(r.from);
            const toD = formatDisplayDateTime(r.to);
            const creator = r.updatedBy || r.createdBy || "System";

            items.push({
                id: `rule_${idx}_${r.ruleId}_${r.from}`,
                timeMs: new Date(r.from).getTime(),
                user: creator,
                title: `${creator} configured rule "${r.name}"`,
                badge: {
                    text: `Target: ${r.targetState ? "ON" : "OFF"} (${r.matchType})`,
                    type: r.targetState ? "on" : "off",
                },
                timeRangeStr: `${fromD} – ${toD}`,
                details: `${r.conditions.length} condition(s): ${r.conditions
                    .map((c) => `${c.sensorName} ${c.operator} ${c.threshold}`)
                    .join(", ")}`,
            });
        });

        // 4. Schedules
        (historyData.schedules || []).forEach((s, idx) => {
            const fromD = formatDisplayDateTime(s.from);
            const toD = formatDisplayDateTime(s.to);
            const creator = s.updatedBy || s.createdBy || "System";

            items.push({
                id: `schedule_${idx}_${s.scheduleId}_${s.from}`,
                timeMs: new Date(s.from).getTime(),
                user: creator,
                title: `${creator} configured schedule "${s.name}"`,
                badge: {
                    text: `Cron: ${s.cronExpression}`,
                    type: "schedule",
                },
                timeRangeStr: `${fromD} – ${toD}`,
                details: `Duration: ${Math.round(s.durationSeconds / 60)} min`,
            });
        });

        // Sort oldest first per API documentation & UI spec:
        // "with the rules or schedules that ran then, and the overrides. Oldest first."
        return items.sort((a, b) => a.timeMs - b.timeMs);
    }, [historyData]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Breadcrumb matching screenshot: Farms > Farm Name > Device Name > Actuator history */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                <Link
                    href="/farm"
                    className="hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition font-medium"
                >
                    Farms
                </Link>
                <ChevronRight size={13} className="text-gray-400 shrink-0" />
                {farmId ? (
                    <Link
                        href={`/farm/${farmId}`}
                        className="hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition font-medium"
                    >
                        {displayFarmName}
                    </Link>
                ) : (
                    <span>{displayFarmName}</span>
                )}
                <ChevronRight size={13} className="text-gray-400 shrink-0" />
                {initialDeviceId ? (
                    <Link
                        href={`/devices/${initialDeviceId}`}
                        className="hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition font-medium"
                    >
                        {displayDeviceName}
                    </Link>
                ) : (
                    <span>{displayDeviceName}</span>
                )}
                <ChevronRight size={13} className="text-gray-400 shrink-0" />
                <span className="text-gray-800 dark:text-gray-200 font-semibold">
                    Actuator history
                </span>
            </div>

            {/* Page Title & Subtitle */}
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {displayActuatorName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    How it was set up to work on {displayDeviceName}, and who changed what.
                </p>
            </div>

            {/* Filter Bar matching screenshot: Preset dropdown pill + From date + To date */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Preset dropdown */}
                <div className="relative">
                    <select
                        value={preset}
                        onChange={(e) => handlePresetChange(e.target.value as PresetRange)}
                        className="appearance-none pl-4 pr-9 py-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121214] text-xs font-medium text-gray-700 dark:text-gray-200 shadow-2xs hover:border-[#004C4B] dark:hover:border-[#00E5A3] focus:outline-none cursor-pointer"
                    >
                        {PRESET_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={14}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                </div>

                {/* From Date Pill */}
                <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121214] px-4 py-1.5 shadow-2xs text-xs">
                    <span className="text-gray-400 font-medium">From</span>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                            setPreset("custom");
                            setFromDate(e.target.value);
                        }}
                        className="bg-transparent text-gray-800 dark:text-gray-100 font-semibold focus:outline-none cursor-pointer text-xs"
                    />
                </div>

                {/* To Date Pill */}
                <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121214] px-4 py-1.5 shadow-2xs text-xs">
                    <span className="text-gray-400 font-medium">To</span>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                            setPreset("custom");
                            setToDate(e.target.value);
                        }}
                        className="bg-transparent text-gray-800 dark:text-gray-100 font-semibold focus:outline-none cursor-pointer text-xs"
                    />
                </div>

                {/* Refresh */}
                <button
                    type="button"
                    onClick={loadData}
                    disabled={loading}
                    className="p-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121214] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer shadow-2xs"
                    title="Reload data"
                >
                    <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Card 1: On/Off state matching screenshot */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121214] p-6 shadow-xs space-y-4">
                <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        On/Off state
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        When the relay was on or off, as the device reported it.
                    </p>
                </div>

                {/* Metric: On for X in this period */}
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    On for {timelineData.totalOnStr}
                </div>

                {/* Visual Timeline Bar */}
                <div className="space-y-2">
                    <div className="w-full h-7 rounded-lg overflow-hidden flex bg-[#E5E7EB] dark:bg-gray-800">
                        {timelineData.segments.map((seg, i) => {
                            let bgClass = "bg-[#004C4B]"; // ON
                            if (seg.status === 0) bgClass = "bg-[#D1D5DB] dark:bg-gray-600"; // OFF
                            if (seg.status === -1) bgClass = "bg-[#E5E7EB] dark:bg-gray-800"; // Not known

                            return (
                                <div
                                    key={i}
                                    style={{ width: `${Math.max(0.5, seg.widthPct)}%` }}
                                    className={`h-full ${bgClass} transition-all duration-300`}
                                    title={
                                        seg.status === 1
                                            ? "ON"
                                            : seg.status === 0
                                            ? "OFF"
                                            : "Not known"
                                    }
                                />
                            );
                        })}
                    </div>

                    {/* Timeline Start & End date labels */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{timelineData.startLabel}</span>
                        <span>{timelineData.endLabel}</span>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs pt-1">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#004C4B]" />
                            <span className="text-gray-600 dark:text-gray-400">On</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#9CA3AF]" />
                            <span className="text-gray-600 dark:text-gray-400">Off</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700" />
                            <span className="text-gray-600 dark:text-gray-400">Not known</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: History matching screenshot */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121214] p-6 shadow-xs space-y-5">
                <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        History
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Each mode it was put in and by whom, with the rules or schedules that ran then, and the overrides. Oldest first.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                        <Loader2 size={22} className="animate-spin text-[#004C4B] dark:text-[#00E5A3]" />
                        <span className="text-xs">Loading actuator history logs…</span>
                    </div>
                ) : historyItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 space-y-1">
                        <Info size={28} className="mx-auto text-gray-300 dark:text-gray-600" />
                        <p className="text-xs">No configuration or mode changes recorded in this period.</p>
                    </div>
                ) : (
                    /* Chronological Items */
                    <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800/60">
                        {historyItems.map((item) => (
                            <div key={item.id} className="pt-3.5 first:pt-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap text-sm text-gray-800 dark:text-gray-200">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.title}</span>

                                    {/* Mode / Target Badge */}
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181B] text-gray-700 dark:text-gray-200 shadow-2xs font-medium">
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                item.badge.type === "on"
                                                    ? "bg-emerald-500"
                                                    : item.badge.type === "off"
                                                    ? "bg-gray-400 dark:bg-gray-500"
                                                    : "bg-teal-500"
                                            }`}
                                        />
                                        <span>{item.badge.text}</span>
                                    </span>
                                </div>

                                {/* Date range string: e.g. Nov 5, 2026, 5:13 PM – Nov 20, 2026, 9:37 AM */}
                                <div className="text-xs text-gray-400 font-normal">
                                    {item.timeRangeStr}
                                </div>

                                {item.details && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-[#004C4B]/30 dark:border-[#00E5A3]/40 mt-1">
                                        {item.details}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
