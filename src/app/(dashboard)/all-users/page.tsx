import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import AllUsersView from "@/features/users/components/all-users-view";

export default async function AllUsersPage() {
    const { user } = await getAuthSession();
    const role = user?.role?.toLowerCase()?.replace(/\s+/g, "");

    if (role !== "superadmin") {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-4">
            <AllUsersView currentUser={user} />
        </div>
    );
}
