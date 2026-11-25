"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    Activity,
    Pencil,
    TrendingUp,
    Clock,
    AlertCircle,
    RefreshCw,
    Calendar,
    BarChart2,
    MoreVertical,
    MapPin,
    Sliders,
    Trash2,
} from "lucide-react";
import type { Sensor, SensorType, SensorReadings, SensorReadingPoint } from "../types/device";
import { getSensorReadings } from "../services/device-service";

interface SensorCardProps {
    sensor: Sensor;
    sensorTypeInfo?: SensorType | null;
    canManage: boolean;
    isAdmin?: boolean;
    onRename: (sensor: Sensor) => void;
    onUpdateSensor?: (sensor: Sensor) => void;
    onUpdateArea?: (sensor: Sensor) => void;
    onUpdateCalibration?: (sensor: Sensor) => void;
    onDelete?: (sensor: Sensor) => void;
}

type TimeRangeOption = "24h" | "7d" | "30d";

function padZero(n: number): string {
    return String(n).padStart(2, "0");
}

// Formats Date to farm local time without timezone offset (e.g. 2026-11-15T00:00:00)
function formatFarmLocalTime(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = padZero(date.getMonth() + 1);
    const dd = padZero(date.getDate());
    const hh = padZero(date.getHours());
    const min = padZero(date.getMinutes());
    const ss = padZero(date.getSeconds());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
}

function formatDisplayTime(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
        return dateStr;
    }
}

function formatFullDisplayDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

