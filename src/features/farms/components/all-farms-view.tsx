"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
    Search,
    MapPin,
    RotateCcw,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Loader2,
    Sprout,
    ArrowLeft,
} from "lucide-react";
import { useAllFarms } from "../hooks/use-all-farms";
import AddFarmModal from "./add-farm-modal";
import EditFarmModal from "./edit-farm-modal";
import DeleteFarmModal from "./delete-farm-modal";
import FarmCard from "./farm-card";
import type { Farm } from "../types/farm.types";
import type { UserProfile } from "@/features/auth/types/auth.types";

interface AllFarmsViewProps {
    currentUser?: UserProfile | null;
}

export default function AllFarmsView({ currentUser }: AllFarmsViewProps) {
    const {
        farms,
        page,
        pageSize,
        totalCount,
        totalPages,
        search,
        loading,
        error,
        setPage,
        setSearch,
        resetFilters,
        refetch,
    } = useAllFarms(20);

    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
    const [deletingFarm, setDeletingFarm] = useState<Farm | null>(null);
    const [viewingFarm, setViewingFarm] = useState<Farm | null>(null);

    const menuContainerRef = useRef<HTMLDivElement | null>(null);

    // Close row action menu when clicking outside
    useEffect(() => {
        if (openMenuId === null) return;
        function handleClickOutside(e: MouseEvent) {
            if (
                menuContainerRef.current &&
                !menuContainerRef.current.contains(e.target as Node)
            ) {
                setOpenMenuId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenuId]);

    // Extract distinct locations from current farms for the location filter dropdown
    const locationOptions = useMemo(() => {
        const set = new Set<string>();
        for (const f of farms) {
            if (f.address && f.address.trim()) {
                set.add(f.address.trim());
            }
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [farms]);

    // Apply optional client-side location filter on top of API search
    const displayedFarms = useMemo(() => {
        if (!selectedLocation) return farms;
        return farms.filter(
            (f) => f.address?.trim().toLowerCase() === selectedLocation.toLowerCase()
        );
    }, [farms, selectedLocation]);

    const handleReset = () => {
        setSelectedLocation("");
        resetFilters();
    };

    if (viewingFarm) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setViewingFarm(null)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#004C4B] dark:text-[#00E5A3] hover:underline cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to All Farms</span>
                    </button>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Viewing Farm:{" "}
                        <strong className="text-gray-800 dark:text-gray-200">
                            {viewingFarm.name}
                        </strong>
                    </span>
                </div>

                <FarmCard farm={viewingFarm} currentUser={currentUser} />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Top Bar: Search, Location Filter, Reset, and Add Farm Button */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    {/* Search Input Pill */}
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <input
                            type="text"
                            maxLength={100}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by farm name or location"
                            className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                        />
                    </div>

                    {/* Location Filter Pill */}
                    <div className="relative min-w-[165px]">
                        <MapPin
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            aria-label="Filter by location"
                            className="w-full appearance-none rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] pl-9 pr-8 py-2.5 text-sm text-gray-600 dark:text-gray-300 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer"
                        >
                            <option value="">All Location</option>
                            {locationOptions.map((loc) => (
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            ▾
                        </span>
                    </div>

                    {/* Reset Button Pill */}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1E] transition cursor-pointer"
                    >
                        <RotateCcw size={15} className="text-gray-400" />
                        <span>Reset</span>
                    </button>
                </div>

                {/* Add Farm Button before the table */}
                <div className="flex items-center justify-end shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition cursor-pointer shadow-xs"
                    >
                        <Plus size={16} />
                        <span>Add Farm</span>
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-4 flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Table Header Pill */}
            <div className="hidden md:grid md:grid-cols-12 items-center rounded-full bg-[#DCE7E1] dark:bg-[#142623] border border-[#004C4B]/30 dark:border-[#00E5A3]/30 px-6 py-3 text-xs sm:text-sm font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-3 text-center">Farm Details</div>
                <div className="col-span-3 text-center">Location</div>
                <div className="col-span-2 text-center">Total Area</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 size={24} className="animate-spin text-[#004C4B] dark:text-[#00E5A3]" />
                    <span>Loading farms...</span>
                </div>
            ) : displayedFarms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/70 dark:bg-[#0D0D0D] py-12 text-center space-y-2">
                    <Sprout size={28} className="mx-auto text-gray-400" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        No farms found.
                    </p>
                    <p className="text-xs text-gray-400">
                        Try adjusting your search or add a new farm.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayedFarms.map((farm, index) => {
                        const rowNumber = (page - 1) * pageSize + index + 1;
                        const isMenuOpen = openMenuId === farm.id;

                        return (
                            <div
                                key={farm.id}
                                className="relative grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-0 rounded-2xl md:rounded-full bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 px-5 md:px-6 py-3.5 shadow-2xs hover:border-[#004C4B]/40 dark:hover:border-[#00E5A3]/40 transition text-sm"
                            >
                                {/* # */}
                                <div className="md:col-span-1 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">#</span>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        {rowNumber}
                                    </span>
                                </div>

                                {/* Farm Details */}
                                <div className="md:col-span-3 flex md:justify-center items-center justify-between min-w-0">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Farm Details
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setViewingFarm(farm)}
                                        className="font-medium text-gray-800 dark:text-gray-100 hover:text-[#004C4B] dark:hover:text-[#00E5A3] hover:underline truncate max-w-full cursor-pointer text-left"
                                    >
                                        {farm.name}
                                    </button>
                                </div>

                                {/* Location */}
                                <div className="md:col-span-3 flex md:justify-center items-center justify-between min-w-0">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Location
                                    </span>
                                    <span
                                        className="text-gray-600 dark:text-gray-300 truncate max-w-full"
                                        title={farm.address}
                                    >
                                        {farm.address || "—"}
                                    </span>
                                </div>

                                {/* Total Area */}
                                <div className="md:col-span-2 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Total Area
                                    </span>
                                    <span className="font-medium text-[#004C4B] dark:text-[#00E5A3]">
                                        {farm.sizeAcre} Acres
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="md:col-span-2 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Status
                                    </span>
                                    <span className="inline-flex items-center justify-center rounded-full bg-[#DCE7E1] dark:bg-[#142623] border border-[#004C4B]/30 dark:border-[#00E5A3]/30 px-4 py-0.5 text-xs font-medium text-[#004C4B] dark:text-[#00E5A3]">
                                        Active
                                    </span>
                                </div>

                                {/* Action */}
                                <div className="md:col-span-1 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Action
                                    </span>
                                    <div
                                        className="relative"
                                        ref={isMenuOpen ? menuContainerRef : null}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenMenuId((prev) =>
                                                    prev === farm.id ? null : farm.id
                                                )
                                            }
                                            aria-label={`Actions for ${farm.name}`}
                                            className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {isMenuOpen && (
                                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-xl py-1.5 z-30">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setViewingFarm(farm);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                >
                                                    <Eye size={13} />
                                                    <span>View Farm</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setEditingFarm(farm);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                >
                                                    <Pencil size={13} />
                                                    <span>Update Farm</span>
                                                </button>
                                                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setDeletingFarm(farm);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                                >
                                                    <Trash2 size={13} />
                                                    <span>Delete Farm</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Footer */}
            {!loading && totalCount > 0 && (
                <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        Showing page <strong className="text-gray-700 dark:text-gray-200">{page}</strong> of{" "}
                        <strong className="text-gray-700 dark:text-gray-200">{totalPages}</strong> ({totalCount}{" "}
                        {totalCount === 1 ? "farm" : "farms"})
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} />
                            <span>Prev</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                        >
                            <span>Next</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AddFarmModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onFarmAdded={() => {
                    refetch();
                }}
            />

            <EditFarmModal
                farm={editingFarm}
                isOpen={!!editingFarm}
                onClose={() => setEditingFarm(null)}
                onFarmUpdated={() => {
                    refetch();
                    setEditingFarm(null);
                }}
            />

            <DeleteFarmModal
                farm={deletingFarm}
                isOpen={!!deletingFarm}
                onClose={() => setDeletingFarm(null)}
                onFarmDeleted={() => {
                    refetch();
                    setDeletingFarm(null);
                }}
            />
        </div>
    );
}
