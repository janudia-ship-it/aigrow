import type { DeviceSummary } from "../types/device";

export async function getFarmDevices(
    farmId: number
): Promise<DeviceSummary[]> {
    const response = await fetch(
        `/api/farms/${farmId}/devices`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        }
    );

    const result = await response.json().catch(() => ({
        success: false,
        errorMessage: "Failed to fetch farm devices",
        data: [],
    }));

    if (!response.ok || !result.success) {
        throw new Error(
            result.errorMessage || "Unable to retrieve devices"
        );
    }

    return result.data || [];
}
