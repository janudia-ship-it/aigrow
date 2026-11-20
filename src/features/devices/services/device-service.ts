import type {
    DeviceSummary,
    CreateDevicePayload,
    CreateDeviceResponse,
    UpdateDevicePayload,
    DeviceApiResponse,
    DeviceDetails,
    DeviceDetailsApiResponse,
    MoveDevicePayload,
} from "../types/device";

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

export async function createDevice(
    payload: CreateDevicePayload
): Promise<CreateDeviceResponse> {
    const response = await fetch("/api/admin/devices", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result: CreateDeviceResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to create device",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 4011) {
            throw new Error("A device with this MAC address already exists.");
        }
        if (result.errorCode === 4012) {
            throw new Error("A device with this name already exists.");
        }
        if (result.errorCode === 3200) {
            throw new Error("Farm not found.");
        }
        if (result.errorCode === 3201) {
            throw new Error("Selected zone is not part of this farm.");
        }
        if (result.errorCode === 3202) {
            throw new Error("Selected block is not part of this zone.");
        }
        throw new Error(result.errorMessage || "Unable to create device");
    }

    return result;
}

export async function updateDevice(
    deviceId: number,
    payload: UpdateDevicePayload
): Promise<void> {
    const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: DeviceApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to update device",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 1000) throw new Error("Validation failed. Please check all fields.");
        if (result.errorCode === 3300) throw new Error("Device not found.");
        if (result.errorCode === 4011) throw new Error("A device with this MAC address already exists.");
        if (result.errorCode === 4012) throw new Error("A device with this name already exists.");
        if (result.errorCode === 4030) throw new Error("Cannot disable sharing — another device's auto rule uses this device's sensors.");
        throw new Error(result.errorMessage || "Unable to update device");
    }
}

export async function moveDevice(
    deviceId: number,
    payload: MoveDevicePayload
): Promise<void> {
    const response = await fetch(`/api/admin/devices/${deviceId}/location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: DeviceApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to move device",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 1000) throw new Error("Validation failed. Please verify the destination placement.");
        if (result.errorCode === 3200) throw new Error("Destination farm not found.");
        if (result.errorCode === 3201) throw new Error("Selected zone is not part of the destination farm.");
        if (result.errorCode === 3202) throw new Error("Selected block is not part of the selected zone.");
        if (result.errorCode === 3300) throw new Error("Device not found.");
        if (result.errorCode === 4030) throw new Error("Cannot move to another farm: shared sensors are in use by auto rules or using other shared sensors.");
        if (result.errorCode === 4037) throw new Error("Cannot move to another farm: sensors or actuators are in use by a fertilizer tank, process tank, or feed.");
        throw new Error(result.errorMessage || "Unable to move device");
    }
}

export async function deleteDevice(deviceId: number): Promise<void> {
    const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
    });

    const result: DeviceApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to delete device",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3300) throw new Error("Device not found.");
        if (result.errorCode === 4030) throw new Error("Cannot delete — another device's auto rule uses this device's sensors.");
        throw new Error(result.errorMessage || "Unable to delete device");
    }
}

export async function renameDevice(deviceId: number, name: string): Promise<void> {
    const response = await fetch(`/api/devices/${deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
    });

    const result: DeviceApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to rename device",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 4012) {
            throw new Error("A device with this name already exists on this farm.");
        }
        if (result.errorCode === 3300) {
            throw new Error("Device not found.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. You need Device Manage permission or an Admin role to rename this device.");
        }
        if (result.errorCode === 1000) {
            throw new Error("Validation failed. Device name must be between 1 and 64 characters.");
        }
        throw new Error(result.errorMessage || "Unable to rename device");
    }
}

export async function getDeviceById(deviceId: number): Promise<DeviceDetails> {
    const response = await fetch(`/api/devices/${deviceId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const result: DeviceDetailsApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to fetch device details",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success || !result.data) {
        if (result.errorCode === 3300) {
            throw new Error("Device not found.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. You don't have permission to view this device.");
        }
        throw new Error(result.errorMessage || "Unable to retrieve device details");
    }

    return result.data;
}

