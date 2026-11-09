"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LogOut,
  User,
  Mail,
  Shield,
  Phone,
  MapPin,
  Globe2,
  Calendar,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import type { UserProfile } from "@/features/auth/types/auth.types";

export function DashboardView({ user }: { user: UserProfile }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.userName;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Top Navigation Bar
      <header className="sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-28 h-9">
              <Image
                src="/Aigrow-logo.png"
                alt="AiGrow Logo"
                fill
                sizes="120px"
                className="object-contain object-left"
                priority
              />
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--color-badge-teal-bg)] dark:bg-[var(--color-fertigating-bg-dark)] text-[var(--color-primary)] dark:text-[var(--color-accent-mint)] border border-[var(--color-badge-teal-border)] dark:border-[var(--color-fertigating-border-dark)]">
              {user.role || "User"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitcher />
            <LanguageSwitcher />

            <Button
              variant="outline"
              size="sm"
              shape="rounded"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs sm:text-sm font-medium border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--color-fertigating-bg-light)] dark:hover:bg-[var(--color-fertigating-bg-dark)]"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <LogOut className="w-4 h-4 mr-1.5" />
              )}
              {isLoggingOut ? t("loggingOut") : t("logout")}
            </Button>
          </div>
        </div>
      </header> */}

      {/* Main Dashboard Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-teal-medium)] text-white p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t("welcomeUser", { name: fullName })}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-badge-teal-border)]">
                {t("overview")}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20 text-xs">
              <Calendar className="w-4 h-4 text-[var(--color-accent-mint)]" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Summary Widget */}
          <Card className="lg:col-span-1 border-[var(--card-border)] bg-[var(--surface)] flex flex-col items-center p-6 text-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-[var(--color-primary)]/30 bg-[var(--color-fertigating-bg-light)] dark:bg-[var(--color-fertigating-bg-dark)] flex items-center justify-center">
              {user.profilePictureUrl ? (
                <Image
                  src={user.profilePictureUrl}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-[var(--color-primary)] dark:text-[var(--color-accent-mint)]" />
              )}
            </div>

            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {fullName}
            </h2>
            <p className="text-xs text-[var(--text-hint)] mb-3">
              @{user.userName}
            </p>

            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-fertigating-bg-light)] dark:bg-[var(--color-fertigating-bg-dark)] text-[var(--color-primary)] dark:text-[var(--color-accent-mint)] border border-[var(--color-fertigating-border-light)] dark:border-[var(--color-fertigating-border-dark)]">
              {user.role}
            </span>
          </Card>

          {/* Detailed Info Cards */}
          <Card className="lg:col-span-2 border-[var(--card-border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[var(--foreground)]">
                {t("overview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <dt className="flex items-center gap-2 text-xs font-medium text-[var(--text-hint)] mb-1">
                    <User className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-accent-mint)]" />
                    {t("id")}
                  </dt>
                  <dd className="font-semibold text-[var(--foreground)]">
                    #{user.id}
                  </dd>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <dt className="flex items-center gap-2 text-xs font-medium text-[var(--text-hint)] mb-1">
                    <User className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-accent-mint)]" />
                    {t("username")}
                  </dt>
                  <dd className="font-semibold text-[var(--foreground)]">
                    {user.userName}
                  </dd>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <dt className="flex items-center gap-2 text-xs font-medium text-[var(--text-hint)] mb-1">
                    <Mail className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-accent-mint)]" />
                    {t("email")}
                  </dt>
                  <dd className="font-semibold text-[var(--foreground)] break-all">
                    {user.email || t("notProvided")}
                  </dd>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <dt className="flex items-center gap-2 text-xs font-medium text-[var(--text-hint)] mb-1">
                    <Shield className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-accent-mint)]" />
                    {t("role")}
                  </dt>
                  <dd className="font-semibold text-[var(--foreground)]">
                    {user.role}
                  </dd>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <dt className="flex items-center gap-2 text-xs font-medium text-[var(--text-hint)] mb-1">
                    <Phone className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-accent-mint)]" />
                    {t("phoneNumber")}
                  </dt>
                  <dd className="font-semibold text-[var(--foreground)]">
                    {user.phoneNumber || t("notProvided")}
                  </dd>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <dt className="flex items-center gap-2 text-xs font-medium text-[var(--text-hint)] mb-1">
                    <Globe2 className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-accent-mint)]" />
                    {t("country")}
                  </dt>
                  <dd className="font-semibold text-[var(--foreground)]">
                    {user.country || t("notProvided")}
                  </dd>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <dt className="flex items-center gap-2 text-xs font-medium text-[var(--text-hint)] mb-1">
                    <MapPin className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-accent-mint)]" />
                    {t("address")}
                  </dt>
                  <dd className="font-semibold text-[var(--foreground)]">
                    {user.address || t("notProvided")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

