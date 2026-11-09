import { getAuthSession } from "@/lib/auth/session";
import { ProfileView } from "@/features/profile/components/ProfileView";

export const metadata = {
    title: "My Profile - AiGrow",
    description: "View and manage your AiGrow profile details and account security",
};

export default async function ProfilePage() {
    const { user } = await getAuthSession();

    // Fallback demo user if not logged in yet during development
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
        profilePictureUrl: "/Images/default image.jpg",
    };

    return <ProfileView user={currentUser} />;
}

