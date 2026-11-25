"use client";

import { useState, useEffect, useRef } from "react";
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
    ChevronDown,
    ChevronUp,
    Info,
    MoreVertical,
    Plus,
} from "lucide-react";
import { useDeviceById } from "@/features/devices/hooks/use-device-by-id";
import { useSensorTypes } from "@/features/devices/hooks/use-sensor-types";
import { useActuatorTypes } from "@/features/devices/hooks/use-actuator-types";
import EditDeviceModal from "./edit-device-modal";
import MoveDeviceModal from "./move-device-modal";
import DeleteDeviceModal from "./delete-device-modal";
import RenameDeviceModal from "./rename-device-modal";
import RenameSensorModal from "./rename-sensor-modal";
import AddSensorModal from "./add-sensor-modal";
import AddActuatorModal from "./add-actuator-modal";
import DeleteSensorModal from "./delete-sensor-modal";
import UpdateSensorAreaModal from "./update-sensor-area-modal";
import UpdateSensorCalibrationModal from "./update-sensor-calibration-modal";
import SensorCard from "./sensor-card";
import ActuatorCard from "./actuator-card";
import RenameActuatorModal from "./rename-actuator-modal";
import UpdateActuatorModal from "./update-actuator-modal";
import UpdateActuatorAreaModal from "./update-actuator-area-modal";
import DeleteActuatorModal from "./delete-actuator-modal";
import SetActuatorModeModal from "./set-actuator-mode-modal";
import SetActuatorOverrideModal from "./set-actuator-override-modal";
import { canUpdateDevice, canRenameSensor, canRenameActuator } from "@/features/farms/utils/permissions";
import { useFarmMembers } from "@/features/farms/hooks/use-farm-members";
import type { UserProfile } from "@/features/auth/types/auth.types";
import type { Sensor, Actuator } from "../types/device";

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
    const [isAddSensorOpen, setIsAddSensorOpen] = useState(false);
    const [isAddActuatorOpen, setIsAddActuatorOpen] = useState(false);
    const [renamingSensor, setRenamingSensor] = useState<Sensor | null>(null);
    const [deletingSensor, setDeletingSensor] = useState<Sensor | null>(null);
    const [areaSensor, setAreaSensor] = useState<Sensor | null>(null);
    const [calibrationSensor, setCalibrationSensor] = useState<Sensor | null>(null);
    const [renamingActuator, setRenamingActuator] = useState<Actuator | null>(null);
    const [updatingActuator, setUpdatingActuator] = useState<Actuator | null>(null);
    const [areaActuator, setAreaActuator] = useState<Actuator | null>(null);
    const [deletingActuator, setDeletingActuator] = useState<Actuator | null>(null);
    const [modeActuator, setModeActuator] = useState<Actuator | null>(null);
    const [overrideActuator, setOverrideActuator] = useState<Actuator | null>(null);
    const [showAllSensorTypes, setShowAllSensorTypes] = useState(false);
    const [showAllActuatorTypes, setShowAllActuatorTypes] = useState(false);
    const [cardMenuOpen, setCardMenuOpen] = useState(false);
    const cardMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!cardMenuOpen) return;
        function handleClick(e: MouseEvent) {
            if (cardMenuRef.current && !cardMenuRef.current.contains(e.target as Node)) {
                setCardMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [cardMenuOpen]);

    const { sensorTypes, getSensorType } = useSensorTypes();
    const { actuatorTypes, getActuatorType } = useActuatorTypes();

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

    // Permission checks: Admin/SuperAdmin or Device Manage permission
    const { members: farmMembers } = useFarmMembers(device?.assignment?.farmId ?? null);
    const currentMember = farmMembers.find((m) => m.userId === user?.id);
    const isAuthorizedAdmin = canUpdateDevice(user);
    const canManageSensors = canRenameSensor(user, currentMember?.permissions);
    const canManageActuators = canRenameActuator(user, currentMember?.permissions);

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

                                {/* More Options (Authorized Admin) */}
                                {isAuthorizedAdmin && (
                                    <div className="relative" ref={cardMenuRef}>
                                        <button
                                            type="button"
                                            aria-label="Device options"
                                            onClick={() => setCardMenuOpen((v) => !v)}
                                            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800 cursor-pointer"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {cardMenuOpen && (
                                            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-lg py-1.5 z-20">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCardMenuOpen(false);
                                                        setIsRenameModalOpen(true);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                >
                                                    <Tag size={13} />
                                                    <span>Rename Device</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCardMenuOpen(false);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                >
                                                    <Pencil size={13} />
                                                    <span>Update Device</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCardMenuOpen(false);
                                                        setIsMoveModalOpen(true);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                >
                                                    <ArrowRightLeft size={13} />
                                                    <span>Move Device</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCardMenuOpen(false);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                                >
                                                    <Trash2 size={13} />
                                                    <span>Delete Device</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}


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
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-[#EEF4F1] dark:bg-[#142623] px-3 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {device.sensors?.length ?? 0} {device.sensors?.length === 1 ? "sensor" : "sensors"}
                                </span>
                                {isAuthorizedAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddSensorOpen(true)}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition cursor-pointer shadow-xs"
                                    >

                                        <span>Add Sensor</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {!device.sensors || device.sensors.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-gray-400">
                                    No sensors configured for this device.
                                </p>
                                {isAuthorizedAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddSensorOpen(true)}
                                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#004C4B] dark:border-[#00E5A3] px-4 py-2 text-xs font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer"
                                    >
                                        <Plus size={13} />
                                        <span>Add First Sensor</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {device.sensors.map((sensor) => (
                                    <SensorCard
                                        key={sensor.id}
                                        sensor={sensor}
                                        sensorTypeInfo={getSensorType(sensor.sensorType)}
                                        canManage={canManageSensors}
                                        isAdmin={isAuthorizedAdmin}
                                        onRename={(s) => setRenamingSensor(s)}
                                        onUpdateSensor={(s) => setRenamingSensor(s)}
                                        onUpdateArea={(s) => setAreaSensor(s)}
                                        onUpdateCalibration={(s) => setCalibrationSensor(s)}
                                        onDelete={(s) => setDeletingSensor(s)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Supported Sensor Types Reference (Any logged-in user can view) */}
                        <div className="mt-5 pt-4 border-t border-gray-200/80 dark:border-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    <Info size={13} className="text-[#004C4B] dark:text-[#00E5A3]" />
                                    <span>Supported Sensor Types ({sensorTypes.length})</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAllSensorTypes((prev) => !prev)}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-[#004C4B] dark:text-[#00E5A3] hover:underline cursor-pointer"
                                >
                                    <span>{showAllSensorTypes ? "Hide Types" : "View Supported Sensor Types"}</span>
                                    {showAllSensorTypes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                </button>
                            </div>

                            {showAllSensorTypes && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-xl bg-[#EEF4F1]/60 dark:bg-[#142623]/60 border border-gray-200/80 dark:border-gray-800/80">
                                    {sensorTypes.map((st) => (
                                        <div
                                            key={st.sensorType}
                                            className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-[#0D0D0D]/60 text-xs"
                                        >
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {st.displayName}
                                            </span>
                                            <span className="text-gray-400 font-mono text-[11px]">
                                                {st.unit ? st.unit : "no unit"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-[#EEF4F1] dark:bg-[#142623] px-3 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {device.actuators?.length ?? 0} {device.actuators?.length === 1 ? "actuator" : "actuators"}
                                </span>
                                {isAuthorizedAdmin && device.deviceType !== "WeatherStation" && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddActuatorOpen(true)}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition cursor-pointer shadow-xs"
                                    >
                                        <span>Add Actuator</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {!device.actuators || device.actuators.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-gray-400">
                                    No actuators configured for this device.
                                </p>
                                {isAuthorizedAdmin && device.deviceType !== "WeatherStation" && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddActuatorOpen(true)}
                                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#004C4B] dark:border-[#00E5A3] px-4 py-2 text-xs font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer"
                                    >
                                        <Plus size={13} />
                                        <span>Add First Actuator</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {device.actuators.map((actuator) => (
                                    <ActuatorCard
                                        key={actuator.id}
                                        actuator={actuator}
                                        actuatorTypeInfo={getActuatorType(actuator.actuatorType)}
                                        canManage={canManageActuators}
                                        isAdmin={isAuthorizedAdmin}
                                        onRename={(a) => setRenamingActuator(a)}
                                        onUpdateActuator={(a) => setUpdatingActuator(a)}
                                        onUpdateArea={(a) => setAreaActuator(a)}
                                        onDelete={(a) => setDeletingActuator(a)}
                                        onChangeMode={(a) => setModeActuator(a)}
                                        onSetOverride={(a) => setOverrideActuator(a)}
                                        onModeChanged={() => refetch()}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Supported Actuator Types Reference (Any logged-in user can view) */}
                        <div className="mt-5 pt-4 border-t border-gray-200/80 dark:border-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    <Info size={13} className="text-[#004C4B] dark:text-[#00E5A3]" />
                                    <span>Supported Actuator Types ({actuatorTypes.length})</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAllActuatorTypes((prev) => !prev)}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-[#004C4B] dark:text-[#00E5A3] hover:underline cursor-pointer"
                                >
                                    <span>{showAllActuatorTypes ? "Hide Types" : "View Supported Actuator Types"}</span>
                                    {showAllActuatorTypes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                </button>
                            </div>

                            {showAllActuatorTypes && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-xl bg-[#EEF4F1]/60 dark:bg-[#142623]/60 border border-gray-200/80 dark:border-gray-800/80">
                                    {actuatorTypes.map((at) => (
                                        <div
                                            key={at.actuatorType}
                                            className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-[#0D0D0D]/60 text-xs"
                                        >
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {at.displayName}
                                            </span>
                                            <span className="text-gray-400 font-mono text-[11px]">
                                                {at.actuatorType}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

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

            {/* Rename Sensor Modal */}
            {renamingSensor && (
                <RenameSensorModal
                    sensor={renamingSensor}
                    isOpen={true}
                    onClose={() => setRenamingSensor(null)}
                    onSensorRenamed={() => {
                        refetch();
                        setRenamingSensor(null);
                    }}
                />
            )}

            {/* Add Sensor Modal */}
            {device && (
                <AddSensorModal
                    deviceId={deviceId}
                    isOpen={isAddSensorOpen}
                    onClose={() => setIsAddSensorOpen(false)}
                    onSensorAdded={() => {
                        refetch();
                    }}
                />
            )}

            {/* Add Actuator Modal */}
            {device && (
                <AddActuatorModal
                    deviceId={deviceId}
                    deviceType={device.deviceType}
                    isOpen={isAddActuatorOpen}
                    onClose={() => setIsAddActuatorOpen(false)}
                    onActuatorAdded={() => {
                        refetch();
                    }}
                />
            )}

            {/* Delete Sensor Modal */}
            <DeleteSensorModal
                sensor={deletingSensor}
                isOpen={!!deletingSensor}
                onClose={() => setDeletingSensor(null)}
                onSensorDeleted={() => {
                    refetch();
                    setDeletingSensor(null);
                }}
            />

            {/* Update Sensor Area Modal */}
            <UpdateSensorAreaModal
                sensor={areaSensor}
                farmId={device?.assignment?.farmId ?? 0}
                isOpen={!!areaSensor}
                onClose={() => setAreaSensor(null)}
                onAreaUpdated={() => {
                    refetch();
                    setAreaSensor(null);
                }}
            />

            {/* Update Sensor Calibration Modal */}
            <UpdateSensorCalibrationModal
                sensor={calibrationSensor}
                isOpen={!!calibrationSensor}
                onClose={() => setCalibrationSensor(null)}
                onCalibrationUpdated={() => {
                    setCalibrationSensor(null);
                }}
            />

            {/* Rename Actuator Modal */}
            {renamingActuator && (
                <RenameActuatorModal
                    actuator={renamingActuator}
                    isOpen={true}
                    onClose={() => setRenamingActuator(null)}
                    onActuatorRenamed={() => {
                        refetch();
                        setRenamingActuator(null);
                    }}
                />
            )}

            {/* Update Actuator Modal */}
            {updatingActuator && (
                <UpdateActuatorModal
                    actuator={updatingActuator}
                    isOpen={true}
                    onClose={() => setUpdatingActuator(null)}
                    onActuatorUpdated={() => {
                        refetch();
                        setUpdatingActuator(null);
                    }}
                />
            )}

            {/* Update Actuator Area Modal */}
            <UpdateActuatorAreaModal
                actuator={areaActuator}
                farmId={device?.assignment?.farmId ?? 0}
                isOpen={!!areaActuator}
                onClose={() => setAreaActuator(null)}
                onAreaUpdated={() => {
                    refetch();
                    setAreaActuator(null);
                }}
            />

            {/* Delete Actuator Modal */}
            <DeleteActuatorModal
                actuator={deletingActuator}
                isOpen={!!deletingActuator}
                onClose={() => setDeletingActuator(null)}
                onActuatorDeleted={() => {
                    refetch();
                    setDeletingActuator(null);
                }}
            />

            {/* Set Actuator Mode Modal */}
            {modeActuator && (
                <SetActuatorModeModal
                    actuator={modeActuator}
                    isOpen={true}
                    onClose={() => setModeActuator(null)}
                    onModeChanged={() => {
                        refetch();
                        setModeActuator(null);
                    }}
                />
            )}

            {/* Set Actuator Override Modal */}
            {overrideActuator && (
                <SetActuatorOverrideModal
                    actuator={overrideActuator}
                    isOpen={true}
                    onClose={() => setOverrideActuator(null)}
                    onOverrideSet={() => {
                        refetch();
                        setOverrideActuator(null);
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
