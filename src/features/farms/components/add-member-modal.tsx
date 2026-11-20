"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2, AlertCircle, UserPlus, Check, User } from "lucide-react";
import { lookupUsers, addFarmMember } from "../services/member-service";
import type { UserLookupItem, FarmMemberPermissions } from "../types/member.types";

interface AddMemberModalProps {
    farmId: number;
    isOpen: boolean;
    onClose: () => void;
    onMemberAdded: () => void;
}

export default function AddMemberModal({
    farmId,
    isOpen,
    onClose,
    onMemberAdded,
}: AddMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<UserLookupItem[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserLookupItem | null>(null);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Permission fields
    const [farmPermission, setFarmPermission] = useState<"View" | "Manage">("View");
    const [devicePermission, setDevicePermission] = useState<"None" | "View" | "Manage">("None");

    // Debounced search when query changes
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(async () => {
            const trimmed = searchQuery.trim();
            if (!trimmed) {
                setUsers([]);
                return;
            }

            try {
                setSearching(true);
                const results = await lookupUsers(trimmed);
                setUsers(results);
            } catch (err) {
                console.error("Lookup error:", err);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isOpen]);

    if (!isOpen) return null;

    const handleReset = () => {
        setSearchQuery("");
        setUsers([]);
        setSelectedUser(null);
        setFarmPermission("View");
        setDevicePermission("None");
        setError(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedUser) {
            setError("Please search and select a user to add.");
            return;
        }

        try {
            setSubmitting(true);
            const permissions: FarmMemberPermissions = {
                farm: farmPermission,
                device: devicePermission,
            };

            await addFarmMember(farmId, {
                userId: selectedUser.id,
                permissions,
            });

            handleReset();
            onMemberAdded();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add farm member");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <h3 className="text-lg font-bold text-[#004C4B] dark:text-[#00E5A3]">
                        Add Farm Member
                    </h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-600 dark:text-red-300 flex items-center gap-2 shrink-0">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
                    {/* User Search & Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Search User <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, username or email..."
                                disabled={submitting}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] pl-9 pr-8 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                            />
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            {searching && (
                                <Loader2
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                                />
                            )}
                        </div>

                        {/* Selected User Pill */}
                        {selectedUser && (
                            <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-[#E8F2EF] dark:bg-[#102A27] border border-[#004C4B]/20 dark:border-[#00E5A3]/20">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {selectedUser.profilePictureUrl ? (
                                        <img
                                            src={selectedUser.profilePictureUrl}
                                            alt={selectedUser.fullName || selectedUser.userName}
                                            className="w-7 h-7 rounded-full object-cover shrink-0"
                                        />
                                    ) : (
                                        <User size={18} className="text-[#004C4B] dark:text-[#00E5A3] shrink-0" />
                                    )}
                                    <div className="truncate">
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                            {selectedUser.fullName || selectedUser.userName}
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                            @{selectedUser.userName} • {selectedUser.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(null)}
                                    className="text-xs text-gray-400 hover:text-red-500 font-medium px-2 py-0.5 cursor-pointer"
                                >
                                    Change
                                </button>
                            </div>
                        )}

                        {/* Search Results Dropdown List */}
                        {!selectedUser && users.length > 0 && (
                            <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#1A1A1A] shadow-sm">
                                {users.map((u) => (
                                    <button
                                        type="button"
                                        key={u.id}
                                        onClick={() => setSelectedUser(u)}
                                        className="w-full flex items-center justify-between p-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {u.profilePictureUrl ? (
                                                <img
                                                    src={u.profilePictureUrl}
                                                    alt={u.fullName || u.userName}
                                                    className="w-6 h-6 rounded-full object-cover shrink-0"
                                                />
                                            ) : (
                                                <User size={16} className="text-gray-400 shrink-0" />
                                            )}
                                            <div className="truncate">
                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                    {u.fullName || u.userName}
                                                </p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                    @{u.userName} • {u.email}
                                                </p>
                                            </div>
                                        </div>
                                        <Check size={14} className="text-gray-300 hover:text-[#004C4B]" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {!selectedUser && searchQuery.trim() && !searching && users.length === 0 && (
                            <p className="text-xs text-gray-400 mt-2 italic">
                                No eligible users found matching "{searchQuery}".
                            </p>
                        )}
                    </div>

                    {/* Farm Permission */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Farm Permission <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={farmPermission}
                            onChange={(e) => setFarmPermission(e.target.value as "View" | "Manage")}
                            disabled={submitting}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        >
                            <option value="View">View (Can view farm and zones)</option>
                            <option value="Manage">Manage (Can manage zones, devices, settings)</option>
                        </select>
                    </div>

                    {/* Device Permission */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Device Permission
                        </label>
                        <select
                            value={devicePermission}
                            onChange={(e) => setDevicePermission(e.target.value as "None" | "View" | "Manage")}
                            disabled={submitting}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004C4B]"
                        >
                            <option value="None">None (No device access)</option>
                            <option value="View">View (Can monitor devices)</option>
                            <option value="Manage">Manage (Can control and configure devices)</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="rounded-full border border-gray-300 dark:border-gray-700 px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || !selectedUser}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#004C4B] hover:bg-[#003B3A] text-white px-5 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={14} />
                                    <span>Add Member</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
