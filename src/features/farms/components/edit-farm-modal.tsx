"use client";

import { useState, useEffect } from "react";
import { X, Pencil, AlertCircle, Loader2 } from "lucide-react";
import { updateFarmClient } from "../services/farm-service";
import type { Farm, UpdateFarmPayload } from "../types/farm.types";

interface EditFarmModalProps {
    farm: Farm | null;
    isOpen: boolean;
    onClose: () => void;
    onFarmUpdated: () => void;
}

const COMMON_UTC_OFFSETS = [
    { label: "(UTC-08:00) Pacific Time", value: "-08:00" },
    { label: "(UTC-05:00) Eastern Time", value: "-05:00" },
    { label: "(UTC+00:00) UTC / London", value: "+00:00" },
    { label: "(UTC+01:00) Central European", value: "+01:00" },
    { label: "(UTC+03:00) Moscow / Arabia", value: "+03:00" },
    { label: "(UTC+04:00) Gulf Standard", value: "+04:00" },
    { label: "(UTC+05:00) Pakistan / West Asia", value: "+05:00" },
    { label: "(UTC+05:30) Sri Lanka / India", value: "+05:30" },
    { label: "(UTC+05:45) Nepal", value: "+05:45" },
    { label: "(UTC+06:00) Bangladesh", value: "+06:00" },
    { label: "(UTC+07:00) Bangkok / Jakarta", value: "+07:00" },
    { label: "(UTC+08:00) Singapore / Beijing", value: "+08:00" },
    { label: "(UTC+09:00) Tokyo / Seoul", value: "+09:00" },
    { label: "(UTC+10:00) Sydney / Melbourne", value: "+10:00" },
];

export default function EditFarmModal({
    farm,
    isOpen,
    onClose,
    onFarmUpdated,
}: EditFarmModalProps) {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [utcOffset, setUtcOffset] = useState("+05:30");
    const [sizeAcre, setSizeAcre] = useState<string>("1.0");
    const [latitude, setLatitude] = useState<string>("6.9271");
    const [longitude, setLongitude] = useState<string>("79.8612");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && farm) {
            setName(farm.name || "");
            setAddress(farm.address || "");
            setUtcOffset(farm.utcOffset || farm.timeZoneId || "+05:30");
            setSizeAcre(String(farm.sizeAcre ?? 1.0));
            setLatitude(farm.latitude !== null && farm.latitude !== undefined ? String(farm.latitude) : "6.9271");
            setLongitude(farm.longitude !== null && farm.longitude !== undefined ? String(farm.longitude) : "79.8612");
            setError(null);
        }
    }, [isOpen, farm]);

    if (!isOpen || !farm) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const parsedSize = Number(sizeAcre);
        const parsedLat = Number(latitude);
        const parsedLong = Number(longitude);

        if (!name.trim()) {
            setError("Farm name is required.");
            return;
        }
        if (!address.trim()) {
            setError("Location / address is required.");
            return;
        }
        if (isNaN(parsedSize) || parsedSize <= 0) {
            setError("Size in acres must be a positive number.");
            return;
        }
        if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
            setError("Latitude must be between -90 and 90.");
            return;
        }
        if (isNaN(parsedLong) || parsedLong < -180 || parsedLong > 180) {
            setError("Longitude must be between -180 and 180.");
            return;
        }

        const tzValue = utcOffset.trim() || "+05:30";
        const payload: UpdateFarmPayload = {
            name: name.trim().slice(0, 64),
            timeZone: tzValue,
            timeZoneId: farm.timeZoneId || tzValue,
            utcOffset: tzValue,
            address: address.trim().slice(0, 500),
            sizeAcre: Math.round(parsedSize * 1000) / 1000,
            latitude: Math.round(parsedLat * 1000000) / 1000000,
            longitude: Math.round(parsedLong * 1000000) / 1000000,
        };

        setSubmitting(true);
        try {
            await updateFarmClient(farm.id, payload);
            onFarmUpdated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update farm");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-farm-title"
        >
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl z-10 transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3]">
                            <Pencil size={16} />
                        </div>
                        <div>
                            <h3
                                id="edit-farm-title"
                                className="text-base font-bold text-gray-900 dark:text-gray-100"
                            >
                                Update Farm
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {farm.name} (ID #{farm.id})
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
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

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Farm Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={64}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={submitting}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Location / Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={500}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled={submitting}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Total Area (Acres) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={sizeAcre}
                                onChange={(e) => setSizeAcre(e.target.value)}
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Timezone (UTC Offset)
                            </label>
                            <select
                                value={utcOffset}
                                onChange={(e) => setUtcOffset(e.target.value)}
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer"
                            >
                                {COMMON_UTC_OFFSETS.map((tz) => (
                                    <option key={tz.value} value={tz.value}>
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                min={-90}
                                max={90}
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                min={-180}
                                max={180}
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                            />
                        </div>
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
                            disabled={submitting || !name.trim() || !address.trim()}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-5 py-2 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] disabled:opacity-50 transition cursor-pointer shadow-xs"
                        >
                            {submitting && <Loader2 size={13} className="animate-spin" />}
                            <span>{submitting ? "Updating..." : "Update Farm"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
