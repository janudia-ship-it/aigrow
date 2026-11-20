import { getAuthSession } from "@/lib/auth/session";
import { farmService } from "@/features/farms/services/farm-service";
import EditFarmForm from "@/features/farms/components/edit-farm-form";
import { notFound, redirect } from "next/navigation";

export default async function EditFarmPage({
    params,
}: {
    params: Promise<{ farmId: string }>;
}) {
    const { accessToken, user } = await getAuthSession();

    if (!user) {
        redirect("/login");
    }

    const { farmId } = await params;
    const id = Number(farmId);

    if (!Number.isInteger(id) || id <= 0) {
        notFound();
    }

    let farm = null;
    if (accessToken) {
        try {
            const res = await farmService.getFarmById(id, accessToken);
            farm = res.data;
        } catch (error) {
            console.error("Failed to load farm for edit:", error);
        }
    }

    // Fallback if API is offline
    if (!farm) {
        farm = {
            id,
            name: "Farm #" + id,
            address: "",
            sizeAcre: 1,
            utcOffset: "+05:30",
            timeZoneId: "Asia/Colombo",
            latitude: 6.9271,
            longitude: 79.8612,
        };
    }

    return (
        <div className="py-4 px-2 sm:px-4">
            <EditFarmForm farm={farm} />
        </div>
    );
}
