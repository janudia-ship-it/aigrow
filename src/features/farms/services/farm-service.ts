import { BACKEND_URL } from "@/lib/api/api-config";
import { ApiError } from "@/lib/api/api-error";
import type {
    FarmResponse,
    FarmDetailsApiResponse,
    UpdateFarmPayload,
    UpdateFarmApiResponse,
    PagedFarms,
    PagedFarmsApiResponse,
    CreateFarmPayload,
    CreateFarmApiResponse,
} from "../types/farm.types";

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

    updateFarm: async (
        farmId: number,
        payload: UpdateFarmPayload,
        accessToken: string
    ): Promise<UpdateFarmApiResponse> => {
        const response = await fetch(`${BACKEND_URL}/api/v1/farms/${farmId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result: UpdateFarmApiResponse = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Failed to update farm",
            success: false,
            message: null,
            data: null,
        }));

        if (!response.ok || !result.success) {
            throw new ApiError(
                result.errorMessage || "Unable to update farm details",
                result.errorCode || (response.status === 401 ? 2008 : 0),
                response.status
            );
        }

        return result;
    },
};

export async function updateFarmClient(
    farmId: number,
    payload: UpdateFarmPayload
): Promise<UpdateFarmApiResponse> {
    const response = await fetch(`/api/farms/${farmId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result: UpdateFarmApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to update farm",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        throw new Error(result.errorMessage || "Unable to update farm");
    }

    return result;
}

export async function getAllFarmsClient(params: {
    page?: number;
    pageSize?: number;
    search?: string;
} = {}): Promise<PagedFarms> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.search && params.search.trim()) {
        query.set("search", params.search.trim().slice(0, 100));
    }

    const qs = query.toString();
    const url = qs ? `/api/admin/farms?${qs}` : "/api/admin/farms";

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const result: PagedFarmsApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to fetch all farms",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success || !result.data) {
        if (result.errorCode === 2002 || response.status === 403) {
            throw new Error("Forbidden. Only Admin or SuperAdmin can view all farms.");
        }
        throw new Error(result.errorMessage || "Unable to retrieve all farms");
    }

    return result.data;
}

export async function createFarmClient(
    payload: CreateFarmPayload
): Promise<CreateFarmApiResponse> {
    const response = await fetch("/api/admin/farms", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result: CreateFarmApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to create farm",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        throw new Error(result.errorMessage || "Unable to create farm");
    }

    return result;
}

export async function deleteFarmClient(farmId: number): Promise<void> {
    const response = await fetch(`/api/admin/farms/${farmId}`, {
        method: "DELETE",
    });

    const result = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to delete farm",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3200) {
            throw new Error("Farm not found.");
        }
        if (result.errorCode === 2002 || response.status === 403) {
            throw new Error("Forbidden. Only Admin or SuperAdmin can delete farms.");
        }
        throw new Error(result.errorMessage || "Unable to delete farm");
    }
}
