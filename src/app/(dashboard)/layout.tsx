import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SessionGuard } from "@/components/auth/SessionGuard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  const currentUser = user;

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed dark:bg-[var(--background)]">
      <SessionGuard />
      {/* Background Image - scaled down and translucent on mobile */}
      <img
        src="/Images/bg.png"
        alt=""
        className="pointer-events-none absolute bottom-0 right-0 h-auto w-[220px] sm:w-[320px] md:w-[400px] object-contain opacity-50 sm:opacity-80 md:opacity-100"
      />
      {/* Background Overlay */}
      <div className="absolute inset-0" />

      {/* Responsive Dashboard Shell (Header + Mobile Drawer / Desktop Sidebar + Content) */}
      <DashboardShell user={currentUser}>
        {children}
      </DashboardShell>
    </div>
  );
}
