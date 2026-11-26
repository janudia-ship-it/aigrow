import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// POST /api/actuators/[actuatorId]/override -> POST {BACKEND_URL}/api/v1/actuators/{actuatorId}/override
export async function POST(
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
        const { state, expiresAt } = body;

        if (typeof state !== "boolean") {
            return NextResponse.json(
                { errorCode: 1000, errorMessage: "State (boolean) is required.", success: false, message: null, data: null },
                { status: 400 }
            );
        }

        let formattedExpiresAt: string | null = null;
        if (expiresAt !== null && expiresAt !== undefined) {
            if (typeof expiresAt !== "string" || !expiresAt.trim()) {
                return NextResponse.json(
                    {
                        errorCode: 1000,
                        errorMessage: "Invalid expiration format. Expected UTC ISO string or null.",
                        success: false,
                        message: null,
                        data: null,
                    },
                    { status: 400 }
                );
            }

            const parsedDate = new Date(expiresAt.trim());
            if (isNaN(parsedDate.getTime())) {
                return NextResponse.json(
                    {
                        errorCode: 1000,
                        errorMessage: "Invalid expiration datetime format.",
                        success: false,
                        message: null,
                        data: null,
                    },
                    { status: 400 }
                );
            }

            // Must end in Z (UTC ISO string)
            formattedExpiresAt = parsedDate.toISOString();
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/actuators/${id}/override`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                state: Boolean(state),
                expiresAt: formattedExpiresAt,
            }),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from actuator override service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Set Actuator Override API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to set actuator override",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}

// DELETE /api/actuators/[actuatorId]/override -> DELETE {BACKEND_URL}/api/v1/actuators/{actuatorId}/override
export async function DELETE(
    _request: NextRequest,
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

        const response = await fetch(`${BACKEND_URL}/api/v1/actuators/${id}/override`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from actuator override service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Clear Actuator Override API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to clear actuator override",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
