import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
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
      {/* Background Image */}
      <img
        src="/Images/bg.png"
        alt=""
        className="pointer-events-none absolute bottom-0 right-0 h-auto w-[400px] object-contain"
      />
      {/* Background Overlay */}
      <div className="absolute inset-0" />

      {/* Dashboard Content */}
      <div className="relative z-10 min-h-screen p-4 sm:p-6 space-y-6">
        {/* Top Header */}
        <Header user={currentUser} />

        {/* Main Body with Sidebar + Content */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Sidebar />
          <main className="flex-1 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
