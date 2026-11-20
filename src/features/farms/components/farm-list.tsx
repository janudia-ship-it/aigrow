"use client";

import { useState } from "react";
import { useFarms } from "../hooks/use-farms";
import FarmCard from "./farm-card";
import type { UserProfile } from "@/features/auth/types/auth.types";

interface FarmListProps {
    currentUser?: UserProfile | null;
}

export default function FarmList({ currentUser }: FarmListProps) {
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
        <div className="mt-1 sm:mt-3 p-1 sm:p-3 md:p-4">
            {/* Farm Dropdown */}
            <div className="mb-4 flex justify-start">
                <select
                    value={selectedFarm}
                    onChange={(e) =>
                        setSelectedFarm(
                            e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                        )
                    }
                    className="w-full sm:w-auto min-w-[200px] rounded-3xl border border-gray-300 dark:border-gray-700 bg-primary dark:bg-[#007A78] px-4 py-2 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-[#004C4B] dark:focus:ring-[#00E5A3] transition-colors cursor-pointer"
                >
                    <option value="" className="bg-white text-gray-900 dark:bg-[#1A1A1A] dark:text-gray-100">
                        Select a farm
                    </option>

                    {farms.map((farm) => (
                        <option
                            key={farm.id}
                            value={farm.id}
                            className="bg-white text-gray-900 dark:bg-[#1A1A1A] dark:text-gray-100"
                        >
                            {farm.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selected Farm Card */}
            {selectedFarmData && (
                <FarmCard farm={selectedFarmData} currentUser={currentUser} />
            )}
        </div>
    );
}
