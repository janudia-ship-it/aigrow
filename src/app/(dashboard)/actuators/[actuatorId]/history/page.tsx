import { getAuthSession } from "@/lib/auth/session";
import ActuatorHistoryView from "@/features/devices/components/actuator-history-view";

export default async function DirectActuatorHistoryPage({
    params,
}: {
    params: Promise<{ actuatorId: string }>;
}) {
    const resolvedParams = await params;
    const actuatorId = Number(resolvedParams.actuatorId);
    await getAuthSession();

    return (
        <ActuatorHistoryView
            actuatorId={actuatorId}
        />
    );
}
