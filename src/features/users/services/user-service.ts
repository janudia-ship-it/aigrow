import type { PagedUsers, PagedUsersApiResponse } from "../types/user.types";

export interface GetUsersParams {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
}

export async function getAllUsers(params: GetUsersParams = {}): Promise<PagedUsers> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
    if (params.search && params.search.trim()) {
        query.set("search", params.search.trim().slice(0, 100));
    }
    if (params.role && params.role.trim()) {
        query.set("role", params.role.trim());
    }
    if (params.isActive !== undefined) {
        query.set("isActive", String(params.isActive));
    }
    if (params.isEmailVerified !== undefined) {
        query.set("isEmailVerified", String(params.isEmailVerified));
    }

    const qs = query.toString();
    const url = qs ? `/api/users?${qs}` : "/api/users";

    const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
    });

    const result: PagedUsersApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to fetch users",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success || !result.data) {
        if (result.errorCode === 2002 || response.status === 403) {
            throw new Error("Forbidden. Only SuperAdmin can view all users.");
        }
        throw new Error(result.errorMessage || "Unable to retrieve users");
    }

    return result.data;
}
