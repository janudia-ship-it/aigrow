"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle, Plus, Cpu, ChevronDown } from "lucide-react";
import { createDevice } from "../services/device-service";
import { DEVICE_TYPES, type DeviceType } from "../types/device";
import { useFarmZones } from "@/features/farms/hooks/use-farm-zones";

interface AddDeviceModalProps {
    farmId: number;
    isOpen: boolean;
    onClose: () => void;
    onDeviceCreated: () => void;
}

export default function AddDeviceModal({
    farmId,
    isOpen,
    onClose,
    onDeviceCreated,
}: AddDeviceModalProps) {
    const { zones } = useFarmZones(isOpen ? farmId : null);

    const [name, setName] = useState("");
    const [deviceType, setDeviceType] = useState<DeviceType>("Climate");
    const [macAddress, setMacAddress] = useState("");
    const [zoneId, setZoneId] = useState<string>("");
    const [blockId, setBlockId] = useState<string>("");
    const [mqttIntervalSeconds, setMqttIntervalSeconds] = useState<number>(5);
    const [isShared, setIsShared] = useState<boolean>(false);
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const selectedZone = zones.find((z) => String(z.id) === zoneId);
    const availableBlocks = selectedZone?.blocks || [];

    const handleReset = () => {
        setName("");
        setDeviceType("Climate");
        setMacAddress("");
        setZoneId("");
        setBlockId("");
        setMqttIntervalSeconds(5);
        setIsShared(false);
        setShowAdvanced(false);
        setError(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Device name is required.");
            return;
        }

        const trimmedMac = macAddress.trim();
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(trimmedMac)) {
            setError("Invalid MAC address. Must be 6 pairs of hex digits (e.g. AA:BB:CC:DD:EE:FF).");
            return;
        }

        const interval = Number(mqttIntervalSeconds);
        if (Number.isNaN(interval) || interval < 1 || interval > 300) {
            setError("MQTT Interval must be between 1 and 300 seconds.");
            return;
        }

        try {
            setLoading(true);
            await createDevice({
                name: trimmedName.slice(0, 64),
                deviceType,
                macAddress: trimmedMac,
                farmId,
                zoneId: zoneId ? Number(zoneId) : null,
                blockId: blockId ? Number(blockId) : null,
                isShared,
                mqttIntervalSeconds: interval,
            });

            handleReset();
            onDeviceCreated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create device");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 p-6 shadow-xl max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <Cpu size={20} className="text-[#004C4B] dark:text-[#00E5A3]" />
                        <h3 className="text-lg font-bold text-[#004C4B] dark:text-[#00E5A3]">
                            Add Device
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        aria-label="Close"
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-600 dark:text-red-300 flex items-center gap-2 shrink-0">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
                    {/* Device Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Device Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={64}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Greenhouse Climate Monitor"
                            required
                            disabled={loading}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        />
                    </div>

                    {/* Device Type */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Device Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={deviceType}
                            onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                            disabled={loading}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        >
                            {DEVICE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-gray-400 mt-1">
                            Device type cannot be changed once created.
                        </p>
                    </div>

                    {/* MAC Address */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            MAC Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={17}
                            value={macAddress}
                            onChange={(e) => setMacAddress(e.target.value)}
                            placeholder="AA:BB:CC:DD:EE:FF"
                            required
                            disabled={loading}
                            className="w-full font-mono uppercase rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Six pairs of hex digits separated by colons or hyphens.
                        </p>
                    </div>

                    {/* Placement (Zone & Block) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Zone Placement */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Zone (Optional)
                            </label>
                            <select
                                value={zoneId}
                                onChange={(e) => {
                                    setZoneId(e.target.value);
                                    setBlockId(""); // reset block when zone changes
                                }}
                                disabled={loading}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                            >
                                <option value="">None (Farm-level)</option>
                                {zones.map((z) => (
                                    <option key={z.id} value={z.id}>
                                        {z.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Block Placement */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Block (Optional)
                            </label>
                            <select
                                value={blockId}
                                onChange={(e) => setBlockId(e.target.value)}
                                disabled={loading || !zoneId || availableBlocks.length === 0}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B] disabled:opacity-50"
                            >
                                <option value="">None (Zone-level)</option>
                                {availableBlocks.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Advanced Settings Toggle */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:underline cursor-pointer"
                        >
                            <span>Advanced Settings</span>
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {showAdvanced && (
                            <div className="mt-3 space-y-3 p-3.5 rounded-xl bg-[#FAFBF9] dark:bg-[#161618] border border-gray-100 dark:border-gray-800">
                                {/* MQTT Interval */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        MQTT Interval (seconds)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={300}
                                        value={mqttIntervalSeconds}
                                        onChange={(e) => setMqttIntervalSeconds(Number(e.target.value))}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-1.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Default: 5s. Range: 1 to 300s. Device is considered offline after 12 missing intervals.
                                    </p>
                                </div>

                                {/* Shared Device Toggle */}
                                <div className="flex items-start gap-2.5 pt-1">
                                    <input
                                        type="checkbox"
                                        id="isShared"
                                        checked={isShared}
                                        onChange={(e) => setIsShared(e.target.checked)}
                                        disabled={loading}
                                        className="mt-1 rounded text-[#004C4B] focus:ring-[#004C4B]"
                                    />
                                    <label htmlFor="isShared" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                        <span className="font-semibold block">Share Sensor Data Across Farm</span>
                                        <span className="text-[11px] text-gray-400 block">
                                            Publishes state to farm MQTT topic so auto rules of other devices can use its sensors.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-full border border-gray-300 dark:border-gray-700 px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] hover:bg-[#003B3A] text-white px-5 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>

                                    <span>Add Device</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
