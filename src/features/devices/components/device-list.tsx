"use client";

import { useState } from "react";
import { useFarmDevices } from "../hooks/use-farm-devices";
import DeviceCard from "./device-card";
import AddDeviceModal from "./add-device-modal";
import EditDeviceModal from "./edit-device-modal";
import MoveDeviceModal from "./move-device-modal";
import DeleteDeviceModal from "./delete-device-modal";
import RenameDeviceModal from "./rename-device-modal";
import type { DeviceSummary } from "../types/device";

interface DeviceListProps {
    farmId: number;
    isManager?: boolean;
    canRename?: boolean;
}

export default function DeviceList({ farmId, isManager, canRename }: DeviceListProps) {
    const { devices, loading, error, refetch } = useFarmDevices(farmId);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<DeviceSummary | null>(null);
    const [movingDevice, setMovingDevice] = useState<DeviceSummary | null>(null);
    const [deletingDevice, setDeletingDevice] = useState<DeviceSummary | null>(null);
    const [renamingDevice, setRenamingDevice] = useState<DeviceSummary | null>(null);

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 sm:p-7 bg-white dark:bg-[#0D0D0D] shadow-xs">
            {/* Header: Title + Add Device button */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                    Devices
                </h2>

                {isManager && (
                    <button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3] px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#001A1A] hover:bg-[#003736] dark:hover:bg-[#00CFA3] transition cursor-pointer shadow-xs"                    >
                        <span>Add Devices</span>
                    </button>
                )}
            </div>

            {loading && (
                <p className="text-sm text-gray-500 py-3">
                    Loading devices...
                </p>
            )}

            {error && (
                <p className="text-sm text-red-500 py-3">
                    {error}
                </p>
            )}

            {!loading && !error && devices.length === 0 && (
                <p className="text-sm text-gray-400 py-3">
                    No devices found for this farm.
                </p>
            )}

            {!loading && !error && devices.length > 0 && (
                <div className="space-y-3">
                    {devices.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            isManager={isManager}
                            canRename={canRename}
                            onEdit={(d) => setEditingDevice(d)}
                            onMove={(d) => setMovingDevice(d)}
                            onDelete={(d) => setDeletingDevice(d)}
                            onRename={(d) => setRenamingDevice(d)}
                        />
                    ))}
                </div>
            )}

            {/* Add Device Modal */}
            <AddDeviceModal
                farmId={farmId}
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onDeviceCreated={refetch}
            />

            {/* Edit Device Modal */}
            {editingDevice && (
                <EditDeviceModal
                    device={editingDevice}
                    isOpen={true}
                    onClose={() => setEditingDevice(null)}
                    onDeviceUpdated={() => { refetch(); setEditingDevice(null); }}
                />
            )}

            {/* Move Device Modal */}
            {movingDevice && (
                <MoveDeviceModal
                    device={movingDevice}
                    isOpen={true}
                    onClose={() => setMovingDevice(null)}
                    onDeviceMoved={() => { refetch(); setMovingDevice(null); }}
                />
            )}

            {/* Delete Device Modal */}
            {deletingDevice && (
                <DeleteDeviceModal
                    device={deletingDevice}
                    isOpen={true}
                    onClose={() => setDeletingDevice(null)}
                    onDeviceDeleted={() => { refetch(); setDeletingDevice(null); }}
                />
            )}

            {/* Rename Device Modal */}
            {renamingDevice && (
                <RenameDeviceModal
                    device={renamingDevice}
                    isOpen={true}
                    onClose={() => setRenamingDevice(null)}
                    onDeviceRenamed={() => { refetch(); setRenamingDevice(null); }}
                />
            )}
        </div>
    );
}
