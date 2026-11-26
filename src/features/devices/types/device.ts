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

export interface RuleCondition {
    id: number;
    sensorId: number;
    operator: string;
    threshold: number;
}

export interface RuleConditionInput {
    sensorId: number;
    operator: string;
    threshold: number;
}

export interface ActuatorRule {
    id: number;
    name: string;
    matchType: "All" | "Any" | string;
    targetState: boolean;
    isEnabled: boolean;
    conditions: RuleCondition[];
}

export interface CreateActuatorRulePayload {
    name: string;
    matchType: "All" | "Any" | string;
    targetState: boolean;
    isEnabled: boolean;
    conditions: RuleConditionInput[];
}

export interface UpdateActuatorRulePayload {
    name: string;
    matchType: "All" | "Any" | string;
    targetState: boolean;
    isEnabled: boolean;
    conditions: RuleConditionInput[];
}

export interface RuleSensor {
    id: number;
    name: string;
    sensorType: string;
    unit: string | null;
    deviceId: number;
    deviceName: string;
    isOwnDevice: boolean;
}

export interface ActuatorRulesApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: ActuatorRule[] | null;
}

export interface ActuatorRuleApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: ActuatorRule | null;
}

export interface RuleSensorsApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: RuleSensor[] | null;
}

export interface ActuatorSchedule {
    id: number;
    name: string;
    cronExpression: string;
    durationSeconds: number;
    isEnabled: boolean;
}

export interface CreateActuatorSchedulePayload {
    name: string;
    cronExpression: string;
    durationSeconds: number;
    isEnabled: boolean;
}

export interface UpdateActuatorSchedulePayload {
    name: string;
    cronExpression: string;
    durationSeconds: number;
    isEnabled: boolean;
}

export interface ActuatorSchedulesApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: ActuatorSchedule[] | null;
}

export interface ActuatorScheduleApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: ActuatorSchedule | null;
}

export interface ActuatorModePeriod {
    mode: string;
    from: string;
    to: string | null;
    setBy: string | null;
}

export interface RulePeriodCondition {
    sensorId: number;
    sensorName: string;
    deviceName: string;
    operator: string;
    threshold: number;
}

export interface ActuatorRulePeriod {
    ruleId: number;
    name: string;
    matchType: string;
    targetState: boolean;
    isEnabled: boolean;
    conditions: RulePeriodCondition[];
    from: string;
    to: string | null;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
}

export interface ActuatorSchedulePeriod {
    scheduleId: number;
    name: string;
    cronExpression: string;
    durationSeconds: number;
    isEnabled: boolean;
    from: string;
    to: string | null;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
}

export interface ActuatorOverrideEvent {
    at: string;
    kind: "Set" | "Removed" | "Expired" | string;
    by: string | null;
    state: boolean;
    expiresAt: string | null;
}

export interface ActuatorHistory {
    modes: ActuatorModePeriod[];
    rules: ActuatorRulePeriod[];
    schedules: ActuatorSchedulePeriod[];
    overrideEvents: ActuatorOverrideEvent[];
}

export interface ActuatorHistoryApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: ActuatorHistory | null;
}

export interface ActuatorStateEvent {
    time: string;
    status: number; // 1 = ON, 0 = OFF
    mode: string;
}

export interface ActuatorStateHistory {
    events: ActuatorStateEvent[];
}

export interface ActuatorStateHistoryApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: ActuatorStateHistory | null;
}








