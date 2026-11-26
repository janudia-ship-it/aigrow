import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// PUT /api/actuators/[actuatorId]/schedules/[scheduleId] -> PUT {BACKEND_URL}/api/v1/actuators/{actuatorId}/schedules/{scheduleId}
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ actuatorId: string; scheduleId: string }> }
) {
    try {
        const { actuatorId, scheduleId } = await params;
        const aId = Number(actuatorId);
        const sId = Number(scheduleId);

        if (!Number.isInteger(aId) || aId <= 0 || !Number.isInteger(sId) || sId <= 0) {
            return NextResponse.json(
                { errorCode: 1000, errorMessage: "Invalid actuator ID or schedule ID.", success: false, message: null, data: null },
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

        const response = await fetch(`${BACKEND_URL}/api/v1/actuators/${aId}/schedules/${sId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from actuator schedule update service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Update Actuator Schedule API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to update actuator schedule",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}

// DELETE /api/actuators/[actuatorId]/schedules/[scheduleId] -> DELETE {BACKEND_URL}/api/v1/actuators/{actuatorId}/schedules/{scheduleId}
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ actuatorId: string; scheduleId: string }> }
) {
    try {
        const { actuatorId, scheduleId } = await params;
        const aId = Number(actuatorId);
        const sId = Number(scheduleId);

        if (!Number.isInteger(aId) || aId <= 0 || !Number.isInteger(sId) || sId <= 0) {
            return NextResponse.json(
                { errorCode: 1000, errorMessage: "Invalid actuator ID or schedule ID.", success: false, message: null, data: null },
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

        const response = await fetch(`${BACKEND_URL}/api/v1/actuators/${aId}/schedules/${sId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from actuator schedule deletion service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Delete Actuator Schedule API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to delete actuator schedule",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
