import type {
    Zone,
    ZonesApiResponse,
    CreateZonePayload,
    CreateZoneResponse,
    UpdateZonePayload,
    ZoneApiResponse,
    CreateBlockPayload,
    CreateBlockResponse,
    UpdateBlockPayload,
    BlockApiResponse,
} from "../types/zone.types";

export async function getFarmZones(farmId: number): Promise<Zone[]> {
    const response = await fetch(`/api/farms/${farmId}/zones`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
    });

    const result: ZonesApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to fetch farm zones",
        success: false,
        message: null,
        data: [],
    }));

    if (!response.ok || !result.success) {
        throw new Error(result.errorMessage || "Unable to retrieve zones");
    }

    return result.data || [];
}

export async function createFarmZone(
    farmId: number,
    payload: CreateZonePayload
): Promise<CreateZoneResponse> {
    const response = await fetch(`/api/farms/${farmId}/zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: CreateZoneResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to create zone",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 4007) {
            throw new Error("A zone with this name already exists in this farm.");
        }
        throw new Error(result.errorMessage || "Unable to create zone");
    }

    return result;
}

export async function updateZone(
    zoneId: number,
    payload: UpdateZonePayload
): Promise<void> {
    const response = await fetch(`/api/zones/${zoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: ZoneApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to update zone",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3201) throw new Error("Zone not found.");
        if (result.errorCode === 4007) throw new Error("A zone with this name already exists in this farm.");
        throw new Error(result.errorMessage || "Unable to update zone");
    }
}

export async function deleteZone(zoneId: number): Promise<void> {
    const response = await fetch(`/api/zones/${zoneId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    const result: ZoneApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to delete zone",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3201) throw new Error("Zone not found.");
        if (result.errorCode === 4013) throw new Error("Cannot delete zone: it still has devices assigned to it.");
        if (result.errorCode === 4021) throw new Error("Cannot delete zone: sensors, actuators or feeds are still active on it.");
        throw new Error(result.errorMessage || "Unable to delete zone");
    }
}

export async function createZoneBlock(
    zoneId: number,
    payload: CreateBlockPayload
): Promise<CreateBlockResponse> {
    const response = await fetch(`/api/zones/${zoneId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: CreateBlockResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to create block",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 4008) {
            throw new Error("A block with this name already exists in this zone.");
        }
        if (result.errorCode === 3201) {
            throw new Error("Zone not found.");
        }
        throw new Error(result.errorMessage || "Unable to create block");
    }

    return result;
}

export async function updateBlock(
    blockId: number,
    payload: UpdateBlockPayload
): Promise<void> {
    const response = await fetch(`/api/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: BlockApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to update block",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3202) throw new Error("Block not found.");
        if (result.errorCode === 4008) throw new Error("A block with this name already exists in this zone.");
        throw new Error(result.errorMessage || "Unable to update block");
    }
}

export async function deleteBlock(blockId: number): Promise<void> {
    const response = await fetch(`/api/blocks/${blockId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    const result: BlockApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to delete block",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3202) throw new Error("Block not found.");
        if (result.errorCode === 4014) throw new Error("Cannot delete block: devices are still assigned to this block.");
        if (result.errorCode === 4022) throw new Error("Cannot delete block: sensors, actuators or feeds are still serving it.");
        throw new Error(result.errorMessage || "Unable to delete block");
    }
}



