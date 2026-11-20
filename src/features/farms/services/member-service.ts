import type {
    FarmMember,
    FarmMembersApiResponse,
    AddMemberPayload,
    UpdateMemberPayload,
    MemberApiResponse,
    UserLookupItem,
    UserLookupApiResponse,
} from "../types/member.types";

export async function getFarmMembers(farmId: number): Promise<FarmMember[]> {
    const response = await fetch(`/api/farms/${farmId}/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const result: FarmMembersApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to fetch farm members",
        success: false,
        message: null,
        data: [],
    }));

    if (!response.ok || !result.success) {
        throw new Error(result.errorMessage || "Unable to retrieve members");
    }

    return result.data || [];
}

export async function addFarmMember(
    farmId: number,
    payload: AddMemberPayload
): Promise<void> {
    const response = await fetch(`/api/admin/farms/${farmId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: MemberApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to add member",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3200) throw new Error("Farm not found.");
        if (result.errorCode === 3100) throw new Error("User not found.");
        if (result.errorCode === 4009) throw new Error("This user is already a member of the farm.");
        if (result.errorCode === 4010) throw new Error("User is not eligible (inactive or email not verified).");
        throw new Error(result.errorMessage || "Unable to add member");
    }
}

export async function updateFarmMember(
    farmId: number,
    userId: number,
    payload: UpdateMemberPayload
): Promise<void> {
    const response = await fetch(`/api/admin/farms/${farmId}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const result: MemberApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to update member",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3200) throw new Error("Farm not found.");
        if (result.errorCode === 3203) throw new Error("Farm member not found.");
        throw new Error(result.errorMessage || "Unable to update member");
    }
}

export async function removeFarmMember(
    farmId: number,
    userId: number
): Promise<void> {
    const response = await fetch(`/api/admin/farms/${farmId}/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    const result: MemberApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to remove member",
        success: false,
        message: null,
        data: null,
    }));

    if (!response.ok || !result.success) {
        if (result.errorCode === 3200) throw new Error("Farm not found.");
        if (result.errorCode === 3203) throw new Error("Farm member not found.");
        throw new Error(result.errorMessage || "Unable to remove member");
    }
}

export async function lookupUsers(search: string): Promise<UserLookupItem[]> {
    const params = new URLSearchParams({ search });
    const response = await fetch(`/api/users/lookup?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
    });

    const result: UserLookupApiResponse = await response.json().catch(() => ({
        errorCode: 500,
        errorMessage: "Failed to look up users",
        success: false,
        message: null,
        data: [],
    }));

    if (!response.ok || !result.success) {
        throw new Error(result.errorMessage || "Unable to look up users");
    }

    return result.data || [];
}

