"use client";

import { useState, useEffect } from "react";
import { X, ArrowRightLeft, Info, ChevronDown } from "lucide-react";
import { useFarms } from "@/features/farms/hooks/use-farms";
import { useFarmZones } from "@/features/farms/hooks/use-farm-zones";
import { moveDevice } from "../services/device-service";

interface MoveDeviceModalProps {
    device: {
        id: number;
        name: string;
        deviceType?: string;
        assignment?: {
            farmId: number;
            farmName: string;
            zoneId: number | null;
            zoneName: string | null;
            blockId: number | null;
            blockName: string | null;
        };
    };
    isOpen: boolean;
    onClose: () => void;
    onDeviceMoved: () => void;
}

export default function MoveDeviceModal({
    device,
    isOpen,
    onClose,
    onDeviceMoved,
}: MoveDeviceModalProps) {
    const { farms, loading: farmsLoading } = useFarms();

    const [targetFarmId, setTargetFarmId] = useState<number | "">("");
    const [targetZoneId, setTargetZoneId] = useState<string>("");
    const [targetBlockId, setTargetBlockId] = useState<string>("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize placement based on current device assignment
    useEffect(() => {
        if (isOpen) {
            const initialFarmId = device.assignment?.farmId ?? (farms[0]?.id ?? "");
            setTargetFarmId(initialFarmId);
            setTargetZoneId(
                device.assignment?.zoneId ? String(device.assignment.zoneId) : ""
            );
            setTargetBlockId(
                device.assignment?.blockId ? String(device.assignment.blockId) : ""
            );
            setError(null);
        }
    }, [isOpen, device, farms]);

    // Fetch zones for currently selected target farm
    const { zones, loading: zonesLoading } = useFarmZones(
        isOpen && targetFarmId !== "" ? Number(targetFarmId) : null
    );

    if (!isOpen) return null;

    const selectedZone = zones.find((z) => String(z.id) === targetZoneId);
    const availableBlocks = selectedZone?.blocks || [];

    const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value === "" ? "" : Number(e.target.value);
        setTargetFarmId(val);
        setTargetZoneId("");
        setTargetBlockId("");
    };

    const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTargetZoneId(e.target.value);
        setTargetBlockId("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (targetFarmId === "" || Number(targetFarmId) <= 0) {
            setError("Please select a destination farm.");
            return;
        }

        const farmId = Number(targetFarmId);
        const zoneId = targetZoneId !== "" ? Number(targetZoneId) : null;
        const blockId = targetBlockId !== "" ? Number(targetBlockId) : null;

        if (blockId !== null && zoneId === null) {
            setError("A zone must be selected if a block is specified.");
            return;
        }

        setSubmitting(true);
        try {
            await moveDevice(device.id, {
                farmId,
                zoneId,
                blockId,
            });
            onDeviceMoved();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to move device");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="move-device-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 shadow-xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <ArrowRightLeft className="text-[#004C4B] dark:text-[#00E5A3]" size={20} />
                        <h2
                            id="move-device-title"
                            className="text-lg font-semibold text-[#004C4B] dark:text-[#00E5A3]"
                        >
                            Move Device
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

                {/* Device Summary & Current Location */}
                <div className="mb-5 rounded-xl bg-[#EEF4F1] dark:bg-[#142623] px-4 py-3 space-y-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {device.name}
                    </p>
                    {device.assignment && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Current:{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {device.assignment.farmName}
                            </span>
                            {device.assignment.zoneName && (
                                <> › Zone: {device.assignment.zoneName}</>
                            )}
                            {device.assignment.blockName && (
                                <> › Block: {device.assignment.blockName}</>
                            )}
                        </p>
                    )}
                </div>

                {/* Move Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Destination Farm */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Destination Farm <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={targetFarmId}
                            onChange={handleFarmChange}
                            disabled={submitting || farmsLoading}
                            required
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] transition cursor-pointer"
                        >
                            <option value="" disabled>Select a farm</option>
                            {farms.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Destination Zone (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Zone <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <select
                            value={targetZoneId}
                            onChange={handleZoneChange}
                            disabled={submitting || zonesLoading || targetFarmId === ""}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] transition cursor-pointer disabled:opacity-50"
                        >
                            <option value="">Placed directly on farm (No zone)</option>
                            {zones.map((z) => (
                                <option key={z.id} value={z.id}>
                                    {z.name} ({z.zoneType})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Destination Block (Optional, only if zone is selected) */}
                    {targetZoneId !== "" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Block <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <select
                                value={targetBlockId}
                                onChange={(e) => setTargetBlockId(e.target.value)}
                                disabled={submitting || availableBlocks.length === 0}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] transition cursor-pointer disabled:opacity-50"
                            >
                                <option value="">Entire zone (No specific block)</option>
                                {availableBlocks.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                            {availableBlocks.length === 0 && (
                                <p className="mt-1 text-xs text-gray-400 italic">
                                    No blocks configured in this zone.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Notice */}
                    <div className="rounded-xl bg-[#EEF4F1] dark:bg-[#142623] p-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-[#004C4B] dark:text-[#00E5A3]">
                            <Info size={13} />
                            <span>Placement Notice</span>
                        </div>
                        <p>
                            Sensors and actuators will immediately serve the new location. Telemetry history remains attached to the previous location.
                        </p>
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
                            disabled={submitting || targetFarmId === ""}
                            className="flex-1 rounded-xl bg-[#004C4B] dark:bg-[#00E5A3] px-4 py-2.5 text-sm font-medium text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {submitting ? "Moving…" : "Move Device"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
