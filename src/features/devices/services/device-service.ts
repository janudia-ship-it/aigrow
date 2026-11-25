import type {
    DeviceSummary,
    CreateDevicePayload,
    CreateDeviceResponse,
    UpdateDevicePayload,
    DeviceApiResponse,
    DeviceDetails,
    DeviceDetailsApiResponse,
    MoveDevicePayload,
    SensorType,
    SensorTypesApiResponse,
    SensorReadings,
    SensorReadingsApiResponse,
    AddSensorPayload,
    AddSensorResponse,
    ActuatorType,
    ActuatorTypesApiResponse,
    AddActuatorPayload,
    AddActuatorResponse,
    UpdateActuatorPayload,
    ActuatorAreaInput,
    ActuatorControlMode,
    SetActuatorModeResponse,
    SetActuatorOverridePayload,
    SetActuatorOverrideResponse,
    PagedDevices,
    PagedDevicesApiResponse,
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

export async function getSensorTypes(sensorType?: string): Promise<SensorType[]> {
    const url = sensorType
        ? `/api/sensors/types?sensorType=${encodeURIComponent(sensorType)}`
        : "/api/sensors/types";
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const result: SensorTypesApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to fetch sensor types",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success || !result.data) {
        throw new Error(result.errorMessage || "Unable to retrieve sensor types");
    }

    return result.data;
}

