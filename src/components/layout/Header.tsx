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
} from "lucide-react";

import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { UserProfile } from "@/features/auth/types/auth.types";

interface HeaderProps {
    user?: UserProfile | null;
}

export function Header({ user }: HeaderProps) {
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
        <header className="h-[76px] w-full bg-white border border-gray-200 rounded-xl flex items-center justify-between px-6 md:px-10 shadow-sm">

            {/* Left: Logo */}
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

            {/* Right: Header Actions */}
            <div className="flex items-center gap-4 md:gap-7">

                {/* Theme Switcher */}
                <ThemeSwitcher />

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Notifications */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative text-[#004C4B] hover:text-[#007A78] transition"
                >
                    <Bell size={21} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                </button>

                {/* User Profile Dropdown */}
                <div className="relative">

                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        aria-expanded={isProfileOpen}
                        className="flex items-center gap-2 md:gap-3 cursor-pointer"
                    >
                        <div className="relative w-10 h-10">
                            <Image
                                src={profilePic || "/Images/default image.jpg"}
                                alt={displayName}
                                fill
                                sizes="40px"
                                className="rounded-full object-cover"
                            />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#007A78] border-2 border-white" />
                        </div>

                        <span className="hidden sm:block text-sm font-medium text-gray-700">
                            {displayName}
                        </span>

                        <ChevronDown
                            size={16}
                            className={`text-gray-600 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
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

                            <div className="absolute right-0 top-14 z-50 w-52 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">

                                <div className="border-b border-gray-100 px-4 py-3">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {displayName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {displayEmail}
                                    </p>
                                </div>

                                <Link
                                    href="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition"
                                >
                                    <UserRound size={17} />
                                    My Profile
                                </Link>

                                <Link
                                    href="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition"
                                >
                                    <Settings size={17} />
                                    Settings
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
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
