"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    RotateCcw,
    Cpu,
    Sprout,
    Wifi,
    WifiOff,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { useAllDevices } from "../hooks/use-all-devices";
import { DEVICE_TYPES } from "../types/device";
import { getAllFarmsClient } from "@/features/farms/services/farm-service";
import type { Farm } from "@/features/farms/types/farm.types";

const statusConfig: Record<
    string,
    { icon: typeof Wifi; label: string; className: string }
> = {
    Online: {
        icon: Wifi,
        label: "Online",
        className:
            "bg-[#D7E8DF] text-[#1E5440] dark:bg-[#1C3A32] dark:text-[#6EE7B7]",
    },
    Offline: {
        icon: WifiOff,
        label: "Offline",
        className:
            "bg-[#FDE2E2] text-[#991B1B] dark:bg-[#3D1414] dark:text-[#FCA5A5]",
    },
    NeverConnected: {
        icon: HelpCircle,
        label: "Never Connected",
        className:
            "bg-[#E2E8F0] text-[#475569] dark:bg-[#2D3748] dark:text-[#CBD5E1]",
    },
};

function formatLastSeen(dateStr: string | null): string {
    if (!dateStr) return "Never";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

export default function AllDevicesView() {
    const router = useRouter();
    const {
        devices,
        page,
        pageSize,
        totalCount,
        totalPages,
        search,
        farmId,
        deviceType,
        loading,
        error,
        setPage,
        setSearch,
        setFarmId,
        setDeviceType,
        resetFilters,
    } = useAllDevices(20);

    const [farms, setFarms] = useState<Farm[]>([]);

    useEffect(() => {
        getAllFarmsClient({ page: 1, pageSize: 100 })
            .then((res) => setFarms(res.items || []))
            .catch(() => setFarms([]));
    }, []);

    return (
        <div className="space-y-5">
            {/* Top Filter Bar matching screenshot */}
            <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Pill */}
                <div className="relative flex-1 min-w-[230px] max-w-sm">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                        type="text"
                        maxLength={100}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by device name or MAC address"
                        className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                    />
                </div>

                {/* Farm Filter Pill */}
                <div className="relative min-w-[165px]">
                    <Sprout
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <select
                        value={farmId ? String(farmId) : ""}
                        onChange={(e) =>
                            setFarmId(e.target.value ? Number(e.target.value) : undefined)
                        }
                        aria-label="Filter by farm"
                        className="w-full appearance-none rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] pl-9 pr-8 py-2.5 text-sm text-gray-600 dark:text-gray-300 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer"
                    >
                        <option value="">All Farms</option>
                        {farms.map((f) => (
                            <option key={f.id} value={String(f.id)}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        ▾
                    </span>
                </div>

                {/* Device Type Filter Pill */}
                <div className="relative min-w-[165px]">
                    <Cpu
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <select
                        value={deviceType}
                        onChange={(e) => setDeviceType(e.target.value)}
                        aria-label="Filter by device type"
                        className="w-full appearance-none rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] pl-9 pr-8 py-2.5 text-sm text-gray-600 dark:text-gray-300 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer"
                    >
                        <option value="">Device Type</option>
                        {DEVICE_TYPES.map((dt) => (
                            <option key={dt.value} value={dt.value}>
                                {dt.label}
                            </option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        ▾
                    </span>
                </div>

                {/* Reset Pill */}
                <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1E] transition cursor-pointer"
                >
                    <RotateCcw size={15} className="text-gray-400" />
                    <span>Reset</span>
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-4 flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Table Header Pill */}
            <div className="hidden md:grid md:grid-cols-12 items-center rounded-full bg-[#DCE7E1] dark:bg-[#142623] border border-[#004C4B]/30 dark:border-[#00E5A3]/30 px-6 py-3 text-xs sm:text-sm font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-3 text-center">Device</div>
                <div className="col-span-3 text-center">Farm / Location</div>
                <div className="col-span-2 text-center">Device Type</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-2 text-center">Last Seen</div>
            </div>

            {/* Loading / Empty / Rows */}
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 size={24} className="animate-spin text-[#004C4B] dark:text-[#00E5A3]" />
                    <span>Loading devices...</span>
                </div>
            ) : devices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/70 dark:bg-[#0D0D0D] py-12 text-center space-y-2">
                    <Cpu size={28} className="mx-auto text-gray-400" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        No devices found.
                    </p>
                    <p className="text-xs text-gray-400">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {devices.map((device, index) => {
                        const rowNumber = (page - 1) * pageSize + index + 1;
                        const statusInfo =
                            statusConfig[device.status] ?? statusConfig.NeverConnected;
                        const StatusIcon = statusInfo.icon;

                        const locationParts = [
                            device.assignment?.farmName,
                            device.assignment?.zoneName,
                            device.assignment?.blockName,
                        ].filter(Boolean);

                        return (
                            <div
                                key={device.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => router.push(`/devices/${device.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        router.push(`/devices/${device.id}`);
                                    }
                                }}
                                className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-0 rounded-2xl md:rounded-full bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 px-5 md:px-6 py-3.5 shadow-2xs hover:border-[#004C4B]/50 dark:hover:border-[#00E5A3]/50 hover:shadow-sm transition text-sm cursor-pointer"
                            >
                                {/* # */}
                                <div className="md:col-span-1 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">#</span>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        {rowNumber}
                                    </span>
                                </div>

                                {/* Device Name & MAC */}
                                <div className="md:col-span-3 flex md:flex-col md:items-center items-center justify-between min-w-0">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Device
                                    </span>
                                    <div className="text-right md:text-center min-w-0 max-w-full">
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate hover:text-[#004C4B] dark:hover:text-[#00E5A3]">
                                            {device.name}
                                        </p>
                                        <p className="text-[11px] font-mono text-gray-400 truncate">
                                            {device.macAddress}
                                        </p>
                                    </div>
                                </div>

                                {/* Farm / Location */}
                                <div className="md:col-span-3 flex md:justify-center items-center justify-between min-w-0">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Farm / Location
                                    </span>
                                    <span
                                        className="text-gray-600 dark:text-gray-300 truncate max-w-full text-xs sm:text-sm"
                                        title={locationParts.join(" › ")}
                                    >
                                        {locationParts.length > 0 ? locationParts.join(" › ") : "—"}
                                    </span>
                                </div>

                                {/* Device Type Badge */}
                                <div className="md:col-span-2 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Device Type
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#007A78] text-white px-3.5 py-0.5 text-xs font-medium">
                                        <Cpu size={11} />
                                        <span>{device.deviceType}</span>
                                    </span>
                                </div>

                                {/* Status Badge */}
                                <div className="md:col-span-1 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Status
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${statusInfo.className}`}
                                    >
                                        <StatusIcon size={11} />
                                        <span>{statusInfo.label}</span>
                                    </span>
                                </div>

                                {/* Last Seen */}
                                <div className="md:col-span-2 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Last Seen
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300">
                                        {formatLastSeen(device.lastSeenAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Footer */}
            {!loading && totalCount > 0 && (
                <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        Showing page{" "}
                        <strong className="text-gray-700 dark:text-gray-200">{page}</strong> of{" "}
                        <strong className="text-gray-700 dark:text-gray-200">{totalPages}</strong> (
                        {totalCount} {totalCount === 1 ? "device" : "devices"})
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} />
                            <span>Prev</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                        >
                            <span>Next</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
