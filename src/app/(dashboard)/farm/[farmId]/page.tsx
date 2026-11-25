import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { farmService } from "@/features/farms/services/farm-service";
import FarmCard from "@/features/farms/components/farm-card";

export default async function FarmDetailPage({
    params,
}: {
    params: Promise<{ farmId: string }>;
}) {
    const { farmId } = await params;
    const id = Number(farmId);

    if (!Number.isInteger(id) || id <= 0) {
        notFound();
    }

    const { user, accessToken } = await getAuthSession();
    if (!user || !accessToken) {
        redirect("/login");
    }

    const result = await farmService.getFarmById(id, accessToken).catch(() => null);
    if (!result?.success || !result.data) {
        notFound();
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Link
                    href="/farm"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#004C4B] dark:text-[#00E5A3] hover:underline"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Farms</span>
                </Link>
            </div>
            <FarmCard farm={result.data} currentUser={user} />
        </div>
    );
}
