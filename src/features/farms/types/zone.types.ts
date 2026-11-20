import { DeviceSummary } from "@/features/devices/types/device";

export const ZONE_TYPES = [
    { label: "Greenhouse", value: "Greenhouse" },
    { label: "Net House", value: "NetHouse" },
    { label: "Open Field", value: "OpenField" },
    { label: "Nursery", value: "Nursery" },
    { label: "Shade House", value: "ShadeHouse" },
    { label: "Hydroponic Area", value: "HydroponicArea" },
    { label: "Vertical Farming Area", value: "VerticalFarmingArea" },
    { label: "Tunnel", value: "Tunnel" },
] as const;

export type ZoneType = typeof ZONE_TYPES[number]["value"];

export interface Block {
    id: number;
    name: string;
    devices: import("@/features/devices/types/device").DeviceSummary[] | null;
}

export interface Zone {
    id: number;
    name: string;
    zoneType: string;
    isOpenField: boolean;
    blocks: Block[];
    devices: import("@/features/devices/types/device").DeviceSummary[] | null;
}

export interface ZonesApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: Zone[];
}

export interface CreateZonePayload {
    name: string;
    zoneType: string;
}

export interface CreateZoneResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: { id: number } | null;
}

export interface UpdateZonePayload {
    name: string;
    zoneType: string;
}

export interface ZoneApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: null;
}

export interface CreateBlockPayload {
    name: string;
}

export interface CreateBlockResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: { id: number } | null;
}

export interface UpdateBlockPayload {
    name: string;
}

export interface BlockApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: null;
}
