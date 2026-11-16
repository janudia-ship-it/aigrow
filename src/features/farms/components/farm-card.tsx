
"use client";

import { useFarmById } from "../hooks/use-farm-by-id";
import DeviceList from "@/features/devices/components/device-list";

import {
    UserRound,
    MapPin,
    MapPinned,
    Globe,
    Droplets,
    Wind,
    CloudRain,
    Compass,
} from "lucide-react";

// Farm data passed from FarmList
interface Farm {
    id: number;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    timeZoneId: string;
    sizeAcre: number | null;

}

interface FarmCardProps {
    farm: Farm;
}

export default function FarmCard({ farm }: FarmCardProps) {

    // Get complete farm details
    const {
        farmDetails,
        loading: detailsLoading,
        error: detailsError,
    } = useFarmById(farm.id);

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

                {/* Farm Properties Card */}
                <div className="min-w-0 rounded-xl border border-gray-300 p-5 shadow-sm bg-white">

                    <h2 className="text-lg font-semibold text-[#004C4B] mb-4">
                        Farm Properties
                    </h2>
                    <div className="rounded-lg border border-gray-100 p-4">

                        {/* Farm Name */}
                        <div className="flex items-center gap-3 p-2">
                            <UserRound size={20} className="text-[#00615C]" />

                            <p className="flex-1 text-sm text-gray-400">
                                Farm Name
                            </p>

                            <p className="text-sm font-semibold">
                                {farm.name}
                            </p>
                        </div>

                        <hr className="my-3 border-gray-300" />

                        {/* Location */}
                        <div className="flex items-center gap-3 p-2">
                            <MapPin size={20} className="text-[#00615C]" />

                            <p className="flex-1 text-sm text-gray-400">
                                Location
                            </p>

                            <p className="text-sm font-semibold">
                                {farm.address}
                            </p>
                        </div>

                        <hr className="my-3 border-gray-300" />

                        {/* Latitude / Longitude */}
                        <div className="flex items-center gap-3 p-2">
                            <MapPinned size={20} className="text-[#00615C]" />

                            <p className="flex-1 text-sm text-gray-400">
                                Latitude / Longitude
                            </p>

                            <p className="text-sm font-semibold">
                                {farm.latitude ?? "N/A"},
                                {" "}
                                {farm.longitude ?? "N/A"}
                            </p>
                        </div>

                        <hr className="my-3 border-gray-300" />

                        {/* Time Zone */}
                        <div className="flex items-center gap-3 p-2">
                            <Globe size={20} className="text-[#00615C]" />

                            <p className="flex-1 text-sm text-gray-400">
                                Time Zone
                            </p>

                            <p className="text-sm font-semibold">
                                {farm.timeZoneId}
                            </p>
                        </div>
                        <hr className="my-3 border-gray-300" />
                        <div className="flex items-center gap-3 p-2">
                            <MapPinned size={20} className="text-[#00615C]" />

                            <p className="flex-1 text-sm text-gray-400">
                                Farm Area
                            </p>

                            <p className="text-sm font-semibold">
                                {farm.sizeAcre}
                            </p>
                        </div>
                    </div>

                </div>

                {/* Weather Details Card */}
                <div className="min-w-0 rounded-xl border border-gray-200 p-5 shadow-sm bg-white">

                    <h2 className="text-lg font-semibold text-[#004C4B] mb-4">
                        Current Weather
                    </h2>

                    {detailsLoading && (
                        <p className="text-sm text-gray-500">
                            Loading weather details...
                        </p>
                    )}

                    {detailsError && (
                        <p className="text-sm text-red-500">
                            {detailsError}
                        </p>
                    )}

                    {!detailsLoading && !detailsError && farmDetails && (

                        farmDetails.weather.length === 0 ? (

                            <p className="text-sm text-gray-500">
                                No weather information available.
                            </p>

                        ) : (

                            <div className="space-y-4">

                                {farmDetails.weather.map((weather, index) => (

                                    <div
                                        key={`${weather.deviceId ?? weather.source}-${index}`}
                                        className="rounded-lg border border-gray-100 p-4"
                                    >

                                        {/* Weather Source
                                        <div className="flex items-center justify-between mb-4">

                                            <div>
                                                <h3 className="font-semibold text-gray-800">
                                                    {weather.source}
                                                </h3>

                                                <p className="text-xs text-gray-500">
                                                    {weather.deviceId !== null
                                                        ? `Device ID: ${weather.deviceId}`
                                                        : "External weather source"}
                                                </p>
                                            </div>

                                            {weather.icon && (
                                                <img
                                                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                                                    alt="Weather condition"
                                                    className="w-12 h-12"
                                                />
                                            )}

                                        </div> */}

                                        {/* Temperature */}
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="/Images/Weather Icons/sun.png"
                                                alt="Temperature"
                                                className="w-12 h-12 object-contain"
                                            />

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Temperature
                                                </p>

                                                <p className="font-semibold">
                                                    {weather.temperature ?? "N/A"} °C
                                                </p>
                                            </div>
                                        </div>

                                        {/* Other Weather Values */}
                                        <div className="mt-3">

                                            <div className="flex items-center gap-4 p-2">
                                                <Droplets
                                                    size={20}
                                                    className="text-green-800"
                                                />

                                                <p className="flex-1 text-sm text-gray-500">
                                                    Humidity
                                                </p>

                                                <p className="font-semibold">
                                                    {weather.humidity ?? "N/A"} %
                                                </p>
                                            </div>

                                            <hr className="my-2 border-gray-300" />

                                            <div className="flex items-center gap-4 p-2">
                                                <Wind
                                                    size={20}
                                                    className="text-green-800"
                                                />

                                                <p className="flex-1 text-sm text-gray-500">
                                                    Wind Speed
                                                </p>

                                                <p className="font-semibold">
                                                    {weather.windSpeed ?? "N/A"} m/s
                                                </p>
                                            </div>

                                            <hr className="my-2 border-gray-300" />

                                            <div className="flex items-center gap-4 p-2">
                                                <Compass
                                                    size={20}
                                                    className="text-green-800"
                                                />

                                                <p className="flex-1 text-sm text-gray-500">
                                                    Wind Direction
                                                </p>

                                                <p className="font-semibold">
                                                    {weather.windDirection ?? "N/A"}
                                                </p>
                                            </div>

                                            <hr className="my-2 border-gray-300" />

                                            <div className="flex items-center gap-4 p-2">
                                                <CloudRain
                                                    size={20}
                                                    className="text-green-800"
                                                />

                                                <p className="flex-1 text-sm text-gray-500">
                                                    Rain Last Hour
                                                </p>

                                                <p className="font-semibold">
                                                    {weather.rainLastHour ?? "N/A"}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Last Updated */}
                                        <div className="mt-4 pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">
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
            {/* Farm Devices */}
            <DeviceList farmId={farm.id} />
        </div>
    );
}