export async function renameSensor(sensorId: number, name: string): Promise<void> {
    const response = await fetch(`/api/sensors/${sensorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });

    const result = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to rename sensor",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3301) {
            throw new Error("Sensor not found.");
        }
        if (result.errorCode === 4019) {
            throw new Error("A sensor with this name already exists on this device.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Device Manage permission or Admin role required.");
        }
        throw new Error(result.errorMessage || "Unable to rename sensor");
    }
}

export async function getSensorReadings(
    sensorId: number,
    from: string,
    to: string
): Promise<SensorReadings> {
    const params = new URLSearchParams({ from, to });
    const response = await fetch(`/api/sensors/${sensorId}/readings?${params.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const result: SensorReadingsApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to fetch sensor readings",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success || !result.data) {
        if (result.errorCode === 1000) {
            throw new Error("Invalid time range or parameters for sensor readings.");
        }
        if (result.errorCode === 3301) {
            throw new Error("Sensor not found.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. You don't have permission to view readings for this sensor.");
        }
        throw new Error(result.errorMessage || "Unable to retrieve sensor readings");
    }

    return result.data;
}

export async function addSensor(
    deviceId: number,
    payload: AddSensorPayload
): Promise<{ id: number }> {
    const response = await fetch(`/api/admin/devices/${deviceId}/sensors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: AddSensorResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to add sensor",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success || !result.data) {
        if (result.errorCode === 1000) {
            throw new Error("Validation failed. Please verify the sensor parameters.");
        }
        if (result.errorCode === 3300) {
            throw new Error("Device not found.");
        }
        if (result.errorCode === 4015) {
            throw new Error("A sensor with this bus address and channel index already exists on this device.");
        }
        if (result.errorCode === 4017) {
            throw new Error("Cannot add sensor: Maximum limit of 40 sensors per device reached.");
        }
        if (result.errorCode === 4019) {
            throw new Error("A sensor with this name already exists on this device.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Only Admin or SuperAdmin can add sensors.");
        }
        throw new Error(result.errorMessage || "Unable to add sensor");
    }

    return result.data;
}

export async function deleteSensor(sensorId: number): Promise<void> {
    const response = await fetch(`/api/admin/sensors/${sensorId}`, {
        method: "DELETE",
    });

    const result = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to delete sensor",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3301) {
            throw new Error("Sensor not found.");
        }
        if (result.errorCode === 4027) {
            throw new Error(
                "Cannot delete sensor: It is currently used by auto rules. Change or delete those rules first."
            );
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Only Admin or SuperAdmin can delete sensors.");
        }
        throw new Error(result.errorMessage || "Unable to delete sensor");
    }
}

export async function getActuatorTypes(actuatorType?: string): Promise<ActuatorType[]> {
    const url = actuatorType
        ? `/api/actuators/types?actuatorType=${encodeURIComponent(actuatorType)}`
        : "/api/actuators/types";
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const result: ActuatorTypesApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to fetch actuator types",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success || !result.data) {
        throw new Error(result.errorMessage || "Unable to retrieve actuator types");
    }

    return result.data;
}

export async function addActuator(
    deviceId: number,
    payload: AddActuatorPayload
): Promise<{ id: number }> {
    const response = await fetch(`/api/admin/devices/${deviceId}/actuators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: AddActuatorResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to add actuator",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success || !result.data) {
        if (result.errorCode === 1000) {
            throw new Error("Validation failed. Please verify the actuator parameters.");
        }
        if (result.errorCode === 3300) {
            throw new Error("Device not found.");
        }
        if (result.errorCode === 4016) {
            throw new Error("An actuator with this channel index already exists on this device.");
        }
        if (result.errorCode === 4018) {
            throw new Error("Cannot add actuator: Maximum limit of 20 actuators per device reached.");
        }
        if (result.errorCode === 4020) {
            throw new Error("An actuator with this name already exists on this device.");
        }
        if (result.errorCode === 4032) {
            throw new Error("Cannot add actuator: Weather stations cannot have actuators.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Only Admin or SuperAdmin can add actuators.");
        }
        throw new Error(result.errorMessage || "Unable to add actuator");
    }

    return result.data;
}

export async function renameActuator(actuatorId: number, name: string): Promise<void> {
    const response = await fetch(`/api/actuators/${actuatorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });

    const result = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to rename actuator",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3302) {
            throw new Error("Actuator not found.");
        }
        if (result.errorCode === 4020) {
            throw new Error("An actuator with this name already exists on this device.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Device Manage permission or Admin role required.");
        }
        throw new Error(result.errorMessage || "Unable to rename actuator");
    }
}

export async function updateActuator(
    actuatorId: number,
    payload: UpdateActuatorPayload
): Promise<void> {
    const response = await fetch(`/api/admin/actuators/${actuatorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to update actuator",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3302) {
            throw new Error("Actuator not found.");
        }
        if (result.errorCode === 4016) {
            throw new Error("An actuator with this channel index already exists on this device.");
        }
        if (result.errorCode === 4020) {
            throw new Error("An actuator with this name already exists on this device.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Only Admin or SuperAdmin can update actuators.");
        }
        throw new Error(result.errorMessage || "Unable to update actuator");
    }
}

export async function updateActuatorAreas(
    actuatorId: number,
    areas: ActuatorAreaInput[]
): Promise<void> {
    const response = await fetch(`/api/admin/actuators/${actuatorId}/locations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areas }),
    });

    const result = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to update actuator areas",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3302) {
            throw new Error("Actuator not found.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Only Admin or SuperAdmin can update actuator locations.");
        }
        throw new Error(result.errorMessage || "Unable to update actuator areas");
    }
}

export async function deleteActuator(actuatorId: number): Promise<void> {
    const response = await fetch(`/api/admin/actuators/${actuatorId}`, {
        method: "DELETE",
    });

    const result = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to delete actuator",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3302) {
            throw new Error("Actuator not found.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Only Admin or SuperAdmin can delete actuators.");
        }
        throw new Error(result.errorMessage || "Unable to delete actuator");
    }
}

export async function setActuatorMode(
    actuatorId: number,
    mode: ActuatorControlMode | string
): Promise<void> {
    const response = await fetch(`/api/actuators/${actuatorId}/mode`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
    });

    const result: SetActuatorModeResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to set actuator mode",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 4023) {
            throw new Error("Cannot change mode: Remote control is disabled for this actuator.");
        }
        if (result.errorCode === 3302) {
            throw new Error("Actuator not found.");
        }
        if (result.errorCode === 1000) {
            throw new Error("Validation failed. Mode must be Off, On, Auto, or Schedule.");
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Device Manage permission or an Admin role is required.");
        }
        throw new Error(result.errorMessage || "Unable to set actuator mode");
    }
}

export async function setActuatorOverride(
    actuatorId: number,
    payload: SetActuatorOverridePayload
): Promise<void> {
    const response = await fetch(`/api/actuators/${actuatorId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: SetActuatorOverrideResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to set actuator override",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 4033) {
            throw new Error(
                "Overrides require manual mode ('On' or 'Off'). Change mode to On or Off first."
            );
        }
        if (result.errorCode === 4023) {
            throw new Error("Cannot set override: Remote control is disabled for this actuator.");
        }
        if (result.errorCode === 3302) {
            throw new Error("Actuator not found.");
        }
        if (result.errorCode === 1000) {
            throw new Error(
                "Validation failed. Expiration must be in the future and at most 7 days ahead."
            );
        }
        if (result.errorCode === 2002) {
            throw new Error("Forbidden. Device Manage permission or an Admin role is required.");
        }
        throw new Error(result.errorMessage || "Unable to set actuator override");
    }
}

export async function clearActuatorOverride(
    actuatorId: number,
    currentMode: ActuatorControlMode | string
): Promise<void> {
    // Re-sending current control mode removes the active override per API contract
    await setActuatorMode(actuatorId, currentMode);
}

export async function getAllDevices(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    farmId?: number;
    deviceType?: string;
} = {}): Promise<PagedDevices> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.search && params.search.trim()) {
        query.set("search", params.search.trim().slice(0, 100));
    }
    if (params.farmId && params.farmId > 0) {
        query.set("farmId", String(params.farmId));
    }
    if (params.deviceType && params.deviceType.trim()) {
        query.set("deviceType", params.deviceType.trim());
    }

    const qs = query.toString();
    const url = qs ? `/api/admin/devices?${qs}` : "/api/admin/devices";

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const result: PagedDevicesApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to fetch all devices",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success || !result.data) {
        if (result.errorCode === 2002 || response.status === 403) {
            throw new Error("Forbidden. Only Admin or SuperAdmin can view all devices.");
        }
        throw new Error(result.errorMessage || "Unable to retrieve all devices");
    }

    return result.data;
}


