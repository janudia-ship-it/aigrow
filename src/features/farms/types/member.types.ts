export interface FarmMemberPermissions {
    farm: "None" | "View" | "Manage" | string;
    device: "None" | "View" | "Manage" | string;
}

export interface FarmMember {
    userId: number;
    fullName: string;
    userName: string;
    role?: string;
    profilePictureUrl: string | null;
    permissions: FarmMemberPermissions;
}

export interface FarmMembersApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: FarmMember[];
}

export interface AddMemberPayload {
    userId: number;
    permissions: FarmMemberPermissions;
}

export interface UpdateMemberPayload {
    permissions: FarmMemberPermissions;
}

export interface MemberApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: null;
}

// User lookup
export interface UserLookupItem {
    id: number;
    fullName: string;
    userName: string;
    email: string;
    profilePictureUrl: string | null;
}

export interface UserLookupApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: UserLookupItem[];
}

