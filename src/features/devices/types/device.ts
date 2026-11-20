export const DEVICE_TYPES = [
    { label: "Climate", value: "Climate" },
    { label: "Fertigator", value: "Fertigator" },
    { label: "Weather Station", value: "WeatherStation" },
] as const;

export type DeviceType = typeof DEVICE_TYPES[number]["value"];

export interface DeviceSummary {
    id: number;
    name: string;
    deviceType: string;
    lastSeenAt: string | null;
    status: "Online" | "Offline" | "NeverConnected";
    macAddress?: string;
    isShared?: boolean;
    mqttIntervalSeconds?: number;
}

export interface CreateDevicePayload {
    deviceType: string;
    macAddress: string;
    name: string;
    farmId: number;
    zoneId?: number | null;
    blockId?: number | null;
    isShared?: boolean | null;
    mqttIntervalSeconds?: number | null;
}

export interface CreateDeviceResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: {
        id: number;
    } | null;
}

export interface UpdateDevicePayload {
    name: string;
    macAddress: string;
    isShared: boolean;
    mqttIntervalSeconds: number;
}

export interface MoveDevicePayload {
    farmId: number;
    zoneId: number | null;
    blockId: number | null;
}

export interface DeviceApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: null;
}

export interface DeviceAssignment {
    farmId: number;
    farmName: string;
    zoneId: number | null;
    zoneName: string | null;
    blockId: number | null;
    blockName: string | null;
}

export interface Sensor {
    id: number;
    name: string;
    sensorType: string;
    unit: string | null;
    value: number | null;
}

export interface ActuatorOverride {
    state: boolean;
    expiresAt: string | null;
}

export interface Actuator {
    id: number;
    name: string;
    actuatorType: string;
    isRemoteEnabled: boolean;
    controlMode: string;
    override: ActuatorOverride | null;
    value: number | null;
}

export interface DeviceDetails {
    id: number;
    name: string;
    deviceType: string;
    assignment: DeviceAssignment;
    lastSeenAt: string | null;
    status: "Online" | "Offline" | "NeverConnected" | string;
    sensors: Sensor[];
    actuators: Actuator[];
    macAddress?: string;
    isShared?: boolean;
    mqttIntervalSeconds?: number;
}

export interface DeviceDetailsApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: DeviceDetails | null;
}