export default function SensorCard({
    sensor,
    sensorTypeInfo,
    canManage,
    isAdmin = false,
    onRename,
    onUpdateSensor,
    onUpdateArea,
    onUpdateCalibration,
    onDelete,
}: SensorCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState<TimeRangeOption>("24h");
    const [readingsData, setReadingsData] = useState<SensorReadings | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<SensorReadingPoint | null>(null);

    // Positioning state
    const [positionStyle, setPositionStyle] = useState<"top" | "bottom">("bottom");
    const [alignStyle, setAlignStyle] = useState<"center" | "left" | "right">("center");

    const cardRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const cacheRef = useRef<Record<string, SensorReadings>>({});

    const displayName = sensorTypeInfo?.displayName || sensor.sensorType;
    const displayUnit = sensor.unit || sensorTypeInfo?.unit || "";

    // Calculate smart positioning when opening
    const updatePosition = useCallback(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        // Vertical position: if space below is tight (<320px) and space above is larger, show on top
        if (windowHeight - rect.bottom < 320 && rect.top > 320) {
            setPositionStyle("top");
        } else {
            setPositionStyle("bottom");
        }

        // Horizontal position
        if (rect.left < 80) {
            setAlignStyle("left");
        } else if (windowWidth - rect.right < 80) {
            setAlignStyle("right");
        } else {
            setAlignStyle("center");
        }
    }, []);

    // Fetch readings for the sensor
    const fetchReadings = useCallback(
        async (range: TimeRangeOption) => {
            const cacheKey = `${sensor.id}-${range}`;
            if (cacheRef.current[cacheKey]) {
                setReadingsData(cacheRef.current[cacheKey]);
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const now = new Date();
                let fromDate: Date;
                if (range === "24h") {
                    fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                } else if (range === "7d") {
                    fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                } else {
                    fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                }

                const from = formatFarmLocalTime(fromDate);
                const to = formatFarmLocalTime(now);

                const data = await getSensorReadings(sensor.id, from, to);
                cacheRef.current[cacheKey] = data;
                setReadingsData(data);
            } catch (err: any) {
                setError(err.message || "Failed to load sensor readings.");
            } finally {
                setLoading(false);
            }
        },
        [sensor.id]
    );

    // Fetch readings when pop-up opens or range changes
    useEffect(() => {
        if (isOpen) {
            updatePosition();
            fetchReadings(selectedRange);
        } else {
            setHoveredPoint(null);
        }
    }, [isOpen, selectedRange, fetchReadings, updatePosition]);

    // Handle mouse enter with slight debounce
    const handleMouseEnter = () => {
        if (menuOpen) return;
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        if (!isOpen) {
            openTimeoutRef.current = setTimeout(() => {
                updatePosition();
                setIsOpen(true);
            }, 180);
        }
    };

    // Handle mouse leave with delay allowing user to hover into popup
    const handleMouseLeave = () => {
        if (openTimeoutRef.current) {
            clearTimeout(openTimeoutRef.current);
            openTimeoutRef.current = null;
        }
        closeTimeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 220);
    };

    // Close on Escape or click outside
    useEffect(() => {
        if (!isOpen && !menuOpen) return;
        function handleOutsideClick(e: MouseEvent) {
            if (
                cardRef.current &&
                !cardRef.current.contains(e.target as Node) &&
                popupRef.current &&
                !popupRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsOpen(false);
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, menuOpen]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    // Extract valid points & stats
    const { validPoints, minVal, maxVal, avgVal, latestPoint } = useMemo(() => {
        const points = readingsData?.points || [];
        const valid = points.filter(
            (p) => p.avg !== null || p.min !== null || p.max !== null
        );

        if (valid.length === 0) {
            return {
                validPoints: [],
                minVal: null,
                maxVal: null,
                avgVal: null,
                latestPoint: null,
            };
        }

        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        let count = 0;

        for (const p of valid) {
            const vMin = p.min ?? p.avg;
            const vMax = p.max ?? p.avg;
            const vAvg = p.avg ?? p.min;

            if (vMin !== null && vMin !== undefined && vMin < min) min = vMin;
            if (vMax !== null && vMax !== undefined && vMax > max) max = vMax;
            if (vAvg !== null && vAvg !== undefined) {
                sum += vAvg;
                count++;
            }
        }

        const avg = count > 0 ? sum / count : null;
        const latest = valid[valid.length - 1];

        return {
            validPoints: valid,
            minVal: min !== Infinity ? min : null,
            maxVal: max !== -Infinity ? max : null,
            avgVal: avg,
            latestPoint: latest,
        };
    }, [readingsData]);

    // Build SVG path segments (respecting gaps where all values are null)
    const { svgPaths, chartWidth, chartHeight } = useMemo(() => {
        const width = 340;
        const height = 110;
        const padding = { top: 12, bottom: 18, left: 12, right: 12 };
        const innerWidth = width - padding.left - padding.right;
        const innerHeight = height - padding.top - padding.bottom;

        const points = readingsData?.points || [];
        if (points.length < 2 || minVal === null || maxVal === null) {
            return { svgPaths: [], chartWidth: width, chartHeight: height };
        }

        // Adjust range if min === max to avoid division by zero
        const effectiveMin = minVal === maxVal ? minVal - 1 : minVal;
        const effectiveMax = minVal === maxVal ? maxVal + 1 : maxVal;
        const range = effectiveMax - effectiveMin;

        // Group into segments of non-null points (gaps break the line)
        const segments: { x: number; y: number; point: SensorReadingPoint }[][] = [];
        let currentSegment: { x: number; y: number; point: SensorReadingPoint }[] = [];

        points.forEach((p, idx) => {
            const isNull = p.avg === null && p.min === null && p.max === null;
            if (isNull) {
                if (currentSegment.length > 0) {
                    segments.push(currentSegment);
                    currentSegment = [];
                }
            } else {
                const val = p.avg ?? p.min ?? p.max ?? effectiveMin;
                const x = padding.left + (idx / (points.length - 1)) * innerWidth;
                const y = padding.top + innerHeight - ((val - effectiveMin) / range) * innerHeight;
                currentSegment.push({ x, y, point: p });
            }
        });

        if (currentSegment.length > 0) {
            segments.push(currentSegment);
        }

        const paths = segments.map((seg) => {
            if (seg.length === 1) {
                return {
                    lineD: `M ${seg[0].x} ${seg[0].y} m -2, 0 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0`,
                    areaD: "",
                };
            }
            const lineD = seg.reduce(
                (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`,
                ""
            );
            const firstPt = seg[0];
            const lastPt = seg[seg.length - 1];
            const bottomY = padding.top + innerHeight;
            const areaD = `${lineD} L ${lastPt.x.toFixed(1)} ${bottomY} L ${firstPt.x.toFixed(1)} ${bottomY} Z`;

            return { lineD, areaD };
        });

        return { svgPaths: paths, chartWidth: width, chartHeight: height };
    }, [readingsData, minVal, maxVal]);

    return (
        <div
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative group rounded-xl border border-gray-200 dark:border-gray-800 bg-[#EEF4F1]/60 dark:bg-[#142623]/60 p-4 transition duration-200 hover:border-[#004C4B]/60 dark:hover:border-[#00E5A3]/60 hover:shadow-md cursor-pointer"
        >
            {/* Header: Name + Rename Button */}
            <div>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {sensor.name}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                        <span
                            aria-label="Hover to view readings"
                            className="text-gray-400 group-hover:text-[#004C4B] dark:group-hover:text-[#00E5A3] transition p-1"
                        >
                            <BarChart2 size={13} />
                        </span>

                        {isAdmin ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        setMenuOpen((prev) => !prev);
                                    }}
                                    aria-label="Sensor options"
                                    className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800 cursor-pointer transition"
                                >
                                    <MoreVertical size={14} />
                                </button>

                                {menuOpen && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-xl py-1.5 z-30"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                if (onUpdateSensor) {
                                                    onUpdateSensor(sensor);
                                                } else {
                                                    onRename(sensor);
                                                }
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                        >
                                            <Pencil size={12} />
                                            <span>Update Sensor</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onUpdateArea?.(sensor);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                        >
                                            <MapPin size={12} />
                                            <span>Update Sensor Area</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onUpdateCalibration?.(sensor);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                        >
                                            <Sliders size={12} />
                                            <span>Update Sensor Calibration</span>
                                        </button>
                                        <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onDelete?.(sensor);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                        >
                                            <Trash2 size={12} />
                                            <span>Delete Sensor</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : canManage ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRename(sensor);
                                }}
                                aria-label="Rename sensor"
                                className="text-[11px] font-medium text-[#004C4B] dark:text-[#00E5A3] hover:underline p-1 cursor-pointer rounded hover:bg-gray-200/50 dark:hover:bg-gray-800"
                            >
                                <Pencil size={11} />
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Sensor Type */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Sensor Type:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {displayName}
                    </span>
                    {displayUnit && (
                        <span className="ml-1 text-gray-400 font-normal">
                            ({displayUnit})
                        </span>
                    )}
                </p>
            </div>

            {/* Current Reading */}
            <div className="mt-3 pt-3 border-t border-gray-200/80 dark:border-gray-800/80 flex items-baseline justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current Reading</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {sensor.value !== null && sensor.value !== undefined
                        ? `${sensor.value} ${displayUnit}`
                        : "—"}
                </span>
            </div>

            {/* Hover Pop-Up Card */}
            {isOpen && (
                <div
                    ref={popupRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 shadow-2xl p-4 transition-all duration-200 text-left pointer-events-auto ${
                        positionStyle === "top" ? "bottom-full mb-2.5" : "top-full mt-2.5"
                    } ${
                        alignStyle === "left"
                            ? "left-0"
                            : alignStyle === "right"
                            ? "right-0"
                            : "left-1/2 -translate-x-1/2"
                    }`}
                >
                    {/* Pop-up Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800/80">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <Activity size={14} className="text-[#004C4B] dark:text-[#00E5A3] shrink-0" />
                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                    {sensor.name}
                                </h4>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {displayName} {displayUnit ? `(${displayUnit})` : ""}
                            </p>
                        </div>

                        {/* Resolution & Range Badge */}
                        <div className="flex flex-col items-end shrink-0">
                            {readingsData?.resolution && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3]">
                                    {readingsData.resolution}
                                </span>
                            )}
                            <span className="text-[10px] text-gray-400 mt-0.5">
                                #{sensor.id}
                            </span>
                        </div>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex items-center justify-between mt-3 mb-2">
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar size={11} />
                            Readings Range
                        </span>

                        <div className="inline-flex rounded-lg bg-gray-100 dark:bg-[#1C1C1E] p-0.5 text-[11px]">
                            {(["24h", "7d", "30d"] as TimeRangeOption[]).map((range) => (
                                <button
                                    key={range}
                                    type="button"
                                    onClick={() => setSelectedRange(range)}
                                    className={`px-2.5 py-0.5 rounded-md font-medium transition cursor-pointer ${
                                        selectedRange === range
                                            ? "bg-white dark:bg-[#2A2A2E] text-[#004C4B] dark:text-[#00E5A3] shadow-xs font-semibold"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    }`}
                                >
                                    {range.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="py-8 flex flex-col items-center justify-center space-y-2">
                            <RefreshCw size={20} className="text-[#004C4B] dark:text-[#00E5A3] animate-spin" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Fetching sensor readings...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="py-4 px-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center my-2">
                            <AlertCircle size={16} className="mx-auto text-red-500 mb-1" />
                            <p className="text-xs font-medium text-red-600 dark:text-red-400">
                                {error}
                            </p>
                            <button
                                type="button"
                                onClick={() => fetchReadings(selectedRange)}
                                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:underline cursor-pointer"
                            >
                                <RefreshCw size={11} /> Retry
                            </button>
                        </div>
                    )}

                    {/* Readings Content */}
                    {!loading && !error && readingsData && (
                        <div>
                            {validPoints.length === 0 ? (
                                <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                                    No readings recorded in this time range.
                                </div>
                            ) : (
                                <>
                                    {/* Stats Summary Bar */}
                                    <div className="grid grid-cols-3 gap-2 my-2.5">
                                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 text-center">
                                            <p className="text-[10px] text-gray-400 font-medium">Average</p>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-100 mt-0.5">
                                                {avgVal !== null ? avgVal.toFixed(1) : "—"}
                                                {displayUnit && <span className="text-[10px] font-normal text-gray-400 ml-0.5">{displayUnit}</span>}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 text-center">
                                            <p className="text-[10px] text-gray-400 font-medium">Min</p>
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                {minVal !== null ? minVal : "—"}
                                                {displayUnit && <span className="text-[10px] font-normal text-gray-400 ml-0.5">{displayUnit}</span>}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 text-center">
                                            <p className="text-[10px] text-gray-400 font-medium">Max</p>
                                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                                                {maxVal !== null ? maxVal : "—"}
                                                {displayUnit && <span className="text-[10px] font-normal text-gray-400 ml-0.5">{displayUnit}</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* SVG Sparkline / Trend Chart */}
                                    <div className="relative rounded-xl bg-gray-50/80 dark:bg-[#18181B]/80 border border-gray-100 dark:border-gray-800 p-2 overflow-hidden">
                                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 px-1">
                                            <span className="flex items-center gap-1 font-medium">
                                                <TrendingUp size={11} className="text-[#004C4B] dark:text-[#00E5A3]" />
                                                Trend ({readingsData.points.length} pts)
                                            </span>
                                            {hoveredPoint ? (
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {hoveredPoint.avg !== null ? hoveredPoint.avg : "Gap"} {displayUnit} • {formatDisplayTime(hoveredPoint.time)}
                                                </span>
                                            ) : latestPoint ? (
                                                <span>
                                                    Latest: {latestPoint.avg ?? latestPoint.min} {displayUnit}
                                                </span>
                                            ) : null}
                                        </div>

                                        <svg
                                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                            className="w-full h-24 overflow-visible"
                                            preserveAspectRatio="none"
                                        >
                                            <defs>
                                                <linearGradient id={`gradient-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#00E5A3" stopOpacity="0.35" />
                                                    <stop offset="100%" stopColor="#00E5A3" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>

                                            {/* Draw segment paths (lines break over gaps) */}
                                            {svgPaths.map((p, i) => (
                                                <g key={i}>
                                                    {p.areaD && (
                                                        <path
                                                            d={p.areaD}
                                                            fill={`url(#gradient-${sensor.id})`}
                                                        />
                                                    )}
                                                    <path
                                                        d={p.lineD}
                                                        fill="none"
                                                        stroke="#00A876"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="dark:stroke-[#00E5A3]"
                                                    />
                                                </g>
                                            ))}
                                        </svg>

                                        {/* Time axis range labels */}
                                        <div className="flex items-center justify-between text-[9px] text-gray-400 px-1 mt-1">
                                            <span>
                                                {readingsData.points[0]?.time
                                                    ? formatDisplayTime(readingsData.points[0].time)
                                                    : "Oldest"}
                                            </span>
                                            <span>
                                                {readingsData.points[readingsData.points.length - 1]?.time
                                                    ? formatDisplayTime(readingsData.points[readingsData.points.length - 1].time)
                                                    : "Latest"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Recent Readings List */}
                                    <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            <Clock size={10} /> Recent Readings
                                        </p>
                                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                            {validPoints
                                                .slice(-4)
                                                .reverse()
                                                .map((pt, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-gray-50 dark:bg-[#18181B]"
                                                    >
                                                        <span className="text-gray-500 dark:text-gray-400 text-[10px]">
                                                            {formatFullDisplayDate(pt.time)}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {pt.avg !== null && (
                                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    {pt.avg} {displayUnit}
                                                                </span>
                                                            )}
                                                            {pt.min !== null && pt.max !== null && pt.min !== pt.avg && (
                                                                <span className="text-[10px] text-gray-400 font-mono">
                                                                    ({pt.min}-{pt.max})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
