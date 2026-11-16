import {
    Cpu,
    Clock,
} from "lucide-react";

import type { DeviceSummary } from "../types/device";

interface DeviceCardProps {
    device: DeviceSummary;
}

export default function DeviceCard({ device }: DeviceCardProps) {

    const statusColor = {
        Online: "bg-green-100 text-green-700 p-2",
        Offline: "bg-red-100 text-red-700 p-2",
        NeverConnected: "bg-gray-100 text-gray-600 p-2",
    };

    return (
        <div className="rounded-lg border border-gray-200 p-5 bg-white">

            <div className="flex items-center justify-between">

                <div className="flex items-center gap-3 px-5 ">

                    <div className="rounded-lg py-3">
                        <Cpu className="text-[#00615C]" size={20} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800">
                            {device.name}
                        </h3>

                        <p className="text-xs text-gray-500">
                            {device.deviceType}
                        </p>
                    </div>

                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[device.status]}`}>
                    {device.status}
                </span>

            </div>
            <hr className="my-3 border-gray-300 px-5" />

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 px-5">

                <Clock size={15} />

                <span>
                    Last Seen:{" "}
                    {device.lastSeenAt
                        ? new Date(device.lastSeenAt).toLocaleString()
                        : "Never connected"}
                </span>
            </div>
            {/* <p className="mt-2 text-xs text-gray-400 px-5">
                Device ID: {device.id}
            </p> */}
        </div>
    );
}