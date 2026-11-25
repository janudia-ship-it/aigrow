"use client";

import { useState } from "react";
import { X, MapPin, AlertCircle, Loader2 } from "lucide-react";
import type { Actuator } from "../types/device";
import { useFarmZones } from "@/features/farms/hooks/use-farm-zones";
import { updateActuatorAreas } from "../services/device-service";

interface UpdateActuatorAreaModalProps {
    actuator: Actuator | null;
    farmId: number;
    isOpen: boolean;
    onClose: () => void;
    onAreaUpdated: () => void;
}

export default function UpdateActuatorAreaModal({
    actuator,
    farmId,
    isOpen,
    onClose,
    onAreaUpdated,
}: UpdateActuatorAreaModalProps) {
    const { zones, loading: loadingZones } = useFarmZones(isOpen ? farmId : null);
    const [zoneId, setZoneId] = useState<string>("");
    const [blockId, setBlockId] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !actuator) return null;

    const selectedZone = zones.find((z) => String(z.id) === zoneId);
    const availableBlocks = selectedZone?.blocks || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const parsedZoneId = zoneId ? Number(zoneId) : null;
            const parsedBlockId = blockId ? Number(blockId) : null;

            const areas = [
                {
                    zoneId: parsedZoneId,
                    blockId: parsedBlockId,
                },
            ];

            await updateActuatorAreas(actuator.id, areas);
            onAreaUpdated();
            onClose();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to update actuator areas");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-actuator-area-title"
        >
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl z-10 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3]">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <h3
                                id="update-actuator-area-title"
                                className="text-base font-bold text-gray-900 dark:text-gray-100"
                            >
                                Update Actuator Area
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {actuator.name} (ID #{actuator.id})
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span className="flex-1">{error}</span>
                        </div>
                    )}

                    <div className="rounded-xl bg-gray-50 dark:bg-[#1A1A1E] p-3 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <AlertCircle size={15} className="text-[#004C4B] dark:text-[#00E5A3] shrink-0 mt-0.5" />
                        <span>
                            Specify which zone or block area this actuator controls within the farm.
                        </span>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Target Zone
                        </label>
                        <select
                            value={zoneId}
                            onChange={(e) => {
                                setZoneId(e.target.value);
                                setBlockId("");
                            }}
                            disabled={submitting || loadingZones}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer"
                        >
                            <option value="">No specific zone (Whole Farm)</option>
                            {zones.map((z) => (
                                <option key={z.id} value={String(z.id)}>
                                    {z.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Target Block
                        </label>
                        <select
                            value={blockId}
                            onChange={(e) => setBlockId(e.target.value)}
                            disabled={submitting || !zoneId || availableBlocks.length === 0}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer disabled:opacity-50"
                        >
                            <option value="">
                                {!zoneId
                                    ? "Select a zone first"
                                    : availableBlocks.length === 0
                                    ? "No blocks in this zone"
                                    : "Entire Zone (All Blocks)"}
                            </option>
                            {availableBlocks.map((b) => (
                                <option key={b.id} value={String(b.id)}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-full px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-5 py-2 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] disabled:opacity-50 transition cursor-pointer shadow-xs"
                        >
                            {submitting && <Loader2 size={13} className="animate-spin" />}
                            <span>{submitting ? "Saving..." : "Save Area"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
