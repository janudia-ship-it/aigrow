import { getAuthSession } from "@/lib/auth/session";
import { ProfileView } from "@/features/profile/components/ProfileView";
import { getMyProfileApi } from "@/features/profile/services/profile-api";

export const metadata = {
    title: "My Profile - AiGrow",
    description: "View and manage your AiGrow profile details and account security",
};

export default async function ProfilePage() {
    const { accessToken, user } = await getAuthSession();

    let currentUser = user;
    if (accessToken) {
        try {
            currentUser = await getMyProfileApi(accessToken);
        } catch {
            // fallback to session user if API is offline
            currentUser = user;
        }
    }

    // Fallback demo user if not logged in yet during development
    const resolvedUser = currentUser || {
        id: 1,
        userName: "Olivia Green",
        firstName: "Olivia",
        lastName: "Green",
        email: "olivia.green@example.com",
        phoneNumber: "775443467",
        country: "LK",
        address: "Galle, Sri Lanka",
        role: "Farmer",
        profilePictureUrl: "/Images/default image.jpg",
    };

    return <ProfileView user={resolvedUser} />;
}

