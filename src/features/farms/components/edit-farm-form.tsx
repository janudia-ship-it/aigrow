"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateFarmClient } from "../services/farm-service";
import type { Farm, UpdateFarmPayload } from "../types/farm.types";
import { toast } from "sonner";

interface EditFarmFormProps {
    farm: Farm;
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

export default function EditFarmForm({ farm }: EditFarmFormProps) {
    const router = useRouter();

    const [name, setName] = useState(farm.name || "");
    const [utcOffset, setUtcOffset] = useState(farm.utcOffset || farm.timeZoneId || "+05:30");
    const [address, setAddress] = useState(farm.address || "");
    const [sizeAcre, setSizeAcre] = useState<number | string>(farm.sizeAcre ?? 1.0);
    const [latitude, setLatitude] = useState<number | string>(farm.latitude ?? 6.9271);
    const [longitude, setLongitude] = useState<number | string>(farm.longitude ?? 79.8612);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const parsedSize = Number(sizeAcre);
        const parsedLat = Number(latitude);
        const parsedLong = Number(longitude);

        if (!name.trim()) {
            setError("Farm name is required.");
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

        try {
            setLoading(true);

            await updateFarmClient(farm.id, payload);

            // Show success toast
            toast.success("Farm properties updated successfully!");

            // Navigate to the previous page
            router.back();

        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update farm properties";

            setError(errorMessage);

            toast.error(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0D0D0D] p-4 sm:p-8 shadow-xs">
            <h1 className="text-xl sm:text-2xl font-bold text-[#004C4B] dark:text-[#00E5A3] mb-2">
                Edit Property Facts
            </h1>
            <p className="text-sm text-gray-500 mb-6">
                Update the official property details for <span className="font-semibold text-gray-700 dark:text-gray-300">{farm.name}</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Farm Name */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Farm Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        maxLength={64}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Green Valley Farm"
                        required
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                    />
                </div>

                {/* Location / Address */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Location / Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        maxLength={500}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Galle, Southern Province, Sri Lanka"
                        required
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                    />
                </div>

                {/* Grid: Size & Timezone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Size in Acres */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Size (Acres) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={sizeAcre}
                            onChange={(e) => setSizeAcre(e.target.value)}
                            placeholder="e.g. 5.5"
                            required
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        />
                    </div>

                    {/* Timezone (UTC Offset) */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Time Zone (UTC Offset) <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={utcOffset}
                            onChange={(e) => setUtcOffset(e.target.value)}
                            required
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        >
                            {COMMON_UTC_OFFSETS.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label} ({tz.value})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Grid: Latitude & Longitude */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Latitude */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Latitude (-90 to 90) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.000001"
                            min="-90"
                            max="90"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="e.g. 6.927100"
                            required
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        />
                    </div>

                    {/* Longitude */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Longitude (-180 to 180) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.000001"
                            min="-180"
                            max="180"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="e.g. 79.861200"
                            required
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-full bg-[#004C4B] hover:bg-[#003B3A] text-white px-6 py-2 text-sm font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Saving Changes...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Save Properties</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
