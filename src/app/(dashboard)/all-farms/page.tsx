import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import AllFarmsView from "@/features/farms/components/all-farms-view";

export default async function AllFarmsPage() {
    const { user } = await getAuthSession();
    const role = user?.role?.toLowerCase()?.trim();

    if (role !== "admin" && role !== "superadmin" && role !== "super admin") {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-4">
            <AllFarmsView currentUser={user} />
        </div>
    );
}
