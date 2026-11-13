export interface Farm {
    id: number;
    name: string;
    timeZoneId: string;
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