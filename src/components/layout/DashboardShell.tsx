"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { UserProfile } from "@/features/auth/types/auth.types";

interface DashboardShellProps {
    user: UserProfile;
    children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="relative z-10 min-h-screen p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Top Header with Hamburger Toggle */}
            <Header
                user={user}
                onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
            />

            {/* Main Body */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                {/* Desktop Sidebar (hidden on mobile, visible from md up) */}
                <div className="hidden md:block shrink-0">
                    <Sidebar user={user} />
                </div>

                {/* Mobile Drawer (slides out when hamburger is clicked) */}
                <Sidebar
                    user={user}
                    isMobile
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                />

                {/* Main Content Area */}
                <main className="flex-1 w-full min-w-0">{children}</main>
            </div>
        </div>
    );
}
