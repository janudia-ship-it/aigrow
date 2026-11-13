"use client";

import { useState } from "react";
import { useFarms } from "../hooks/use-farms";
import { useFarmById } from "../hooks/use-farm-by-id";

import {
    UserRound,
    MapPin,
    MapPinned,
    Globe,
    CloudSun,
    Droplets,
    Wind,
    CloudRain,
    Compass,
} from "lucide-react";

export default function FarmList() {

    const { farms, loading, error } = useFarms();

    const [selectedFarm, setSelectedFarm] =
        useState<number | "">("");

    // Get selected farm from Get My Farms
    const selectedFarmData = farms.find(
        (farm) => farm.id === selectedFarm
    );

    // Get complete farm details from Get Farm By ID
    const {
        farmDetails,
        loading: detailsLoading,
        error: detailsError,
    } = useFarmById(
        selectedFarm === "" ? null : selectedFarm
    );

    if (loading) {
        return <p className="text-sm text-gray-500">Loading farms...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-500">{error}</p>;
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2
                    focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                >
                    <option value="">Select a farm</option>

                    {farms.map((farm) => (
                        <option key={farm.id} value={farm.id}>
                            {farm.name}
                        </option>
                    ))}
                </select>

            </div>

            {selectedFarmData && (
                <div className="space-y-5">

                    {/* Farm Details Card */}
                    <div className="rounded-xl border border-gray-200 p-5 shadow-xs bg-white">

                        <h2 className="text-lg font-semibold text-[#004C4B] mb-4">
                            Farm Details
                        </h2>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center">
                                <UserRound size={21} className="text-[#00615C]" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Farm ID</p>
                            </div>

                            <p className="text-sm font-semibold">
                                {selectedFarmData.id}
                            </p>
                        </div>

                        <hr className="my-3 border-gray-300" />

                        <div className="flex items-center gap-3">
                            <MapPin size={21} className="text-[#00615C]" />

                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Location</p>
                            </div>

                            <p className="text-sm font-semibold">
                                {selectedFarmData.address}
                            </p>
                        </div>

                        <hr className="my-3 border-gray-300" />

                        <div className="flex items-center gap-3">
                            <MapPinned size={21} className="text-[#00615C]" />

                            <div className="flex-1">
                                <p className="text-sm text-gray-400">
                                    Latitude / Longitude
                                </p>
                            </div>

                            <p className="text-sm font-semibold">
                                {selectedFarmData.latitude ?? "N/A"},
                                {" "}
                                {selectedFarmData.longitude ?? "N/A"}
                            </p>
                        </div>

                        <hr className="my-3 border-gray-300" />

                        <div className="flex items-center gap-3">
                            <Globe size={21} className="text-[#00615C]" />

                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Time Zone</p>
                            </div>

                            <p className="text-sm font-semibold">
                                {selectedFarmData.timeZoneId}
                            </p>
                        </div>

                    </div>

                    {/* Weather Details Card */}
                    <div className="rounded-xl border border-gray-200 p-5 shadow-xs bg-white">

                        <div className="flex items-center gap-2 mb-4">
                            <CloudSun size={22} className="text-[#00615C]" />

                            <h2 className="text-lg font-semibold text-[#004C4B]">
                                Weather Details
                            </h2>
                        </div>

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
                                            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                                        >

                                            {/* Weather Source */}
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

                                            </div>

                                            {/* Weather Values */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                                                {/* Temperature */}
                                                <div className="flex items-center gap-2">
                                                    <CloudSun
                                                        size={20}
                                                        className="text-orange-500"
                                                    />

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Temperature
                                                        </p>

                                                        <p className="font-semibold">
                                                            {weather.temperature ?? "N/A"}
                                                            {" "}°C
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Humidity */}
                                                <div className="flex items-center gap-2">
                                                    <Droplets
                                                        size={20}
                                                        className="text-blue-500"
                                                    />

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Humidity
                                                        </p>

                                                        <p className="font-semibold">
                                                            {weather.humidity ?? "N/A"} %
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Wind Speed */}
                                                <div className="flex items-center gap-2">
                                                    <Wind
                                                        size={20}
                                                        className="text-gray-500"
                                                    />

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Wind Speed
                                                        </p>

                                                        <p className="font-semibold">
                                                            {weather.windSpeed ?? "N/A"} m/s
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Wind Direction */}
                                                <div className="flex items-center gap-2">
                                                    <Compass
                                                        size={20}
                                                        className="text-[#00615C]"
                                                    />

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Wind Direction
                                                        </p>

                                                        <p className="font-semibold">
                                                            {weather.windDirection ?? "N/A"}°
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Rain */}
                                                <div className="flex items-center gap-2">
                                                    <CloudRain
                                                        size={20}
                                                        className="text-blue-600"
                                                    />

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Rain Last Hour
                                                        </p>

                                                        <p className="font-semibold">
                                                            {weather.rainLastHour ?? "N/A"} mm
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>

                                            {/* Fetched Time */}
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
            )}

        </div>
    );
}