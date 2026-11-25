import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// GET /api/sensors/[sensorId]/readings?from=...&to=...
// Proxies to: GET {BACKEND_URL}/api/v1/sensors/{sensorId}/readings?from=...&to=...
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sensorId: string }> }
) {
    try {
        const { sensorId } = await params;
        const id = Number(sensorId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Invalid sensor ID.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

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

        const { searchParams } = request.nextUrl;
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (!from || !to) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Query parameters 'from' and 'to' are required in local datetime format (e.g. 2026-11-15T00:00:00).",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

        const targetUrl = new URL(`${BACKEND_URL}/api/v1/sensors/${id}/readings`);
        targetUrl.searchParams.set("from", from);
        targetUrl.searchParams.set("to", to);

        const response = await fetch(targetUrl.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from sensors service.",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error: any) {
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage: error?.message || "Internal server error fetching sensor readings.",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
