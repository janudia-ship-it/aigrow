import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// PUT /api/actuators/[actuatorId]/mode -> PUT {BACKEND_URL}/api/v1/actuators/{actuatorId}/mode
export async function PUT(
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

        const body = await request.json().catch(() => ({}));
        const { mode } = body;

        if (!mode || typeof mode !== "string" || !mode.trim()) {
            return NextResponse.json(
                { errorCode: 1000, errorMessage: "Mode is required.", success: false, message: null, data: null },
                { status: 400 }
            );
        }

        const trimmedMode = mode.trim();
        const validModes = ["off", "on", "auto", "schedule"];
        if (!validModes.includes(trimmedMode.toLowerCase())) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Invalid mode. Supported modes are 'Off', 'On', 'Auto', or 'Schedule'.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

        // Normalize casing to standard title-case (Off, On, Auto, Schedule)
        const normalizedMode =
            trimmedMode.charAt(0).toUpperCase() + trimmedMode.slice(1).toLowerCase();

        const response = await fetch(`${BACKEND_URL}/api/v1/actuators/${id}/mode`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ mode: normalizedMode }),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from actuator service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Set Actuator Mode API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to set actuator mode",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
