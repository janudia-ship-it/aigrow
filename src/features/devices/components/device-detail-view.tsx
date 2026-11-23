"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Cpu,
    ArrowLeft,
    Clock,
    Wifi,
    WifiOff,
    HelpCircle,
    Activity,
    MapPin,
    ToggleLeft,
    ToggleRight,
    Sliders,
    AlertCircle,
    RefreshCw,
    Pencil,
    ArrowRightLeft,
    Trash2,
    Tag,
} from "lucide-react";
import { useDeviceById } from "@/features/devices/hooks/use-device-by-id";
import EditDeviceModal from "./edit-device-modal";
import MoveDeviceModal from "./move-device-modal";
import DeleteDeviceModal from "./delete-device-modal";
import RenameDeviceModal from "./rename-device-modal";
import { canUpdateDevice } from "@/features/farms/utils/permissions";
import type { UserProfile } from "@/features/auth/types/auth.types";

const statusConfig: Record<
    string,
    { icon: typeof Wifi; label: string; className: string }
> = {
    Online: {
        icon: Wifi,
        label: "Online",
        className: "bg-[#D7E8DF] text-[#1E5440] dark:bg-[#1C3A32] dark:text-[#6EE7B7]",
    },
    Offline: {
        icon: WifiOff,
        label: "Offline",
        className: "bg-[#FDE2E2] text-[#991B1B] dark:bg-[#3D1414] dark:text-[#FCA5A5]",
    },
    NeverConnected: {
        icon: HelpCircle,
        label: "Never Connected",
        className: "bg-[#E2E8F0] text-[#475569] dark:bg-[#2D3748] dark:text-[#CBD5E1]",
    },
};

interface DeviceDetailViewProps {
    deviceId: number;
    currentUser?: UserProfile | null;
}

