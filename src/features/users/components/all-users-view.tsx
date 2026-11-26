"use client";

import { useState, useRef, useEffect } from "react";
import {
    Search,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Loader2,
    Users,
    UserCog,
    MoreVertical,
    Eye,
    ArrowLeft,
    ShieldCheck,
    Mail,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { useAllUsers } from "../hooks/use-all-users";
import UserCard from "./user-card";
import type { UserDetails } from "../types/user.types";
import type { UserProfile } from "@/features/auth/types/auth.types";

interface AllUsersViewProps {
    currentUser?: UserProfile | null;
}

function RoleBadge({ role }: { role: string }) {
    const r = role?.toLowerCase();
    if (r === "superadmin") {
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#004C4B] text-white dark:bg-[#007A78]">
                <UserCog size={12} />
                SuperAdmin
            </span>
        );
    }
    if (r === "admin") {
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#004C4B] text-white dark:bg-[#007A78]">
                <UserCog size={12} />
                Admin
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {role || "Farmer"}
        </span>
    );
}

export default function AllUsersView({ currentUser }: AllUsersViewProps) {
    const {
        users,
        page,
        pageSize,
        totalCount,
        totalPages,
        search,
        role,
        isActive,
        isEmailVerified,
        loading,
        error,
        setPage,
        setSearch,
        setRole,
        setIsActive,
        setIsEmailVerified,
        resetFilters,
        refetch,
    } = useAllUsers(20);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [viewingUser, setViewingUser] = useState<UserDetails | null>(null);
    const menuContainerRef = useRef<HTMLDivElement | null>(null);

    // Close action menu when clicking outside
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

    const activeFilterValue = isActive === undefined ? "" : String(isActive);
    const emailVerifiedFilterValue = isEmailVerified === undefined ? "" : String(isEmailVerified);

    const handleActiveFilterChange = (val: string) => {
        if (val === "true") setIsActive(true);
        else if (val === "false") setIsActive(false);
        else setIsActive(undefined);
    };

    const handleVerifiedFilterChange = (val: string) => {
        if (val === "true") setIsEmailVerified(true);
        else if (val === "false") setIsEmailVerified(false);
        else setIsEmailVerified(undefined);
    };

    const hasFilters = !!(search || role || isActive !== undefined || isEmailVerified !== undefined);

    // Detailed user view matching FarmCard in AllFarmsView
    if (viewingUser) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setViewingUser(null)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#004C4B] dark:text-[#00E5A3] hover:underline cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to All Users</span>
                    </button>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Viewing User:{" "}
                        <strong className="text-gray-800 dark:text-gray-200">
                            {viewingUser.firstName} {viewingUser.lastName}
                        </strong>
                    </span>
                </div>

                <UserCard user={viewingUser} />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Top Bar: Search, Role Filter, Status Filter, Email Verified Filter, and Reset */}
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
                            placeholder="Search by name, username or email"
                            className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition"
                        />
                    </div>

                    {/* Role Filter Pill */}
                    <div className="relative min-w-[140px]">
                        <UserCog
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            aria-label="Filter by role"
                            className="w-full appearance-none rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] pl-9 pr-8 py-2.5 text-sm text-gray-600 dark:text-gray-300 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer"
                        >
                            <option value="">All Roles</option>
                            <option value="SuperAdmin">SuperAdmin</option>
                            <option value="Admin">Admin</option>
                            <option value="Farmer">Farmer</option>
                        </select>
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            ▾
                        </span>
                    </div>

                    {/* Status Filter Pill */}
                    <div className="relative min-w-[140px]">
                        <ShieldCheck
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <select
                            value={activeFilterValue}
                            onChange={(e) => handleActiveFilterChange(e.target.value)}
                            aria-label="Filter by status"
                            className="w-full appearance-none rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] pl-9 pr-8 py-2.5 text-sm text-gray-600 dark:text-gray-300 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            ▾
                        </span>
                    </div>

                    {/* Email Verified Filter Pill */}
                    <div className="relative min-w-[155px]">
                        <Mail
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <select
                            value={emailVerifiedFilterValue}
                            onChange={(e) => handleVerifiedFilterChange(e.target.value)}
                            aria-label="Filter by email verification"
                            className="w-full appearance-none rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] pl-9 pr-8 py-2.5 text-sm text-gray-600 dark:text-gray-300 focus:border-[#004C4B] dark:focus:border-[#00E5A3] focus:outline-none transition cursor-pointer"
                        >
                            <option value="">All Email</option>
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </select>
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            ▾
                        </span>
                    </div>

                    {/* Reset Button Pill */}
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1E] transition cursor-pointer"
                        >
                            <RotateCcw size={15} className="text-gray-400" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>

                {/* Refresh button */}
                <div className="flex items-center justify-end shrink-0">
                    <button
                        type="button"
                        onClick={refetch}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121214] px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#004C4B] dark:hover:border-[#00E5A3] transition cursor-pointer shadow-2xs"
                        title="Reload users"
                    >
                        <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
                        <span>Refresh</span>
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
                <div className="col-span-3 text-center">User Details</div>
                <div className="col-span-3 text-center">Email</div>
                <div className="col-span-2 text-center">Role</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 size={24} className="animate-spin text-[#004C4B] dark:text-[#00E5A3]" />
                    <span>Loading users...</span>
                </div>
            ) : users.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/70 dark:bg-[#0D0D0D] py-12 text-center space-y-2">
                    <Users size={28} className="mx-auto text-gray-400" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {hasFilters ? "No users match your filters." : "No users found."}
                    </p>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="text-xs text-[#004C4B] dark:text-[#00E5A3] underline cursor-pointer hover:opacity-80 transition"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {users.map((user, index) => {
                        const rowNumber = (page - 1) * pageSize + index + 1;
                        const isMenuOpen = openMenuId === user.id;

                        return (
                            <div
                                key={user.id}
                                className="relative grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-0 rounded-2xl md:rounded-full bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 px-5 md:px-6 py-3.5 shadow-2xs hover:border-[#004C4B]/40 dark:hover:border-[#00E5A3]/40 transition text-sm"
                            >
                                {/* # */}
                                <div className="md:col-span-1 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">#</span>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        {rowNumber}
                                    </span>
                                </div>

                                {/* User Details */}
                                <div className="md:col-span-3 flex md:justify-center items-center justify-between min-w-0">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        User Details
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setViewingUser(user)}
                                        className="flex items-center gap-2.5 font-medium text-gray-800 dark:text-gray-100 hover:text-[#004C4B] dark:hover:text-[#00E5A3] hover:underline truncate max-w-full cursor-pointer text-left"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-[#E8F2EF] dark:bg-[#102A27] text-[#004C4B] dark:text-[#00E5A3] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                            {user.profilePictureUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={user.profilePictureUrl}
                                                    alt={user.firstName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                user.firstName?.[0]?.toUpperCase() || user.userName?.[0]?.toUpperCase() || "U"
                                            )}
                                        </div>
                                        <div className="truncate">
                                            <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-normal truncate">
                                                @{user.userName}
                                            </p>
                                        </div>
                                    </button>
                                </div>

                                {/* Email */}
                                <div className="md:col-span-3 flex md:justify-center items-center justify-between min-w-0">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Email
                                    </span>
                                    <span
                                        className="text-gray-600 dark:text-gray-300 truncate max-w-full"
                                        title={user.email}
                                    >
                                        {user.email}
                                    </span>
                                </div>

                                {/* Role */}
                                <div className="md:col-span-2 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Role
                                    </span>
                                    <RoleBadge role={user.role} />
                                </div>

                                {/* Status */}
                                <div className="md:col-span-2 flex md:justify-center items-center justify-between">
                                    <span className="md:hidden text-xs font-semibold text-gray-400">
                                        Status
                                    </span>
                                    <span
                                        className={`inline-flex items-center justify-center rounded-full px-4 py-0.5 text-xs font-medium border ${
                                            user.isActive
                                                ? "bg-[#DCE7E1] dark:bg-[#142623] border-[#004C4B]/30 dark:border-[#00E5A3]/30 text-[#004C4B] dark:text-[#00E5A3]"
                                                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                                        }`}
                                    >
                                        {user.isActive ? "Active" : "Inactive"}
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
                                                    prev === user.id ? null : user.id
                                                )
                                            }
                                            aria-label={`Actions for ${user.firstName}`}
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
                                                        setViewingUser(user);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                >
                                                    <Eye size={13} />
                                                    <span>View User Details</span>
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

            {/* Pagination Footer matching AllFarmsView */}
            {!loading && totalCount > 0 && (
                <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        Showing page <strong className="text-gray-700 dark:text-gray-200">{page}</strong> of{" "}
                        <strong className="text-gray-700 dark:text-gray-200">{totalPages}</strong> ({totalCount}{" "}
                        {totalCount === 1 ? "user" : "users"})
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} />
                            <span>Prev</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                        >
                            <span>Next</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
