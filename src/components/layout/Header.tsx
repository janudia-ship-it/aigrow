"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bell,
    ChevronDown,
    UserRound,
    Settings,
    LogOut,
    Menu,
} from "lucide-react";

import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { UserProfile } from "@/features/auth/types/auth.types";

interface HeaderProps {
    user?: UserProfile | null;
    onMenuToggle?: () => void;
}

export function Header({ user, onMenuToggle }: HeaderProps) {
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const displayName =
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.userName ||
        "Default User";

    const displayEmail = user?.email || "default@example.com";
    const profilePic = user?.profilePictureUrl || "/Images/default image.jpg";

    const handleLogout = async () => {
        setIsProfileOpen(false);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch {
            router.push("/login");
        }
    };

    return (
        <header className="h-[68px] sm:h-[76px] w-full
    bg-white dark:bg-[#0d0d0d]
    border border-gray-200 dark:border-gray-800
    rounded-xl flex items-center justify-between
    px-3.5 sm:px-6 md:px-10 shadow-sm
    transition-colors duration-200">

            {/* Left: Mobile Hamburger + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
                {onMenuToggle && (
                    <button
                        type="button"
                        onClick={onMenuToggle}
                        aria-label="Toggle navigation menu"
                        className="md:hidden p-2 rounded-lg text-[#004C4B] dark:text-[#00E5A3] hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                        <Menu size={22} />
                    </button>
                )}

                <Link href="/dashboard" className="flex items-center">
                    <Image
                        src="/Images/Aigrow-logo.png"
                        alt="AI Grow Logo"
                        width={35}
                        height={35}
                        priority
                        className="object-contain"
                    />
                </Link>
            </div>

            {/* Right: Header Actions */}
            <div className="flex items-center gap-2 sm:gap-4 md:gap-7">

                {/* Theme Switcher */}
                <ThemeSwitcher />

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Notifications */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative text-[#004C4B] dark:text-[#00E5A3] hover:text-[#007A78] transition p-1 cursor-pointer"
                >
                    <Bell size={20} className="sm:w-[21px] sm:h-[21px]" />
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
                </button>

                {/* User Profile Dropdown */}
                <div className="relative">

                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        aria-expanded={isProfileOpen}
                        className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 cursor-pointer"
                    >
                        <div className="relative w-9 h-9 sm:w-10 sm:h-10">
                            <Image
                                src={profilePic || "/Images/default image.jpg"}
                                alt={displayName}
                                fill
                                sizes="40px"
                                className="rounded-full object-cover"
                            />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#007A78] border-2 border-white dark:border-[#0d0d0d]" />
                        </div>

                        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                            {displayName}
                        </span>

                        <ChevronDown
                            size={16}
                            className={`text-gray-600 dark:text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* Dropdown */}
                    {isProfileOpen && (
                        <>
                            <button
                                type="button"
                                aria-label="Close profile menu"
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={() => setIsProfileOpen(false)}
                            />

                            <div className="absolute right-0 top-13 sm:top-14 z-50 w-52 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C1E] py-2 shadow-lg">

                                <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                        {displayName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {displayEmail}
                                    </p>
                                </div>

                                <Link
                                    href="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
                                >
                                    <UserRound size={17} />
                                    My Profile
                                </Link>

                                <Link
                                    href="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
                                >
                                    <Settings size={17} />
                                    Settings
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                                >
                                    <LogOut size={17} />
                                    Logout
                                </button>

                            </div>
                        </>
                    )}

                </div>
            </div>
        </header>
    );
}

export default Header;
