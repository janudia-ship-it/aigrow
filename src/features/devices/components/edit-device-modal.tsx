"use client";

import { useState, useEffect } from "react";
import { X, Cpu } from "lucide-react";
import type { DeviceSummary, UpdateDevicePayload } from "../types/device";
import { updateDevice } from "../services/device-service";

interface EditDeviceModalProps {
    device: {
        id: number;
        name: string;
        deviceType?: string;
        macAddress?: string;
        isShared?: boolean;
        mqttIntervalSeconds?: number;
    };
    isOpen: boolean;
    onClose: () => void;
    onDeviceUpdated: () => void;
}

export default function EditDeviceModal({
    device,
    isOpen,
    onClose,
    onDeviceUpdated,
}: EditDeviceModalProps) {
    const [name, setName] = useState(device.name ?? "");
    const [macAddress, setMacAddress] = useState(device.macAddress ?? "");
    const [isShared, setIsShared] = useState(device.isShared ?? false);
    const [mqttIntervalSeconds, setMqttIntervalSeconds] = useState(
        device.mqttIntervalSeconds ?? 5
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync when device prop changes
    useEffect(() => {
        setName(device.name ?? "");
        setMacAddress(device.macAddress ?? "");
        setIsShared(device.isShared ?? false);
        setMqttIntervalSeconds(device.mqttIntervalSeconds ?? 5);
        setError(null);
    }, [device]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(macAddress.trim())) {
            setError("Invalid MAC address format. Example: AA:BB:CC:DD:EE:FF");
            return;
        }

        const interval = Number(mqttIntervalSeconds);
        if (!Number.isInteger(interval) || interval < 1 || interval > 300) {
            setError("MQTT interval must be between 1 and 300 seconds.");
            return;
        }

        setSubmitting(true);
        try {
            const payload: UpdateDevicePayload = {
                name: name.trim(),
                macAddress: macAddress.trim().replace(/-/g, ":").toUpperCase(),
                isShared,
                mqttIntervalSeconds: interval,
            };
            await updateDevice(device.id, payload);
            onDeviceUpdated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update device");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-device-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 shadow-xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Cpu className="text-[#004C4B] dark:text-[#00E5A3]" size={20} />
                        <h2
                            id="edit-device-title"
                            className="text-lg font-semibold text-[#004C4B] dark:text-[#00E5A3]"
                        >
                            Edit Device
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Device Type (read-only info) */}
                <div className="mb-5 rounded-xl bg-[#EEF4F1] dark:bg-[#142623] px-4 py-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="text-sm font-medium text-[#004C4B] dark:text-[#00E5A3]">
                        {device.deviceType}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 italic">Cannot be changed</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Device Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={64}
                            required
                            placeholder="Enter device name"
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] transition"
                        />
                        <p className="mt-1 text-xs text-gray-400">{name.length}/64 characters</p>
                    </div>

                    {/* MAC Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            MAC Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={macAddress}
                            onChange={(e) => setMacAddress(e.target.value)}
                            required
                            placeholder="AA:BB:CC:DD:EE:FF"
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] transition font-mono"
                        />
                    </div>

                    {/* MQTT Interval */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            MQTT Interval (seconds) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={mqttIntervalSeconds}
                            onChange={(e) => setMqttIntervalSeconds(Number(e.target.value))}
                            min={1}
                            max={300}
                            required
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] transition"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Device is considered offline after 12 missed intervals. Range: 1–300 s.
                        </p>
                    </div>

                    {/* Is Shared */}
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Share device sensors
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Other devices on this farm can use this device&apos;s sensor readings.
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isShared}
                            onClick={() => setIsShared((v) => !v)}
                            className={`relative ml-4 flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${isShared
                                ? "bg-[#004C4B] dark:bg-[#00E5A3]"
                                : "bg-gray-300 dark:bg-gray-600"
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${isShared ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !name.trim() || !macAddress.trim()}
                            className="flex-1 rounded-xl bg-[#004C4B] dark:bg-[#00E5A3] px-4 py-2.5 text-sm font-medium text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {submitting ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
