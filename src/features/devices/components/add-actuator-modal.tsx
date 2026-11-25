"use client";

import { useState, useEffect } from "react";
import { X, Plus, AlertCircle, Loader2, Sliders, AlertTriangle } from "lucide-react";
import { addActuator } from "../services/device-service";
import { useActuatorTypes } from "../hooks/use-actuator-types";

interface AddActuatorModalProps {
    deviceId: number;
    deviceType?: string;
    isOpen: boolean;
    onClose: () => void;
    onActuatorAdded: () => void;
}

export default function AddActuatorModal({
    deviceId,
    deviceType,
    isOpen,
    onClose,
    onActuatorAdded,
}: AddActuatorModalProps) {
    const { actuatorTypes, loading: loadingTypes } = useActuatorTypes();

    const isWeatherStation = deviceType === "WeatherStation";

    const [actuatorType, setActuatorType] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [channelIndex, setChannelIndex] = useState<number>(0);
    const [isRemoteEnabled, setIsRemoteEnabled] = useState<boolean>(true);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Default to first actuator type when loaded
    useEffect(() => {
        if (actuatorTypes.length > 0 && !actuatorType) {
            setActuatorType(actuatorTypes[0].actuatorType);
        }
    }, [actuatorTypes, actuatorType]);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setName("");
            setChannelIndex(0);
            setIsRemoteEnabled(true);
            if (actuatorTypes.length > 0) {
                setActuatorType(actuatorTypes[0].actuatorType);
            }
        }
    }, [isOpen, actuatorTypes]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isWeatherStation) {
            setError("Weather stations cannot have actuators (ActuatorsNotAllowed).");
            return;
        }

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Actuator name is required.");
            return;
        }

        if (trimmedName.length > 64) {
            setError("Actuator name cannot exceed 64 characters.");
            return;
        }

        if (!actuatorType) {
            setError("Please select an actuator type.");
            return;
        }

        const channel = Number(channelIndex);
        if (Number.isNaN(channel) || channel < 0 || channel > 255) {
            setError("Channel index must be between 0 and 255.");
            return;
        }

        setSubmitting(true);
        try {
            await addActuator(deviceId, {
                actuatorType,
                name: trimmedName,
                channelIndex: channel,
                isRemoteEnabled,
            });
            onActuatorAdded();
            onClose();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to add actuator");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-actuator-title"
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
                                id="add-actuator-title"
                                className="text-base font-bold text-gray-900 dark:text-gray-100"
                            >
                                Add Actuator
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Attach a new actuator to Device #{deviceId}
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
                    {/* Weather Station Notice */}
                    {isWeatherStation && (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-3 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                            <span>
                                Weather station devices cannot support actuators. Adding actuators to this device is not permitted.
                            </span>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span className="flex-1">{error}</span>
                        </div>
                    )}

                    {/* Actuator Type */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Actuator Type <span className="text-red-500">*</span>
                        </label>
                        {loadingTypes ? (
                            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1A1E] px-3.5 py-2 text-xs text-gray-400 flex items-center gap-2">
                                <Loader2 size={13} className="animate-spin" />
                                Loading actuator types...
                            </div>
                        ) : (
                            <select
                                value={actuatorType}
                                onChange={(e) => setActuatorType(e.target.value)}
                                disabled={submitting || isWeatherStation}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer disabled:opacity-50"
                            >
                                {actuatorTypes.map((at) => (
                                    <option key={at.actuatorType} value={at.actuatorType}>
                                        {at.displayName || at.actuatorType}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1">
                            Type of actuator or relay control.
                        </p>
                    </div>

                    {/* Actuator Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Actuator Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={submitting || isWeatherStation}
                            maxLength={64}
                            placeholder="e.g. Irrigation Valve Main"
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition disabled:opacity-50"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Unique name among this device&apos;s actuators (max 64 characters).
                        </p>
                    </div>

                    {/* Channel Index */}
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
                            disabled={submitting || isWeatherStation}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition disabled:opacity-50"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Hardware channel index (Range: 0 – 255)</p>
                    </div>

                    {/* Remote Enabled Toggle */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-[#EEF4F1]/40 dark:bg-[#142623]/40 p-3.5">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isRemoteEnabled}
                                onChange={(e) => setIsRemoteEnabled(e.target.checked)}
                                disabled={submitting || isWeatherStation}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-[#004C4B] dark:text-[#00E5A3] focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] accent-[#004C4B] dark:accent-[#00E5A3] cursor-pointer disabled:opacity-50"
                            />
                            <div className="flex-1">
                                <span className="block text-xs font-semibold text-gray-800 dark:text-gray-200">
                                    Enable Remote Control
                                </span>
                                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    When enabled, the actuator can be switched and have its control mode modified remotely from the app.
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Initial State Note */}
                    <p className="text-[11px] text-gray-400 italic">
                        * Newly added actuators start in control mode <span className="font-semibold text-gray-600 dark:text-gray-300">Off</span>.
                    </p>

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
                            disabled={submitting || !name.trim() || isWeatherStation}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-5 py-2 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] disabled:opacity-50 transition cursor-pointer shadow-xs"
                        >
                            {submitting && <Loader2 size={13} className="animate-spin" />}
                            <span>{submitting ? "Adding Actuator..." : "Add Actuator"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
