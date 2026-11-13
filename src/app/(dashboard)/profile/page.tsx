import { redirect } from "next/navigation";
import { getAuthSession, clearAuthSession } from "@/lib/auth/session";
import { ProfileView } from "@/features/profile/components/ProfileView";
import { getMyProfileApi } from "@/features/profile/services/profile-api";
import { ApiError } from "@/lib/api/api-error";

export const metadata = {
    title: "My Profile - AiGrow",
    description: "View and manage your AiGrow profile details and account security",
};

export default async function ProfilePage() {
    const { accessToken, user } = await getAuthSession();

    if (!accessToken || !user) {
        redirect("/login");
    }

    let currentUser = user;
    if (accessToken) {
        try {
            currentUser = await getMyProfileApi(accessToken);
        } catch (error) {
            if (error instanceof ApiError && (error.status === 401 || error.errorCode === 2008)) {
                await clearAuthSession();
                redirect("/login?sessionExpired=true");
            }
            // fallback to session user if API is offline
            currentUser = user;
        }
    }

    return <ProfileView user={currentUser} />;
}