export default function DeviceDetailView({
    deviceId,
    currentUser,
}: DeviceDetailViewProps) {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(currentUser ?? null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

    // Fetch user from session if not provided by server component
    useEffect(() => {
        if (!user || !user.role) {
            fetch("/api/auth/session")
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data?.user) setUser(data.user);
                })
                .catch(() => { });
        }
    }, [user]);

    const { device, loading, error, refetch } = useDeviceById(deviceId);

    const isAuthorizedAdmin = canUpdateDevice(user);

    const statusInfo = device
        ? statusConfig[device.status] ?? statusConfig.NeverConnected
        : null;

    return (
        <div className="space-y-6">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex items-center justify-between flex-wrap gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[#004C4B] dark:text-[#00E5A3] hover:underline cursor-pointer shrink-0"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    {device && (
                        <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                            / Farm:{" "}
                            <Link
                                href="/farm"
                                className="text-[#004C4B] dark:text-[#00E5A3] hover:underline"
                            >
                                {device.assignment.farmName}
                            </Link>
                            {" "}/ <span className="text-gray-700 dark:text-gray-300 font-medium">{device.name}</span>
                        </span>
                    )}
                </div>

                {device && (
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {isAuthorizedAdmin && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsRenameModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#004C4B] dark:border-[#00E5A3] bg-white dark:bg-[#142623] px-3.5 py-1.5 text-xs font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer shadow-xs"
                                >
                                    {/* <Tag size={13} /> */}
                                    <span>Rename Device</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition cursor-pointer shadow-xs"
                                >
                                    {/* <Pencil size={13} /> */}
                                    <span>Update Device</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsMoveModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#004C4B] dark:border-[#00E5A3] bg-white dark:bg-[#142623] px-3.5 py-1.5 text-xs font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer shadow-xs"
                                >
                                    {/* <ArrowRightLeft size={13} /> */}
                                    <span>Move Device</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-3.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition cursor-pointer shadow-xs"
                                >
                                    {/* <Trash2 size={13} /> */}
                                    <span>Delete Device</span>
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            onClick={() => refetch()}
                            aria-label="Refresh device details"
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer shrink-0"
                        >
                            <RefreshCw size={13} />
                            <span>Refresh</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-8 sm:p-10 bg-white dark:bg-[#0D0D0D] text-center shadow-xs">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#004C4B] dark:border-[#00E5A3] mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading device details...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="rounded-2xl border border-red-200 dark:border-red-800 p-6 sm:p-8 bg-white dark:bg-[#0D0D0D] text-center shadow-xs">
                    <AlertCircle className="mx-auto text-red-500 mb-2" size={28} />
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">{error}</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-4 py-1.5 text-xs font-medium text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Device Content */}
            {!loading && !error && device && (
                <div className="space-y-5 sm:space-y-6">
                    {/* Device Summary Card */}
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 sm:p-7 bg-white dark:bg-[#0D0D0D] shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl dark:bg-[#142623] shrink-0">
                                    <Cpu className="text-[#004C4B] dark:text-[#00E5A3]" size={22} />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {device.name}
                                    </h1>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        Device ID: #{device.id}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                {/* Status badge */}
                                {statusInfo && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${statusInfo.className}`}
                                    >
                                        <statusInfo.icon size={13} />
                                        {statusInfo.label}
                                    </span>
                                )}

                                {/* Device Type badge */}
                                <span className="rounded-full px-3.5 py-1 text-xs font-semibold bg-[#DCE7E1] text-[#2D5A46] dark:bg-[#203D36] dark:text-[#A7F3D0]">
                                    {device.deviceType}
                                </span>


                            </div>
                        </div>

                        {/* Assignment and Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Placement Location */}
                            <div className="rounded-xl bg-[#EEF4F1] dark:bg-[#142623] p-4 flex items-start gap-3">
                                <MapPin className="text-[#004C4B] dark:text-[#00E5A3] shrink-0 mt-0.5" size={18} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Placement</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                        {device.assignment.zoneName ? (
                                            <>
                                                Zone: {device.assignment.zoneName}
                                                {device.assignment.blockName && (
                                                    <span className="text-gray-500 dark:text-gray-400 font-normal">
                                                        {" "}› Block: {device.assignment.blockName}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            "Placed directly on farm"
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Farm: {device.assignment.farmName}
                                    </p>
                                </div>
                            </div>

                            {/* Last Activity */}
                            <div className="rounded-xl bg-[#EEF4F1] dark:bg-[#142623] p-4 flex items-start gap-3">
                                <Clock className="text-[#004C4B] dark:text-[#00E5A3] shrink-0 mt-0.5" size={18} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Last Seen</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                        {device.lastSeenAt
                                            ? new Date(device.lastSeenAt).toLocaleString()
                                            : "Never connected"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {device.status === "Online"
                                            ? "Actively sending heartbeats"
                                            : "No recent messages received"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sensors Section */}
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 sm:p-7 bg-white dark:bg-[#0D0D0D] shadow-xs">
                        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <Activity className="text-[#004C4B] dark:text-[#00E5A3]" size={20} />
                                <h2 className="text-lg sm:text-xl font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                                    Sensors
                                </h2>
                            </div>
                            <span className="rounded-full bg-[#EEF4F1] dark:bg-[#142623] px-3 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                                {device.sensors?.length ?? 0} {device.sensors?.length === 1 ? "sensor" : "sensors"}
                            </span>
                        </div>

                        {!device.sensors || device.sensors.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center">
                                No sensors configured for this device.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {device.sensors.map((sensor) => (
                                    <div
                                        key={sensor.id}
                                        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-[#EEF4F1]/60 dark:bg-[#142623]/60 p-4 transition hover:border-[#004C4B]/40 dark:hover:border-[#00E5A3]/40"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-[#DCE7E1] text-[#2D5A46] dark:bg-[#203D36] dark:text-[#A7F3D0]">
                                                {sensor.sensorType}
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                ID: #{sensor.id}
                                            </span>
                                        </div>

                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                            {sensor.name}
                                        </p>

                                        <div className="mt-3 pt-3 border-t border-gray-200/80 dark:border-gray-800/80 flex items-baseline justify-between">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Current Reading</span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                {sensor.value !== null && sensor.value !== undefined
                                                    ? `${sensor.value} ${sensor.unit ?? ""}`
                                                    : "—"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {device.status !== "Online" && (
                            <p className="text-xs text-gray-400 mt-4 italic">
                                * Sensor readings are reported only while the device is Online.
                            </p>
                        )}
                    </div>

                    {/* Actuators Section */}
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 sm:p-7 bg-white dark:bg-[#0D0D0D] shadow-xs">
                        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <Sliders className="text-[#004C4B] dark:text-[#00E5A3]" size={20} />
                                <h2 className="text-lg sm:text-xl font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                                    Actuators
                                </h2>
                            </div>
                            <span className="rounded-full bg-[#EEF4F1] dark:bg-[#142623] px-3 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                                {device.actuators?.length ?? 0} {device.actuators?.length === 1 ? "actuator" : "actuators"}
                            </span>
                        </div>


                        {!device.actuators || device.actuators.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center">
                                No actuators configured for this device.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {device.actuators.map((actuator) => {
                                    const isOn = actuator.value === 1;

                                    return (
                                        <div
                                            key={actuator.id}
                                            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-[#EEF4F1]/60 dark:bg-[#142623]/60 p-4 transition hover:border-[#004C4B]/40 dark:hover:border-[#00E5A3]/40 space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-[#DCE7E1] text-[#2D5A46] dark:bg-[#203D36] dark:text-[#A7F3D0]">
                                                    {actuator.actuatorType}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    ID: #{actuator.id}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                    {actuator.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Control Mode: <span className="font-medium text-gray-700 dark:text-gray-300">{actuator.controlMode}</span>
                                                </p>
                                            </div>

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
                                            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                                                <span>Remote: {actuator.isRemoteEnabled ? "Enabled" : "Disabled"}</span>
                                                {actuator.override && (
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                        Override Active ({actuator.override.state ? "ON" : "OFF"})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {device.status !== "Online" && (
                            <p className="text-xs text-gray-400 mt-4 italic">
                                * Actuator states (1 = ON, 0 = OFF) are reported only while the device is Online.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Rename Device Modal */}
            {device && (
                <RenameDeviceModal
                    device={device}
                    isOpen={isRenameModalOpen}
                    onClose={() => setIsRenameModalOpen(false)}
                    onDeviceRenamed={() => {
                        refetch();
                    }}
                />
            )}

            {/* Update Device Modal */}
            {device && (
                <EditDeviceModal
                    device={device}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onDeviceUpdated={() => {
                        refetch();
                    }}
                />
            )}

            {/* Move Device Modal */}
            {device && (
                <MoveDeviceModal
                    device={device}
                    isOpen={isMoveModalOpen}
                    onClose={() => setIsMoveModalOpen(false)}
                    onDeviceMoved={() => {
                        refetch();
                    }}
                />
            )}

            {/* Delete Device Modal */}
            {device && (
                <DeleteDeviceModal
                    device={device}
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDeviceDeleted={() => {
                        router.push("/farm");
                    }}
                />
            )}
        </div>
    );
}
