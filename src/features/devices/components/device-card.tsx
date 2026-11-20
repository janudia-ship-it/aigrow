"use client";

import { useState, useRef, useEffect } from "react";
import { Cpu, MoreVertical, Pencil, Trash2, ArrowRightLeft, Tag } from "lucide-react";
import type { DeviceSummary } from "../types/device";
import Link from "next/link";

interface DeviceCardProps {
    device: DeviceSummary;
    isManager?: boolean;
    canRename?: boolean;
    onEdit?: (device: DeviceSummary) => void;
    onMove?: (device: DeviceSummary) => void;
    onDelete?: (device: DeviceSummary) => void;
    onRename?: (device: DeviceSummary) => void;
}

export default function DeviceCard({
    device,
    isManager,
    canRename,
    onEdit,
    onMove,
    onDelete,
    onRename,
}: DeviceCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [menuOpen]);

    const statusStyles: Record<DeviceSummary["status"], string> = {
        Online: "bg-[#D7E8DF] text-[#1E5440] dark:bg-[#1C3A32] dark:text-[#6EE7B7]",
        Offline: "bg-[#FDE2E2] text-[#991B1B] dark:bg-[#3D1414] dark:text-[#FCA5A5]",
        NeverConnected: "bg-[#E2E8F0] text-[#475569] dark:bg-[#2D3748] dark:text-[#CBD5E1]",
    };

    const allowRename = Boolean(canRename ?? isManager);
    const showMoreMenu = Boolean(isManager || allowRename);

    return (
        <div className="rounded-2xl bg-[#EEF4F1] dark:bg-[#142623] px-3.5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2.5 transition-colors">
            {/* Left: Icon + Device Name */}
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                <Cpu className="text-[#004C4B] dark:text-[#00E5A3] shrink-0" size={20} />
                <Link
                    href={`/devices/${device.id}`}
                    className="font-medium text-gray-700 dark:text-gray-200 hover:text-[#004C4B] dark:hover:text-[#00E5A3] hover:underline text-xs sm:text-sm md:text-base truncate transition cursor-pointer"
                    title={`View details for ${device.name}`}
                >
                    {device.name}
                </Link>
            </div>

            {/* Right: Status Badge + Type Badge + More Options */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                {/* Status Badge */}
                <span
                    className={`rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold ${statusStyles[device.status] || statusStyles.NeverConnected}`}
                >
                    {device.status}
                </span>

                {/* Device Type Badge */}
                {device.deviceType && (
                    <span className="rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold bg-[#DCE7E1] text-[#2D5A46] dark:bg-[#203D36] dark:text-[#A7F3D0]">
                        {device.deviceType}
                    </span>
                )}


                {/* More Options Button (Admin, SuperAdmin, or Device Manager) */}
                {showMoreMenu && (
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            aria-label="Device options"
                            onClick={() => setMenuOpen((v) => !v)}
                            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800 cursor-pointer"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-lg py-1.5 z-20">
                                {allowRename && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onRename?.(device);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                    >
                                        <Tag size={13} />
                                        <span>Rename Device</span>
                                    </button>
                                )}
                                {isManager && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onEdit?.(device);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                        >
                                            <Pencil size={13} />
                                            <span>Edit Device</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onMove?.(device);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                        >
                                            <ArrowRightLeft size={13} />
                                            <span>Move Device</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onDelete?.(device);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                        >
                                            <Trash2 size={13} />
                                            <span>Delete Device</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
