import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// PUT /api/sensors/[sensorId] -> PUT {BACKEND_URL}/api/v1/sensors/{sensorId}
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sensorId: string }> }
) {
    try {
        const { sensorId } = await params;
        const id = Number(sensorId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid sensor ID.", data: null },
                { status: 400 }
            );
        }

        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: null },
                { status: 401 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { name } = body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { success: false, errorMessage: "Sensor name is required.", data: null },
                { status: 400 }
            );
        }

        const trimmedName = name.trim();
        if (trimmedName.length > 64) {
            return NextResponse.json(
                { success: false, errorMessage: "Sensor name cannot exceed 64 characters.", data: null },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/sensors/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: trimmedName }),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from sensors service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Rename Sensor API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to rename sensor",
                data: null,
            },
            { status: 500 }
        );
    }
}
