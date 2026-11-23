"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Save, User, Shield, Eye, ShieldCheck, Ban, Settings2 } from "lucide-react";
import { updateFarmMember } from "../services/member-service";
import type { FarmMember, FarmMemberPermissions } from "../types/member.types";

interface EditMemberModalProps {
    farmId: number;
    member: FarmMember | null;
    isOpen: boolean;
    onClose: () => void;
    onMemberUpdated: () => void;
}

export default function EditMemberModal({
    farmId,
    member,
    isOpen,
    onClose,
    onMemberUpdated,
}: EditMemberModalProps) {
    const [farmPermission, setFarmPermission] = useState<"View" | "Manage">("View");
    const [devicePermission, setDevicePermission] = useState<"None" | "View" | "Manage">("None");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && member) {
            const f =
                member.permissions?.farm?.toLowerCase() === "manage"
                    ? "Manage"
                    : "View";

            const d =
                member.permissions?.device?.toLowerCase() === "manage"
                    ? "Manage"
                    : member.permissions?.device?.toLowerCase() === "view"
                        ? "View"
                        : "None";

            setFarmPermission(f);
            setDevicePermission(d);
            setError(null);
        }
    }, [isOpen, member]);

    if (!isOpen || !member) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            setSubmitting(true);

            const permissions: FarmMemberPermissions = {
                farm: farmPermission,
                device: devicePermission,
            };

            await updateFarmMember(farmId, member.userId, { permissions });

            onMemberUpdated();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update member permissions"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Reusable permission card
    const PermissionCard = ({
        selected,
        onClick,
        icon: Icon,
        title,
        description,
    }: {
        selected: boolean;
        onClick: () => void;
        icon: React.ElementType;
        title: string;
        description: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={submitting}
            className={`relative w-full text-left rounded-xl border p-3 transition-all duration-200 cursor-pointer
                ${selected
                    ? "border-[#007A78] bg-[#EAF5F1] dark:border-[#00E5A3] dark:bg-[#102521] ring-1 ring-[#007A78]/20"
                    : "border-gray-200 bg-white hover:border-[#007A78]/50 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1A1A1A] dark:hover:bg-[#202020]"
                }
                disabled:opacity-60 disabled:cursor-not-allowed`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className={`p-2 rounded-lg ${selected
                        ? "bg-[#D3EAE2] text-[#00635B] dark:bg-[#163C32] dark:text-[#00E5A3]"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                    <Icon size={18} />
                </div>

                <span className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${selected
                        ? "border-[#007A78] dark:border-[#00E5A3]"
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                    {selected && (
                        <span className="h-2 w-2 rounded-full bg-[#007A78] dark:bg-[#00E5A3]" />
                    )}
                </span>
            </div>

            <p className={`mt-2 text-sm font-semibold ${selected
                    ? "text-[#004C4B] dark:text-[#00E5A3]"
                    : "text-gray-800 dark:text-gray-100"
                }`}>
                {title}
            </p>

            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {description}
            </p>
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-[#004C4B] dark:text-[#00E5A3]" />
                        <h3 className="text-lg font-bold text-[#004C4B] dark:text-[#00E5A3]">
                            Edit Member Permissions
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Member Info */}
                <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[#FAFBF9] dark:bg-[#161618] border border-gray-100 dark:border-gray-800">
                    {member.profilePictureUrl ? (
                        <img
                            src={member.profilePictureUrl}
                            alt={member.fullName || member.userName}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <User size={20} className="text-gray-500 shrink-0" />
                    )}

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {member.fullName || member.userName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{member.userName}
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-600 dark:text-red-300 flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-5">

                    {/* Farm Permission */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Farm Permission <span className="text-red-500">*</span>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <PermissionCard
                                selected={farmPermission === "View"}
                                onClick={() => setFarmPermission("View")}
                                icon={Eye}
                                title="View"
                                description="View farm information, zones and farm details."
                            />

                            <PermissionCard
                                selected={farmPermission === "Manage"}
                                onClick={() => setFarmPermission("Manage")}
                                icon={ShieldCheck}
                                title="Manage"
                                description="Manage farm settings, zones and members."
                            />
                        </div>
                    </div>

                    {/* Device Permission */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Device Permission
                        </label>

                        <div className="grid grid-cols-3 gap-2">
                            <PermissionCard
                                selected={devicePermission === "None"}
                                onClick={() => setDevicePermission("None")}
                                icon={Ban}
                                title="None"
                                description="No access to devices."
                            />

                            <PermissionCard
                                selected={devicePermission === "View"}
                                onClick={() => setDevicePermission("View")}
                                icon={Eye}
                                title="View"
                                description="Monitor devices."
                            />

                            <PermissionCard
                                selected={devicePermission === "Manage"}
                                onClick={() => setDevicePermission("Manage")}
                                icon={Settings2}
                                title="Manage"
                                description="Control and configure devices."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-full border border-gray-300 dark:border-gray-700 px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] hover:bg-[#003B3A] text-white px-5 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}