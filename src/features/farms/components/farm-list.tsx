
"use client";

import { useState } from "react";
import { useFarms } from "../hooks/use-farms";
import FarmCard from "./farm-card";
import DeviceList from "@/features/devices/components/device-list";

export default function FarmList() {
    const { farms, loading, error } = useFarms();

    const [selectedFarm, setSelectedFarm] =
        useState<number | "">("");

    // Find selected farm
    const selectedFarmData = farms.find(
        (farm) => farm.id === selectedFarm
    );

    if (loading) {
        return (
            <p className="text-sm text-gray-500">
                Loading farms...
            </p>
        );
    }

    if (error) {
        return (
            <p className="text-sm text-red-500">
                {error}
            </p>
        );
    }

    return (
        <div className="mt-4">

            {/* Farm Dropdown */}
            <div className="max-w-md mb-4">
                <select
                    value={selectedFarm}
                    onChange={(e) =>
                        setSelectedFarm(
                            e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                        )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                >
                    <option value="">
                        Select a farm
                    </option>

                    {farms.map((farm) => (
                        <option
                            key={farm.id}
                            value={farm.id}
                        >
                            {farm.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selected Farm Card */}
            {selectedFarmData && (
                <FarmCard farm={selectedFarmData} />
            )}


        </div>
    );
}
