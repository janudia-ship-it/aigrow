import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// PUT /api/admin/actuators/[actuatorId] -> PUT {BACKEND_URL}/api/v1/admin/actuators/{actuatorId}
// DELETE /api/admin/actuators/[actuatorId] -> DELETE {BACKEND_URL}/api/v1/admin/actuators/{actuatorId}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ actuatorId: string }> }
) {
    try {
        const { actuatorId } = await params;
        const id = Number(actuatorId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Invalid actuator ID.",
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

        const body = await request.json().catch(() => ({}));
        const { name, channelIndex, isRemoteEnabled } = body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Actuator name is required.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

        const trimmedName = name.trim();
        if (trimmedName.length > 64) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Actuator name cannot exceed 64 characters.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

        const channel = Number(channelIndex);
        if (!Number.isInteger(channel) || channel < 0 || channel > 255) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Channel index must be an integer between 0 and 255.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/actuators/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: trimmedName,
                channelIndex: channel,
                isRemoteEnabled: Boolean(isRemoteEnabled),
            }),
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
                errorMessage: error?.message || "Internal server error updating actuator",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ actuatorId: string }> }
) {
    try {
        const { actuatorId } = await params;
        const id = Number(actuatorId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Invalid actuator ID.",
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

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/actuators/${id}`, {
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
                errorMessage: error?.message || "Internal server error deleting actuator",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
