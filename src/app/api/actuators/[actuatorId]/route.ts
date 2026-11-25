import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// PUT /api/actuators/[actuatorId] -> PUT {BACKEND_URL}/api/v1/actuators/{actuatorId}
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ actuatorId: string }> }
) {
    try {
        const { actuatorId } = await params;
        const id = Number(actuatorId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid actuator ID.", data: null },
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
                { success: false, errorMessage: "Actuator name is required.", data: null },
                { status: 400 }
            );
        }

        const trimmedName = name.trim();
        if (trimmedName.length > 64) {
            return NextResponse.json(
                { success: false, errorMessage: "Actuator name cannot exceed 64 characters.", data: null },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/actuators/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: trimmedName }),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from actuators service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Rename Actuator API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to rename actuator",
                data: null,
            },
            { status: 500 }
        );
    }
}
