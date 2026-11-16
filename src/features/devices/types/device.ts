export interface DeviceSummary {
    id: number;
    name: string;
    deviceType: string;
    lastSeenAt: string | null;
    status: "Online" | "Offline" | "NeverConnected";
}