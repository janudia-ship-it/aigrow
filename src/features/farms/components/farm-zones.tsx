"use client";

import { useState, useRef, useEffect } from "react";
import { Map, LayoutGrid, MoreVertical, Plus, Pencil, Trash2 } from "lucide-react";
import { useFarmZones } from "../hooks/use-farm-zones";
import AddZoneModal from "./add-zone-modal";
import EditZoneModal from "./edit-zone-modal";
import DeleteZoneModal from "./delete-zone-modal";
import AddBlockModal from "./add-block-modal";
import EditBlockModal from "./edit-block-modal";
import DeleteBlockModal from "./delete-block-modal";
import type { Zone, Block } from "../types/zone.types";

interface FarmZonesProps {
    farmId: number;
    isManager?: boolean;
}

export default function FarmZones({ farmId, isManager }: FarmZonesProps) {
    const { zones, loading, error, refetch } = useFarmZones(farmId);
    const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [deletingZone, setDeletingZone] = useState<Zone | null>(null);
    const [openMenuZoneId, setOpenMenuZoneId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Block state
    const [addingBlockZone, setAddingBlockZone] = useState<Zone | null>(null);
    const [editingBlock, setEditingBlock] = useState<{ block: Block; zoneName: string } | null>(null);
    const [deletingBlock, setDeletingBlock] = useState<{ block: Block; zoneName: string } | null>(null);
    const [openMenuBlockId, setOpenMenuBlockId] = useState<number | null>(null);
    const blockMenuRef = useRef<HTMLDivElement | null>(null);

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuZoneId(null);
            }
            if (blockMenuRef.current && !blockMenuRef.current.contains(event.target as Node)) {
                setOpenMenuBlockId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0D0D0D] p-4 sm:p-6 shadow-xs">
            {/* Header: Title + Add Zone Button */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                    Farm Zones
                </h2>

                {isManager && (
                    <button
                        type="button"
                        onClick={() => setIsAddZoneOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#004C4B] dark:border-[#00E5A3] px-3.5 sm:px-4 py-1 text-xs sm:text-sm font-medium text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer"
                    >
                        <span>Add Zone</span>
                    </button>
                )}
            </div>

            {/* Loading & Error States */}
            {loading && <p className="text-sm text-gray-500 py-3">Loading zones and blocks...</p>}
            {error && <p className="text-sm text-red-500 py-3">{error}</p>}

            {!loading && !error && zones.length === 0 && (
                <p className="text-sm text-gray-400 py-3">No zones found for this farm.</p>
            )}

            {/* Zones Grid */}
            {!loading && !error && zones.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            className="rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-[#152320] p-4 sm:p-5 flex flex-col justify-between"
                        >
                            {/* Zone Header */}
                            <div>
                                <div className="flex items-start justify-between relative">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg  dark:bg-[#102A27] text-[#004C4B] dark:text-[#00E5A3]">
                                            <Map size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100">
                                                {zone.name}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                {zone.zoneType || (zone.isOpenField ? "Open Field" : "Protected")}
                                            </p>
                                        </div>
                                    </div>
                                    <hr className="border-gray-200 dark:border-gray-800" />

                                    {/* Zone Menu (for Managers / Admins) */}
                                    {isManager && (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenMenuZoneId(
                                                        openMenuZoneId === zone.id ? null : zone.id
                                                    )
                                                }
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                                aria-label="Zone options"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {openMenuZoneId === zone.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-lg py-1.5 z-20"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingZone(zone);
                                                            setOpenMenuZoneId(null);
                                                        }}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                    >
                                                        <Pencil size={13} />
                                                        <span>Edit Zone</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDeletingZone(zone);
                                                            setOpenMenuZoneId(null);
                                                        }}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                                    >
                                                        <Trash2 size={13} />
                                                        <span>Delete Zone</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <br />

                                <hr className="border-gray-200 dark:border-gray-800" />

                                {/* Blocks Subheader */}
                                <div className="flex items-center justify-between mt-5 mb-3 flex-wrap gap-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        <div className="p-2 rounded-lg  dark:bg-[#102A27] text-primary dark:text-[#00E5A3]">
                                            <Map size={18} />
                                        </div>
                                        <span>Blocks</span>
                                    </div>

                                    {isManager && (
                                        <button
                                            type="button"
                                            onClick={() => setAddingBlockZone(zone)}
                                            className="inline-flex items-center gap-1 rounded-full border border-[#004C4B] dark:border-[#00E5A3] px-3 py-1 text-xs font-medium text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer"
                                        >
                                            <span>Add Blocks</span>
                                        </button>
                                    )}
                                </div>

                                {/* Blocks List */}
                                <div className="space-y-2.5">
                                    {zone.blocks && zone.blocks.length > 0 ? (
                                        zone.blocks.map((block) => (
                                            <div
                                                key={block.id}
                                                className="flex items-center justify-between rounded-xl bg-[#EDF4F1] dark:bg-[#1C3630] px-3 sm:px-4 py-2.5 text-xs sm:text-sm gap-2"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <LayoutGrid size={15} className="text-[#004C4B] dark:text-[#00E5A3] shrink-0" />
                                                    <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
                                                        {block.name}
                                                    </span>
                                                </div>

                                                {/* Block Options (for Managers) */}
                                                {isManager ? (
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setOpenMenuBlockId(
                                                                    openMenuBlockId === block.id ? null : block.id
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700 cursor-pointer"
                                                            aria-label="Block options"
                                                        >
                                                            <MoreVertical size={15} />
                                                        </button>

                                                        {openMenuBlockId === block.id && (
                                                            <div
                                                                ref={blockMenuRef}
                                                                className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-lg py-1.5 z-20"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingBlock({ block, zoneName: zone.name });
                                                                        setOpenMenuBlockId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                                >
                                                                    <Pencil size={12} />
                                                                    <span>Edit Block</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setDeletingBlock({ block, zoneName: zone.name });
                                                                        setOpenMenuBlockId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                                                >
                                                                    <Trash2 size={12} />
                                                                    <span>Delete</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1 cursor-pointer"
                                                        aria-label="Block options"
                                                    >
                                                        <MoreVertical size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 italic py-2">
                                            No blocks in this zone.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Zone Modal */}
            <AddZoneModal
                farmId={farmId}
                isOpen={isAddZoneOpen}
                onClose={() => setIsAddZoneOpen(false)}
                onZoneCreated={refetch}
            />

            {/* Edit Zone Modal */}
            <EditZoneModal
                zone={editingZone}
                isOpen={Boolean(editingZone)}
                onClose={() => setEditingZone(null)}
                onZoneUpdated={refetch}
            />

            {/* Delete Zone Confirmation Modal */}
            <DeleteZoneModal
                zone={deletingZone}
                isOpen={Boolean(deletingZone)}
                onClose={() => setDeletingZone(null)}
                onZoneDeleted={refetch}
            />

            {/* Add Block Modal */}
            <AddBlockModal
                zone={addingBlockZone}
                isOpen={Boolean(addingBlockZone)}
                onClose={() => setAddingBlockZone(null)}
                onBlockCreated={refetch}
            />

            {/* Edit Block Modal */}
            <EditBlockModal
                block={editingBlock?.block ?? null}
                zoneName={editingBlock?.zoneName}
                isOpen={Boolean(editingBlock)}
                onClose={() => setEditingBlock(null)}
                onBlockUpdated={refetch}
            />

            {/* Delete Block Modal */}
            <DeleteBlockModal
                block={deletingBlock?.block ?? null}
                zoneName={deletingBlock?.zoneName}
                isOpen={Boolean(deletingBlock)}
                onClose={() => setDeletingBlock(null)}
                onBlockDeleted={refetch}
            />
        </div>
    );
}
