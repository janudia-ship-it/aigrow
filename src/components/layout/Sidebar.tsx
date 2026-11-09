"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
    LayoutDashboard,
    UserRound,
    Sprout,
    Cpu,
    LogOut,
} from "lucide-react";

const navigationItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "My Profile",
        href: "/profile",
        icon: UserRound,
    },
    {
        name: "My Farm",
        href: "/farm",
        icon: Sprout,
    },
    {
        name: "Devices",
        href: "/devices",
        icon: Cpu,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch {
            router.push("/login");
        }
    };

    return (
        <aside className="relative w-[196px] h-full shrink-0 flex-col justify-between rounded-xl bg-white px-4 py-6">

            {/* Navigation */}
            <nav className="space-y-2">

                {navigationItems.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm transition-all duration-200 ${isActive
                                ? "bg-[#004C4B] text-white"
                                : "text-[#004C4B] hover:bg-[#E8F2EF]"
                                }`}
                        >
                            <Icon size={18} strokeWidth={2} />

                            <span>{item.name}</span>
                        </Link>
                    );
                })}

            </nav>

            {/* Logout */}
            <div className="border-t border-gray-200 px-3 pt-5">

                <button
                    type="button"
                    className="flex w-full items-center gap-4 text-sm text-[#004C4B] transition hover:text-red-600"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />

                    <span>Logout</span>
                </button>

            </div>
        </aside>
    );
}