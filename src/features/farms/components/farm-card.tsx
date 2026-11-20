
"use client";

import { useState } from "react";
import Link from "next/link";
import { useFarmById } from "../hooks/use-farm-by-id";
import { useFarmMembers } from "../hooks/use-farm-members";
import { canEditFarmProperties, canAddDevices, canEditDeviceName } from "../utils/permissions";
import DeviceList from "@/features/devices/components/device-list";
import type { UserProfile } from "@/features/auth/types/auth.types";

import {
    UserRound,
    MapPin,
    MapPinned,
    Globe,
    Droplets,
    Wind,
    CloudRain,
    Compass,
    Cpu,
    Cloud,
    ArrowRight

} from "lucide-react";
import FarmZones from "./farm-zones";
import FarmMembers from "./farm-members";

// Farm data passed from FarmList
interface Farm {
    id: number;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    utcOffset?: string;
    timeZoneId?: string;
    sizeAcre: number | null;
}

interface FarmCardProps {
    farm: Farm;
    currentUser?: UserProfile | null;
}

export default function FarmCard({ farm, currentUser }: FarmCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    // Get farm members to check assigned permissions for this farm
    const { members } = useFarmMembers(farm.id);
    const currentMember = members.find(
        (m) =>
            (currentUser?.id && m.userId === currentUser.id) ||
            (currentUser?.userName && m.userName === currentUser.userName)
    );

    // Rule: admin / superadmin OR permissions.farm == "Manage"
    const hasEditPermission = canEditFarmProperties(
        currentUser,
        currentMember?.permissions
    );

    // Rule: ONLY admin or superadmin can add devices
    const canCreateDevices = canAddDevices(currentUser);

    // Rule: admin, superadmin, or device manager can rename devices
    const canRename = canEditDeviceName(currentUser, currentMember?.permissions);

    // Get complete farm details
    const {
        farmDetails,
        loading: detailsLoading,
        error: detailsError,
    } = useFarmById(farm.id);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

                {/* Farm Properties Card */}
                <div className="min-w-0 rounded-2xl p-4 sm:p-5 shadow-xs bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800">

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                            Property Facts
                        </h2>

                        {hasEditPermission && (
                            <Link
                                href={`/farm/${farm.id}/edit`}
                                className="rounded-full border border-[#004C4B] dark:border-[#00E5A3] px-3.5 sm:px-4 py-1 text-xs sm:text-sm font-medium text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer"
                            >
                                Edit
                            </Link>
                        )}
                    </div>
                    <div className="rounded-lg p-1 sm:p-4">

                        {/* Farm Name */}
                        <div className="flex items-center gap-3 p-2">
                            <UserRound size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />

                            <p className="flex-1 text-xs sm:text-sm text-gray-400">
                                Farm Name
                            </p>

                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right max-w-[60%] truncate">
                                {farm.name}
                            </p>
                        </div>

                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Location */}
                        <div className="flex items-center gap-3 p-2">
                            <MapPin size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />

                            <p className="flex-1 text-xs sm:text-sm text-gray-400">
                                Location
                            </p>

                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right max-w-[60%] truncate">
                                {farm.address}
                            </p>
                        </div>

                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Latitude / Longitude */}
                        <div className="flex items-center gap-3 p-2">
                            <MapPinned size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />

                            <p className="flex-1 text-xs sm:text-sm text-gray-400">
                                Latitude / Longitude
                            </p>

                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                {farm.latitude ?? "N/A"},
                                {" "}
                                {farm.longitude ?? "N/A"}
                            </p>
                        </div>

                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Time Zone */}
                        <div className="flex items-center gap-3 p-2">
                            <Globe size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />

                            <p className="flex-1 text-xs sm:text-sm text-gray-400">
                                Time Zone
                            </p>

                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                {(() => {
                                    const rawTz =
                                        farm.utcOffset ||
                                        farmDetails?.utcOffset ||
                                        farm.timeZoneId ||
                                        farmDetails?.timeZoneId;
                                    if (!rawTz) return "N/A";
                                    if (rawTz.startsWith("+") || rawTz.startsWith("-")) {
                                        return `UTC ${rawTz}`;
                                    }
                                    return rawTz;
                                })()}
                            </p>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />
                        <div className="flex items-center gap-3 p-2">
                            <MapPinned size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />

                            <p className="flex-1 text-xs sm:text-sm text-gray-400">
                                Farm Area
                            </p>

                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                {farm.sizeAcre}
                            </p>
                        </div>
                    </div>

                </div>

                {/* Weather Details Card */}
                <div className="min-w-0 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-xs bg-white dark:bg-[#0D0D0D]">

                    <h2 className="text-lg sm:text-xl font-semibold text-[#004C4B] dark:text-[#00E5A3] mb-4">
                        Current Weather
                    </h2>

                    {detailsLoading && (
                        <p className="text-sm text-gray-500 py-3">
                            Loading weather details...
                        </p>
                    )}

                    {detailsError && (
                        <p className="text-sm text-red-500 py-3">
                            {detailsError}
                        </p>
                    )}

                    {!detailsLoading && !detailsError && farmDetails && (

                        farmDetails.weather.length === 0 ? (

                            <p className="text-sm text-gray-400 py-3">
                                No weather information available.
                            </p>

                        ) : (

                            <div className="space-y-4">

                                {farmDetails.weather.map((weather, index) => (

                                    <div
                                        key={`${weather.deviceId ?? weather.source}-${index}`}
                                        className="rounded-lg p-2 sm:p-4"
                                    >
                                        {/* Weather station header — links to device detail if it's a device source */}
                                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {weather.deviceId ? (
                                                    // Device weather station — show icon + source name as link
                                                    <>
                                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full dark:bg-[#142623] shrink-0">
                                                            <Cpu size={18} className="text-[#004C4B] dark:text-[#00E5A3]" />
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                            {weather.source}
                                                        </span>
                                                    </>
                                                ) : (
                                                    // OpenWeather source — just an icon + label
                                                    <>
                                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#EEF4F1] dark:bg-[#142623] shrink-0">
                                                            <Cloud size={14} className="text-[#004C4B] dark:text-[#00E5A3]" />
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                            {weather.source}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* "View Device" link — only shown for station devices */}
                                            {weather.deviceId && (
                                                <Link
                                                    href={`/devices/${weather.deviceId}`}
                                                    className="inline-flex items-center gap-1 rounded-full border border-[#004C4B] dark:border-[#00E5A3] px-3 py-1 text-xs font-medium text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition shrink-0"
                                                >
                                                    <span>View Device</span>
                                                    <ArrowRight size={11} />
                                                </Link>
                                            )}
                                        </div>
                                        {/* Temperature */}
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="/Images/Weather Icons/sun.png"
                                                alt="Temperature"
                                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
                                            />

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Temperature
                                                </p>

                                                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                                                    {weather.temperature ?? "N/A"} °C
                                                </p>
                                            </div>
                                        </div>

                                        {/* Other Weather Values */}
                                        <div className="mt-3">

                                            <div className="flex items-center gap-3 sm:gap-4 p-1.5 sm:p-2">
                                                <Droplets
                                                    size={18}
                                                    className="text-[#00615C] dark:text-[#00E5A3] shrink-0"
                                                />

                                                <p className="flex-1 text-xs sm:text-sm text-gray-400">
                                                    Humidity
                                                </p>

                                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                                    {weather.humidity ?? "N/A"} %
                                                </p>
                                            </div>

                                            <hr className="my-2 border-gray-200 dark:border-gray-800" />

                                            <div className="flex items-center gap-3 sm:gap-4 p-1.5 sm:p-2">
                                                <Wind
                                                    size={18}
                                                    className="text-[#00615C] dark:text-[#00E5A3] shrink-0"
                                                />

                                                <p className="flex-1 text-xs sm:text-sm text-gray-400">
                                                    Wind Speed
                                                </p>

                                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                                    {weather.windSpeed ?? "N/A"} m/s
                                                </p>
                                            </div>

                                            <hr className="my-2 border-gray-200 dark:border-gray-800" />

                                            <div className="flex items-center gap-3 sm:gap-4 p-1.5 sm:p-2">
                                                <Compass
                                                    size={18}
                                                    className="text-[#00615C] dark:text-[#00E5A3] shrink-0"
                                                />

                                                <p className="flex-1 text-xs sm:text-sm text-gray-400">
                                                    Wind Direction
                                                </p>

                                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                                    {weather.windDirection ?? "N/A"}
                                                </p>
                                            </div>

                                            <hr className="my-2 border-gray-200 dark:border-gray-800" />

                                            <div className="flex items-center gap-3 sm:gap-4 p-1.5 sm:p-2">
                                                <CloudRain
                                                    size={18}
                                                    className="text-[#00615C] dark:text-[#00E5A3] shrink-0"
                                                />

                                                <p className="flex-1 text-xs sm:text-sm text-gray-400">
                                                    Rain Last Hour
                                                </p>

                                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                                    {weather.rainLastHour ?? "N/A"}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Last Updated */}
                                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                                            <p className="text-xs text-gray-400">
                                                Last Updated:{" "}
                                                {weather.fetchedAt
                                                    ? new Date(weather.fetchedAt).toLocaleString()
                                                    : "Not available"}
                                            </p>
                                        </div>

                                    </div>


                                ))}


                            </div>

                        )
                    )}
                </div>
            </div>
            {/* Farm Zones */}
            <FarmZones farmId={farm.id} isManager={hasEditPermission} />

            {/* Farm Devices */}
            <DeviceList
                farmId={farm.id}
                isManager={canCreateDevices}
                canRename={canRename}
            />

            {/* Farm Members */}
            <FarmMembers farmId={farm.id} currentUser={currentUser} isManager={hasEditPermission} />


        </div>
    );
}
