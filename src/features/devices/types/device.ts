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

export interface AdminDevice {
    id: number;
    name: string;
    deviceType: string;
    macAddress: string;
    assignment: DeviceAssignment;
    isShared: boolean;
    mqttIntervalSeconds: number;
    lastSeenAt: string | null;
    status: "Online" | "Offline" | "NeverConnected" | string;
}

export interface PagedDevices {
    items: AdminDevice[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PagedDevicesApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: PagedDevices | null;
}

export interface Sensor {
    id: number;
    name: string;
    sensorType: string;
    unit: string | null;
    value: number | null;
}

export interface SensorType {
    sensorType: string;
    displayName: string;
    unit: string | null;
}

export interface SensorTypesApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: SensorType[] | null;
}

export type ActuatorControlMode = "Off" | "On" | "Auto" | "Schedule";

export interface ActuatorOverride {
    state: boolean;
    expiresAt: string | null;
}

export interface Actuator {
    id: number;
    name: string;
    actuatorType: string;
    isRemoteEnabled: boolean;
    controlMode: ActuatorControlMode | string;
    override: ActuatorOverride | null;
    value: number | null;
    channelIndex?: number;
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

export interface SensorReadingPoint {
    time: string;
    avg: number | null;
    min: number | null;
    max: number | null;
}

export interface SensorReadings {
    resolution: "raw" | "10m" | "30m" | "1h" | "1d" | string;
    points: SensorReadingPoint[];
}

export interface SensorReadingsApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: SensorReadings | null;
}

export interface AddSensorPayload {
    sensorType: string;
    name: string;
    busAddress: number;
    channelIndex: number;
}

export interface AddSensorResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: {
        id: number;
    } | null;
}

export interface ActuatorType {
    actuatorType: string;
    displayName: string;
}

export interface ActuatorTypesApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: ActuatorType[] | null;
}

export interface AddActuatorPayload {
    actuatorType: string;
    name: string;
    channelIndex: number;
    isRemoteEnabled: boolean;
}

export interface AddActuatorResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: {
        id: number;
    } | null;
}

export interface UpdateActuatorPayload {
    name: string;
    channelIndex: number;
    isRemoteEnabled: boolean;
}

export interface ActuatorAreaInput {
    zoneId: number | null;
    blockId: number | null;
}

export interface UpdateActuatorAreasPayload {
    areas: ActuatorAreaInput[];
}

export interface SetActuatorModePayload {
    mode: ActuatorControlMode | string;
}

export interface SetActuatorModeResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: null;
}

export interface SetActuatorOverridePayload {
    state: boolean;
    expiresAt: string | null;
}

export interface SetActuatorOverrideResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: null;
}






