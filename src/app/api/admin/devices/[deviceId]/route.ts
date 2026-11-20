import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// PUT /api/admin/devices/[deviceId] → PUT {backend}/api/v1/admin/devices/{deviceId}
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: null },
                { status: 401 }
            );
        }

        const role = session.user?.role?.toLowerCase();
        if (role !== "admin" && role !== "superadmin") {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Forbidden. Only Admin or SuperAdmin can update devices.",
                    data: null,
                },
                { status: 403 }
            );
        }

        const { deviceId } = await params;
        const id = Number(deviceId);
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid device ID.", data: null },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { name, macAddress, isShared, mqttIntervalSeconds } = body;

        // Validation
        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { success: false, errorMessage: "Device name is required.", data: null },
                { status: 400 }
            );
        }

        if (!macAddress || typeof macAddress !== "string") {
            return NextResponse.json(
                { success: false, errorMessage: "MAC address is required.", data: null },
                { status: 400 }
            );
        }

        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(macAddress.trim())) {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Invalid MAC address format. Expected: AA:BB:CC:DD:EE:FF",
                    data: null,
                },
                { status: 400 }
            );
        }

        const interval = Number(mqttIntervalSeconds);
        if (!Number.isInteger(interval) || interval < 1 || interval > 300) {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "MQTT interval must be between 1 and 300 seconds.",
                    data: null,
                },
                { status: 400 }
            );
        }

        const formattedMac = macAddress.trim().replace(/-/g, ":").toUpperCase();

        const payload = {
            name: name.trim().slice(0, 64),
            macAddress: formattedMac,
            isShared: typeof isShared === "boolean" ? isShared : false,
            mqttIntervalSeconds: interval,
        };

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/devices/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from device service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Update Device API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to update device",
                data: null,
            },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/devices/[deviceId] → DELETE {backend}/api/v1/admin/devices/{deviceId}
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: null },
                { status: 401 }
            );
        }

        const role = session.user?.role?.toLowerCase();
        if (role !== "admin" && role !== "superadmin") {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Forbidden. Only Admin or SuperAdmin can delete devices.",
                    data: null,
                },
                { status: 403 }
            );
        }

        const { deviceId } = await params;
        const id = Number(deviceId);
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid device ID.", data: null },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/devices/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from device service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Delete Device API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to delete device",
                data: null,
            },
            { status: 500 }
        );
    }
}
