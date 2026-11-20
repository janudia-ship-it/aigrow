"use client";

import { useState, useRef, useEffect } from "react";
import { User, MoreVertical, Plus, Shield, UserMinus } from "lucide-react";
import { useFarmMembers } from "../hooks/use-farm-members";
import AddMemberModal from "./add-member-modal";
import EditMemberModal from "./edit-member-modal";
import DeleteMemberModal from "./delete-member-modal";
import type { FarmMember } from "../types/member.types";
import type { UserProfile } from "../../auth/types/auth.types";

interface FarmMembersProps {
    farmId: number;
    currentUser?: UserProfile | null;
    isManager?: boolean;
}

function getMemberRoleBadge(
    member: FarmMember,
    currentUser?: UserProfile | null
): string {
    const memberRole = member.role?.toLowerCase();
    const isMemberAdmin = memberRole === "admin" || memberRole === "superadmin";

    const isCurrentUser =
        Boolean(currentUser?.id && member.userId === currentUser.id) ||
        Boolean(currentUser?.userName && member.userName === currentUser.userName);

    const currentUserRole = currentUser?.role?.toLowerCase();
    const isCurrentUserAdmin =
        currentUserRole === "admin" || currentUserRole === "superadmin";

    // 1. If the user is admin or superadmin -> display as "Admin"
    if (isMemberAdmin || (isCurrentUser && isCurrentUserAdmin)) {
        return "Admin";
    }

    // 2. Otherwise display member permissions
    if (member.permissions?.farm === "Manage") return "Farmer Manager";
    if (member.permissions?.farm === "View") return "Farm Viewer";
    if (member.permissions?.farm && member.permissions.farm !== "None") {
        return member.permissions.farm;
    }
    if (member.permissions?.device && member.permissions.device !== "None") {
        return `Device ${member.permissions.device}`;
    }

    return "Member";
}

export default function FarmMembers({ farmId, currentUser, isManager }: FarmMembersProps) {
    const { members, loading, error, refetch } = useFarmMembers(farmId);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<FarmMember | null>(null);
    const [deletingMember, setDeletingMember] = useState<FarmMember | null>(null);
    const [openMenuUserId, setOpenMenuUserId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Close options menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuUserId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 sm:p-7 bg-white dark:bg-[#0D0D0D] shadow-xs">
            {/* Header: Title + Add Members button */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                    Members
                </h2>

                {isManager && (
                    <button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#004C4B] dark:border-[#00E5A3] px-3.5 sm:px-4 py-1 text-xs sm:text-sm font-medium text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] transition cursor-pointer"
                    >
                        <span>Add Members</span>
                    </button>
                )}
            </div>

            {loading && (
                <p className="text-sm text-gray-500 py-3">
                    Loading members...
                </p>
            )}

            {error && (
                <p className="text-sm text-red-500 py-3">
                    {error}
                </p>
            )}

            {!loading && !error && members.length === 0 && (
                <p className="text-sm text-gray-400 py-3">
                    No members found for this farm.
                </p>
            )}

            {!loading && !error && members.length > 0 && (
                <div className="space-y-3">
                    {members.map((member) => (
                        <div
                            key={member.userId}
                            className="rounded-2xl bg-[#EEF4F1] dark:bg-[#142623] px-3.5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2.5 transition-colors"
                        >
                            {/* Left: Avatar / User icon + Full Name */}
                            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                                {member.profilePictureUrl ? (
                                    <img
                                        src={member.profilePictureUrl}
                                        alt={member.fullName || member.userName}
                                        className="w-8 h-8 rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <User
                                        className="text-[#004C4B] dark:text-[#00E5A3] shrink-0"
                                        size={20}
                                    />
                                )}

                                <span className="font-medium text-gray-700 dark:text-gray-200 text-xs sm:text-base truncate">
                                    {member.fullName || member.userName}
                                </span>
                            </div>

                            {/* Right: Active Status Badge + Role Badge + Options */}
                            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                                {/* Status Badge */}
                                <span className="rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold bg-[#D7E8DF] text-[#1E5440] dark:bg-[#1C3A32] dark:text-[#6EE7B7]">
                                    Active
                                </span>

                                {/* Role Badge */}
                                <span className="rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold bg-[#DCE7E1] text-[#2D5A46] dark:bg-[#203D36] dark:text-[#A7F3D0]">
                                    {getMemberRoleBadge(member, currentUser)}
                                </span>

                                {/* More Options (for Managers) */}
                                {isManager && (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenMenuUserId(
                                                    openMenuUserId === member.userId ? null : member.userId
                                                )
                                            }
                                            aria-label="Member options"
                                            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800 cursor-pointer"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {openMenuUserId === member.userId && (
                                            <div
                                                ref={menuRef}
                                                className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-lg py-1.5 z-20"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingMember(member);
                                                        setOpenMenuUserId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                >
                                                    <Shield size={13} />
                                                    <span>Edit Permissions</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDeletingMember(member);
                                                        setOpenMenuUserId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                                >
                                                    <UserMinus size={13} />
                                                    <span>Remove Member</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Member Modal */}
            <AddMemberModal
                farmId={farmId}
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onMemberAdded={refetch}
            />

            {/* Edit Member Modal */}
            <EditMemberModal
                farmId={farmId}
                member={editingMember}
                isOpen={Boolean(editingMember)}
                onClose={() => setEditingMember(null)}
                onMemberUpdated={refetch}
            />

            {/* Delete Member Modal */}
            <DeleteMemberModal
                farmId={farmId}
                member={deletingMember}
                isOpen={Boolean(deletingMember)}
                onClose={() => setDeletingMember(null)}
                onMemberDeleted={refetch}
            />
        </div>
    );
}
