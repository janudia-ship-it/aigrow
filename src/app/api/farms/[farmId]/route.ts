import { NextRequest, NextResponse } from "next/server";
import {
    getAuthSession,
    clearAuthSession,
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    USER_PROFILE_COOKIE,
} from "@/lib/auth/session";
import { farmService } from "@/features/farms/services/farm-service";
import { ApiError } from "@/lib/api/api-error";
import { cookies } from "next/headers";


// GET /api/farms/{farmId}
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ farmId: string }> }
) {
    try {
        // Get farmId from dynamic route
        const { farmId } = await params;
        const id = Number(farmId);

        // Validate farmId
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Invalid farm ID",
                    data: null,
                },
                { status: 400 }
            );
        }

        // Retrieve access token from cookie
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("aigrow_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Unauthorized. Please log in.",
                    data: null,
                },
                { status: 401 }
            );
        }

        // Call Get Farm By ID service
        const result = await farmService.getFarmById(
            id,
            accessToken
        );

        return NextResponse.json(result);

    } catch (error) {
        console.error("Get Farm By ID API Error:", error);

        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "Failed to retrieve farm details",
                data: null,
            },
            { status: 500 }
        );
    }
}
