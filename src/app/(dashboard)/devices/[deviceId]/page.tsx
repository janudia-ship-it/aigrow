import { getAuthSession } from "@/lib/auth/session";
import DeviceDetailView from "@/features/devices/components/device-detail-view";

export default async function DeviceDetailPage({
    params,
}: {
    params: Promise<{ deviceId: string }>;
}) {
    const resolvedParams = await params;
    const deviceId = Number(resolvedParams.deviceId);
    const { user } = await getAuthSession();

    return (
        <DeviceDetailView
            deviceId={deviceId}
            currentUser={user}
        />
    );
}
