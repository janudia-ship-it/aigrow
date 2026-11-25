"use client";

import { useState, useEffect } from "react";
import { X, Plus, Activity, AlertCircle, Loader2 } from "lucide-react";
import { addSensor } from "../services/device-service";
import { useSensorTypes } from "../hooks/use-sensor-types";

interface AddSensorModalProps {
    deviceId: number;
    isOpen: boolean;
    onClose: () => void;
    onSensorAdded: () => void;
}

export default function AddSensorModal({
    deviceId,
    isOpen,
    onClose,
    onSensorAdded,
}: AddSensorModalProps) {
    const { sensorTypes, loading: loadingTypes } = useSensorTypes();

    const [sensorType, setSensorType] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [busAddress, setBusAddress] = useState<number>(1);
    const [channelIndex, setChannelIndex] = useState<number>(0);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Default to first sensor type when loaded
    useEffect(() => {
        if (sensorTypes.length > 0 && !sensorType) {
            setSensorType(sensorTypes[0].sensorType);
        }
    }, [sensorTypes, sensorType]);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setName("");
            setBusAddress(1);
            setChannelIndex(0);
            if (sensorTypes.length > 0) {
                setSensorType(sensorTypes[0].sensorType);
            }
        }
    }, [isOpen, sensorTypes]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Sensor name is required.");
            return;
        }

        if (trimmedName.length > 64) {
            setError("Sensor name cannot exceed 64 characters.");
            return;
        }

        if (!sensorType) {
            setError("Please select a sensor type.");
            return;
        }

        const bus = Number(busAddress);
        if (Number.isNaN(bus) || bus < 1 || bus > 247) {
            setError("Bus address must be between 1 and 247.");
            return;
        }

        const channel = Number(channelIndex);
        if (Number.isNaN(channel) || channel < 0 || channel > 255) {
            setError("Channel index must be between 0 and 255.");
            return;
        }

        setSubmitting(true);
        try {
            await addSensor(deviceId, {
                sensorType,
                name: trimmedName,
                busAddress: bus,
                channelIndex: channel,
            });
            onSensorAdded();
            onClose();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to add sensor");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-sensor-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl z-10 transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3]">
                            <Plus size={18} />
                        </div>
                        <div>
                            <h3
                                id="add-sensor-title"
                                className="text-base font-bold text-gray-900 dark:text-gray-100"
                            >
                                Add Sensor
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Attach a new sensor to Device #{deviceId}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Error Banner */}
                    {error && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span className="flex-1">{error}</span>
                        </div>
                    )}

                    {/* Sensor Type */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Sensor Type <span className="text-red-500">*</span>
                        </label>
                        {loadingTypes ? (
                            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1A1E] px-3.5 py-2 text-xs text-gray-400 flex items-center gap-2">
                                <Loader2 size={13} className="animate-spin" />
                                Loading sensor types...
                            </div>
                        ) : (
                            <select
                                value={sensorType}
                                onChange={(e) => setSensorType(e.target.value)}
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer"
                            >
                                {sensorTypes.map((st) => (
                                    <option key={st.sensorType} value={st.sensorType}>
                                        {st.displayName} {st.unit ? `(${st.unit})` : ""}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1">
                            Type of environmental or system measurement.
                        </p>
                    </div>

                    {/* Sensor Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Sensor Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={submitting}
                            maxLength={64}
                            placeholder="e.g. Canopy Temperature Sensor 1"
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Unique name among this device&apos;s sensors (max 64 characters).
                        </p>
                    </div>

                    {/* Hardware Configuration: Bus Address & Channel Index */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Bus Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={247}
                                value={busAddress}
                                onChange={(e) => setBusAddress(Number(e.target.value))}
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Range: 1 – 247</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Channel Index <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={255}
                                value={channelIndex}
                                onChange={(e) => setChannelIndex(Number(e.target.value))}
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Range: 0 – 255</p>
                        </div>
                    </div>

                    {/* Actions */}
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
                            disabled={submitting || !name.trim()}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-5 py-2 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] disabled:opacity-50 transition cursor-pointer shadow-xs"
                        >
                            {submitting && <Loader2 size={13} className="animate-spin" />}
                            <span>{submitting ? "Adding Sensor..." : "Add Sensor"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
