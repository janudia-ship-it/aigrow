
import { BACKEND_URL } from "@/lib/api/api-config";
import { ApiError } from "@/lib/api/api-error";
import type { FarmResponse, FarmDetailsApiResponse } from "../types/farm.types";


export const farmService = {
    getMyFarms: async (accessToken: string): Promise<FarmResponse> => {
        const response = await fetch(`${BACKEND_URL}/api/v1/farms`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const result: FarmResponse = await response.json().catch(() => ({
            success: false,
            errorCode: response.status === 401 ? 2008 : 500,
            errorMessage: "Unable to retrieve farms",
            data: [],
        }));

        if (!response.ok || !result.success) {
            throw new ApiError(
                result.errorMessage || "Unable to retrieve farms",
                result.errorCode || (response.status === 401 ? 2008 : 0),
                response.status
            );
        }

        return result;
    },
    getFarmById: async (
        farmId: number,
        accessToken: string
    ): Promise<FarmDetailsApiResponse> => {
        const response = await fetch(`${BACKEND_URL}/api/v1/farms/${farmId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const result: FarmDetailsApiResponse = await response.json();

        if (!response.ok || !result.success) {
            throw new ApiError(
                result.errorMessage || "Unable to retrieve farm details",
                result.errorCode || (response.status === 401 ? 2008 : 0),
                response.status
            );
        }

        return result;
    },


};
