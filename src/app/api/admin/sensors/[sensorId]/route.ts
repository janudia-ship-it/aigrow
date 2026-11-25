import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// DELETE /api/admin/sensors/[sensorId] -> DELETE {BACKEND_URL}/api/v1/admin/sensors/{sensorId}
export async function DELETE(
    _request: NextRequest,
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

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/sensors/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from backend",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error: any) {
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage: error?.message || "Internal server error deleting sensor",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
