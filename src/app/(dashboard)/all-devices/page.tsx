import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import AllDevicesView from "@/features/devices/components/all-devices-view";

export default async function AllDevicesPage() {
    const { user } = await getAuthSession();
    const role = user?.role?.toLowerCase()?.trim();

    if (role !== "admin" && role !== "superadmin" && role !== "super admin") {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-4">
            <AllDevicesView />
        </div>
    );
}
