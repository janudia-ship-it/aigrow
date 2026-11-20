"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Save } from "lucide-react";
import { updateZone } from "../services/zone-service";
import { ZONE_TYPES, type Zone, type ZoneType } from "../types/zone.types";

interface EditZoneModalProps {
    zone: Zone | null;
    isOpen: boolean;
    onClose: () => void;
    onZoneUpdated: () => void;
}

export default function EditZoneModal({
    zone,
    isOpen,
    onClose,
    onZoneUpdated,
}: EditZoneModalProps) {
    const [name, setName] = useState("");
    const [zoneType, setZoneType] = useState<ZoneType>("Greenhouse");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (zone) {
            setName(zone.name || "");
            const match = ZONE_TYPES.find((t) => t.value.toLowerCase() === zone.zoneType?.toLowerCase());
            setZoneType(match ? match.value : "Greenhouse");
            setError(null);
        }
    }, [zone]);

    if (!isOpen || !zone) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Zone name is required.");
            return;
        }

        try {
            setLoading(true);
            await updateZone(zone.id, {
                name: trimmedName.slice(0, 64),
                zoneType,
            });

            onZoneUpdated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update zone");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-[#004C4B] dark:text-[#00E5A3]">
                        Edit Zone
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-600 dark:text-red-300 flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Zone Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Zone Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={64}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Zone 1 / North Section"
                            required
                            disabled={loading}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        />
                    </div>

                    {/* Zone Type */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Zone Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={zoneType}
                            onChange={(e) => setZoneType(e.target.value as ZoneType)}
                            disabled={loading}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        >
                            {ZONE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
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
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
