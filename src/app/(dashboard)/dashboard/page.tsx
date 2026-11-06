import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import { DashboardView } from "@/features/dashboard/components/DashboardView";

export const metadata = {
  title: "Dashboard - AiGrow",
  description: "AiGrow user dashboard and overview",
};

export default async function DashboardPage() {
  const { user } = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  return <DashboardView user={user} />;
}

