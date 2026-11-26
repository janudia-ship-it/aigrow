import { getAuthSession } from "@/lib/auth/session";
import ActuatorHistoryView from "@/features/devices/components/actuator-history-view";

export default async function ActuatorHistoryPage({
    params,
}: {
    params: Promise<{ deviceId: string; actuatorId: string }>;
}) {
    const resolvedParams = await params;
    const deviceId = Number(resolvedParams.deviceId);
    const actuatorId = Number(resolvedParams.actuatorId);
    await getAuthSession();

    return (
        <ActuatorHistoryView
            actuatorId={actuatorId}
            deviceId={deviceId}
        />
    );
}
