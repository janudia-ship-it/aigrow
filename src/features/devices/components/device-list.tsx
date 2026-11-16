"use client";

import { useFarmDevices } from "../hooks/use-farm-devices";
import DeviceCard from "./device-card";

interface DeviceListProps {
    farmId: number;
}

export default function DeviceList({ farmId }: DeviceListProps) {

    const { devices, loading, error } = useFarmDevices(farmId);

    return (
        <div className="mt-5 bg-white rounded-lg border border-gray-100 p-4 shadow-sm">

            <h2 className="text-lg font-semibold text-[#004C4B] mb-4">
                Farm Devices ({devices.length})
            </h2>

            {loading && (
                <p className="text-sm text-gray-500">
                    Loading devices...
                </p>
            )}

            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}

            {!loading && !error && devices.length === 0 && (
                <p className="text-sm text-gray-500">
                    No devices found for this farm.
                </p>
            )}

            {!loading && !error && devices.length > 0 && (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {devices.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                        />
                    ))}

                </div>
            )}

        </div>
    );
}