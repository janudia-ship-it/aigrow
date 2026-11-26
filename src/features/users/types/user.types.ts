export interface UserDetails {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    country: string | null;
    address: string | null;
    role: string;
    profilePictureUrl: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt: string | null;
}

export interface PagedUsers {
    items: UserDetails[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PagedUsersApiResponse {
    errorCode: number;
    errorMessage: string | null;
    success: boolean;
    message: string | null;
    data: PagedUsers | null;
}

// Backwards compatibility alias
export type AdminUser = UserDetails;
