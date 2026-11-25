import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// POST /api/admin/devices/[deviceId]/sensors -> POST {BACKEND_URL}/api/v1/admin/devices/{deviceId}/sensors
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await params;
        const id = Number(deviceId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Invalid device ID.",
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
        const { sensorType, name, busAddress, channelIndex } = body;

        if (!sensorType || typeof sensorType !== "string" || !sensorType.trim()) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Sensor type is required.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Sensor name is required.",
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
                    errorMessage: "Sensor name cannot exceed 64 characters.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

        const bus = Number(busAddress);
        if (!Number.isInteger(bus) || bus < 1 || bus > 247) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Bus address must be an integer between 1 and 247.",
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

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/devices/${id}/sensors`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sensorType: sensorType.trim(),
                name: trimmedName,
                busAddress: bus,
                channelIndex: channel,
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
                errorMessage: error?.message || "Internal server error creating sensor",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
