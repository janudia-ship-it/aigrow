import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// GET /api/actuators/[actuatorId]/state-history -> GET {BACKEND_URL}/api/v1/actuators/{actuatorId}/state-history
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ actuatorId: string }> }
) {
    try {
        const { actuatorId } = await params;
        const id = Number(actuatorId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { errorCode: 1000, errorMessage: "Invalid actuator ID.", success: false, message: null, data: null },
                { status: 400 }
            );
        }

        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                { errorCode: 401, errorMessage: "Unauthorized. Please log in.", success: false, message: null, data: null },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const from = searchParams.get("from") || searchParams.get("From");
        const to = searchParams.get("to") || searchParams.get("To");

        if (!from || !to) {
            return NextResponse.json(
                { errorCode: 1000, errorMessage: "from and to datetime query parameters are required.", success: false, message: null, data: null },
                { status: 400 }
            );
        }

        const query = new URLSearchParams({
            from: from,
            to: to,
        });

        const response = await fetch(`${BACKEND_URL}/api/v1/actuators/${id}/state-history?${query.toString()}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from actuator state history service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Get Actuator State History API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to fetch actuator state history",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
