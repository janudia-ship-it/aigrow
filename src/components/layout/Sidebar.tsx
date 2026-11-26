"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
    LayoutDashboard,
    UserRound,
    Sprout,
    Cpu,
    Layers,
    Users,
    LogOut,
    X,
} from "lucide-react";

import type { UserProfile } from "@/features/auth/types/auth.types";

interface SidebarProps {
    user?: UserProfile | null;
    isMobile?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}

const baseNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/profile", icon: UserRound },
    { name: "My Farm", href: "/farm", icon: Sprout },
    { name: "Devices", href: "/devices", icon: Cpu },
];

export function Sidebar({ user, isMobile = false, isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const role = user?.role?.toLowerCase()?.replace(/\s+/g, "");
    // Both admin and superadmin can see All Farms and All Devices
    const showAdminTabs = role === "admin" || role === "superadmin";
    const showSuperAdminTabs = role === "superadmin";

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch {
            router.push("/login");
        }
    };

    const linkClass = (href: string) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return `flex items-center gap-4 rounded-lg px-4 py-3 text-sm transition-all duration-200 ${isActive
            ? "bg-[#004C4B] text-white dark:bg-[#007A78] dark:text-white font-medium"
            : "text-[#004C4B] dark:text-gray-300 hover:bg-[#E8F2EF] dark:hover:bg-gray-800"
            }`;
    };

    const handleLinkClick = () => {
        if (isMobile && onClose) {
            onClose();
        }
    };

    const navContent = (
        <nav className="space-y-1">
            {/* Base items — all roles */}
            {baseNavItems.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={linkClass(item.href)}
                    >
                        <Icon size={18} strokeWidth={2} />
                        <span>{item.name}</span>
                    </Link>
                );
            })}

            {/* Admin / SuperAdmin extra tabs */}
            {showAdminTabs && (
                <>
                    <div className="pt-2 pb-1">
                        <div className="border-t border-gray-200 dark:border-gray-800" />
                    </div>

                    <Link
                        href="/all-farms"
                        onClick={handleLinkClick}
                        className={linkClass("/all-farms")}
                    >
                        <Layers size={18} strokeWidth={2} />
                        <span>All Farms</span>
                    </Link>

                    <Link
                        href="/all-devices"
                        onClick={handleLinkClick}
                        className={linkClass("/all-devices")}
                    >
                        <Cpu size={18} strokeWidth={2} />
                        <span>All Devices</span>
                    </Link>
                </>
            )}

            {showSuperAdminTabs && (
                <>
                    <div className="pt-2 pb-1">
                        <div className="border-t border-gray-200 dark:border-gray-800" />
                    </div>
                    <Link
                        href="/all-users"
                        onClick={handleLinkClick}
                        className={linkClass("/all-users")}
                    >
                        <Users size={18} strokeWidth={2} />
                        <span>All Users</span>
                    </Link>
                </>
            )}
        </nav>
    );

    const logoutSection = (
        <div className="border-t border-gray-200 dark:border-gray-800 px-3 pt-5">
            <button
                type="button"
                className="flex w-full items-center gap-4 text-sm text-[#004C4B] dark:text-gray-300 transition-colors hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                onClick={() => {
                    if (isMobile && onClose) onClose();
                    handleLogout();
                }}
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </div>
    );

    // Mobile Off-canvas Drawer
    if (isMobile) {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />

                {/* Off-canvas Sheet */}
                <aside className="relative z-50 w-[270px] max-w-[85vw] h-full flex flex-col justify-between bg-white dark:bg-[#0d0d0d] border-r border-gray-200 dark:border-gray-800 p-5 shadow-2xl overflow-y-auto">
                    <div>
                        {/* Drawer Header: Logo + Close */}
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2.5">
                                <Image
                                    src="/Images/Aigrow-logo.png"
                                    alt="AiGrow Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                                <span className="font-bold text-lg text-[#004C4B] dark:text-[#00E5A3]">
                                    AiGrow
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close menu"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Navigation */}
                        {navContent}
                    </div>

                    {/* Logout */}
                    {logoutSection}
                </aside>
            </div>
        );
    }

    // Desktop Static Sidebar
    return (
        <aside className="w-[196px] shrink-0 min-h-full flex flex-col justify-between rounded-xl px-4 py-6 bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-gray-800">
            {navContent}
            {logoutSection}
        </aside>
    );
}

export default Sidebar;
