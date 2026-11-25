import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// GET /api/actuators/types -> GET {BACKEND_URL}/api/v1/actuators/types
export async function GET(request: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                {
                    errorCode: 401,
                    errorMessage: "Unauthorized. Please log in.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const actuatorType = searchParams.get("actuatorType");
        const url = actuatorType
            ? `${BACKEND_URL}/api/v1/actuators/types?actuatorType=${encodeURIComponent(actuatorType)}`
            : `${BACKEND_URL}/api/v1/actuators/types`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from actuator types service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Get Actuator Types API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to retrieve actuator types",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
