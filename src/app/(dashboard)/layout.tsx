import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getAuthSession();

  // Fallback demo user if session is not yet loaded in development
  const currentUser = user || {
    id: 1,
    userName: "Olivia Green",
    firstName: "Olivia",
    lastName: "Green",
    email: "olivia.green@example.com",
    phoneNumber: "775443467",
    country: "LK",
    address: "Galle, Sri Lanka",
    role: "Farmer",
    profilePictureUrl: "/Images/g.png",
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <Header user={currentUser} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Sidebar />
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
