export interface Farm {
    id: number;
    name: string;
    utcOffset?: string;
    timeZoneId?: string;
    address: string;
    sizeAcre: number;
    latitude: number | null;
    longitude: number | null;
}

export interface FarmResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: Farm[];
}
export interface FarmWeather {
    source: string;
    deviceId: number | null;
    fetchedAt: string | null;
    temperature: number | null;
    humidity: number | null;
    windSpeed: number | null;
    windDirection: number | null;
    rainLastHour: number | null;
    conditionId: number | null;
    description: string | null;
    icon: string | null;
}

export interface DeviceSummary {
    id: number;
    name: string;
    deviceType: string;
    lastSeenAt: string | null;
    status: string;
}

export interface FarmDetails extends Farm {
    weather: FarmWeather[];
    devices: DeviceSummary[] | null;
}

export interface FarmDetailsApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: FarmDetails;
}

export interface UpdateFarmPayload {
    name: string;
    timeZone?: string;
    timeZoneId?: string;
    utcOffset?: string;
    address: string;
    sizeAcre: number;
    latitude: number;
    longitude: number;
}

export interface UpdateFarmApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: null;
}

export interface PagedFarms {
    items: Farm[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PagedFarmsApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: PagedFarms | null;
}

export interface CreateFarmPayload {
    name: string;
    utcOffset: string;
    address: string;
    sizeAcre: number;
    latitude: number | null;
    longitude: number | null;
}

export interface CreateFarmApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: { id: number } | Farm | null;
}