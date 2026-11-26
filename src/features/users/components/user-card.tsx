"use client";

import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    Globe,
    Shield,
    Clock,
    UserCog,
    AtSign,
    Hash,
    CheckCircle2,
    XCircle,
    Calendar,
} from "lucide-react";
import type { UserDetails } from "../types/user.types";

interface UserCardProps {
    user: UserDetails;
}

function RoleBadge({ role }: { role: string }) {
    const r = role?.toLowerCase();
    if (r === "superadmin") {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#004C4B] text-white dark:bg-[#007A78]">
                <UserCog size={13} />
                SuperAdmin
            </span>
        );
    }
    if (r === "admin") {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#004C4B] text-white dark:bg-[#007A78]">
                <UserCog size={13} />
                Admin
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {role || "Farmer"}
        </span>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    if (active) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCF5EC] text-[#1A5C40] dark:bg-[#1C3A2A] dark:text-[#6EE7B7]">
                <CheckCircle2 size={13} />
                Active
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            <XCircle size={13} />
            Inactive
        </span>
    );
}

function EmailVerifiedBadge({ verified }: { verified: boolean }) {
    if (verified) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCF5EC] text-[#1A5C40] dark:bg-[#1C3A2A] dark:text-[#6EE7B7]">
                <CheckCircle2 size={13} />
                Verified
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <XCircle size={13} />
            Unverified
        </span>
    );
}

function formatUtcDateTime(dt: string | null): string {
    if (!dt) return "Never logged in";
    try {
        const d = new Date(dt);
        return d.toUTCString();
    } catch {
        return dt;
    }
}

export default function UserCard({ user }: UserCardProps) {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.userName;

    return (
        <div className="space-y-5">
            {/* Top User Summary Card */}
            <div className="rounded-2xl p-5 sm:p-6 shadow-xs bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E8F2EF] dark:bg-[#102A27] text-[#004C4B] dark:text-[#00E5A3] flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 overflow-hidden border-2 border-[#004C4B]/20 dark:border-[#00E5A3]/20">
                    {user.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.profilePictureUrl}
                            alt={fullName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        fullName.charAt(0).toUpperCase() || "U"
                    )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                            {fullName}
                        </h2>
                        <RoleBadge role={user.role} />
                        <StatusBadge active={user.isActive} />
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.userName} • {user.email}
                    </p>

                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        User ID: #{user.id}
                    </p>
                </div>
            </div>

            {/* Grid matching FarmCard: Property Facts & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                {/* Personal Information Card */}
                <div className="min-w-0 rounded-2xl p-4 sm:p-5 shadow-xs bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                            Personal Details
                        </h2>
                    </div>

                    <div className="rounded-lg p-1 sm:p-2">
                        {/* First Name */}
                        <div className="flex items-center gap-3 p-2">
                            <UserRound size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">First Name</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                {user.firstName || "—"}
                            </p>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Last Name */}
                        <div className="flex items-center gap-3 p-2">
                            <UserRound size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">Last Name</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                {user.lastName || "—"}
                            </p>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Username */}
                        <div className="flex items-center gap-3 p-2">
                            <AtSign size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">Username</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                {user.userName}
                            </p>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* User ID */}
                        <div className="flex items-center gap-3 p-2">
                            <Hash size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">User ID</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                #{user.id}
                            </p>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Role */}
                        <div className="flex items-center gap-3 p-2">
                            <Shield size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">System Role</p>
                            <div className="text-right">
                                <RoleBadge role={user.role} />
                            </div>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Account Status */}
                        <div className="flex items-center gap-3 p-2">
                            <CheckCircle2 size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">Account Status</p>
                            <div className="text-right">
                                <StatusBadge active={user.isActive} />
                            </div>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Email Verification */}
                        <div className="flex items-center gap-3 p-2">
                            <Mail size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">Email Verification</p>
                            <div className="text-right">
                                <EmailVerifiedBadge verified={user.isEmailVerified} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Location Card */}
                <div className="min-w-0 rounded-2xl p-4 sm:p-5 shadow-xs bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-[#004C4B] dark:text-[#00E5A3]">
                            Contact & Location
                        </h2>
                    </div>

                    <div className="rounded-lg p-1 sm:p-2">
                        {/* Email Address */}
                        <div className="flex items-center gap-3 p-2">
                            <Mail size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">Email Address</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right truncate max-w-[60%]">
                                {user.email}
                            </p>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Phone Number */}
                        <div className="flex items-center gap-3 p-2">
                            <Phone size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">Phone Number</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                {user.phoneNumber || "N/A"}
                            </p>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Country */}
                        <div className="flex items-center gap-3 p-2">
                            <Globe size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">Country</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                {user.country || "N/A"}
                            </p>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Address */}
                        <div className="flex items-center gap-3 p-2">
                            <MapPin size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">Address</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right truncate max-w-[60%]">
                                {user.address || "N/A"}
                            </p>
                        </div>
                        <hr className="my-2.5 sm:my-3 border-gray-200 dark:border-gray-800" />

                        {/* Last Login (UTC) */}
                        <div className="flex items-center gap-3 p-2">
                            <Clock size={20} className="text-[#00615C] dark:text-[#00E5A3] shrink-0" />
                            <p className="flex-1 text-xs sm:text-sm text-gray-400">Last Login (UTC)</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                {formatUtcDateTime(user.lastLoginAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
