import { NextResponse } from "next/server";
import {
    getAuthSession,
    clearAuthSession,
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    USER_PROFILE_COOKIE,
} from "@/lib/auth/session";
import { farmService } from "@/features/farms/services/farm-service";
import { ApiError } from "@/lib/api/api-error";

export async function GET() {
    try {
        const { accessToken } = await getAuthSession();

        if (!accessToken) {
            return NextResponse.json(
                { success: false, sessionExpired: false, errorMessage: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        const data = await farmService.getMyFarms(accessToken);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching farms:", error);

        if (error instanceof ApiError && (error.status === 401 || error.errorCode === 2008)) {
            await clearAuthSession();
            const res = NextResponse.json(
                {
                    success: false,
                    sessionExpired: true,
                    errorCode: error.errorCode || 2008,
                    errorMessage: error.message,
                },
                { status: 401 }
            );
            res.cookies.delete(ACCESS_TOKEN_COOKIE);
            res.cookies.delete(REFRESH_TOKEN_COOKIE);
            res.cookies.delete(USER_PROFILE_COOKIE);
            return res;
        }

        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "Unable to connect to farm service. Please check your network.",
            },
            { status: 500 }
        );
    }
}