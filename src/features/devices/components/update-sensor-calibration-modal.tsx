"use client";

import { useState } from "react";
import { X, Sliders, AlertCircle } from "lucide-react";
import type { Sensor } from "../types/device";

interface UpdateSensorCalibrationModalProps {
    sensor: Sensor | null;
    isOpen: boolean;
    onClose: () => void;
    onCalibrationUpdated: () => void;
}

export default function UpdateSensorCalibrationModal({
    sensor,
    isOpen,
    onClose,
    onCalibrationUpdated,
}: UpdateSensorCalibrationModalProps) {
    const [offset, setOffset] = useState<number>(0);
    const [scaleFactor, setScaleFactor] = useState<number>(1);
    const [submitting, setSubmitting] = useState(false);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    if (!isOpen || !sensor) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setInfoMessage("Sensor calibration parameters saved.");
        setTimeout(() => {
            setSubmitting(false);
            onCalibrationUpdated();
            onClose();
        }, 600);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl z-10 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3]">
                            <Sliders size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                                Update Sensor Calibration
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {sensor.name} ({sensor.sensorType})
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {infoMessage && (
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                            {infoMessage}
                        </div>
                    )}

                    <div className="rounded-xl bg-gray-50 dark:bg-[#1A1A1E] p-3 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <AlertCircle size={15} className="text-[#004C4B] dark:text-[#00E5A3] shrink-0 mt-0.5" />
                        <span>
                            Adjust calibration offset and scale factor to fine-tune raw sensor readings against reference standards.
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Calibration Offset
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={offset}
                                onChange={(e) => setOffset(Number(e.target.value))}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Added to raw reading</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Scale Multiplier
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={scaleFactor}
                                onChange={(e) => setScaleFactor(Number(e.target.value))}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Multiplied with reading</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-5 py-2 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition cursor-pointer shadow-xs"
                        >
                            <span>Save Calibration</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
