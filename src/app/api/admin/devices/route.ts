import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// POST /api/admin/devices → POST {backend}/api/v1/admin/devices
export async function POST(request: NextRequest) {
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
                    errorMessage: "Forbidden. Only Admin or SuperAdmin can add devices.",
                    data: null,
                },
                { status: 403 }
            );
        }

        const accessToken = session.accessToken;

        const body = await request.json();
        const {
            deviceType,
            macAddress,
            name,
            farmId,
            zoneId,
            blockId,
            isShared,
            mqttIntervalSeconds,
        } = body;

        // Validation
        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { success: false, errorMessage: "Device name is required.", data: null },
                { status: 400 }
            );
        }

        if (!deviceType || typeof deviceType !== "string" || !deviceType.trim()) {
            return NextResponse.json(
                { success: false, errorMessage: "Device type is required.", data: null },
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
                    errorMessage: "Invalid MAC address format. Expected format: AA:BB:CC:DD:EE:FF",
                    data: null,
                },
                { status: 400 }
            );
        }

        // Format MAC to upper case with colons
        const formattedMac = macAddress.trim().replace(/-/g, ":").toUpperCase();

        const fId = Number(farmId);
        if (!Number.isInteger(fId) || fId <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Valid farm ID is required.", data: null },
                { status: 400 }
            );
        }

        const payload: Record<string, unknown> = {
            deviceType: deviceType.trim(),
            macAddress: formattedMac,
            name: name.trim().slice(0, 64),
            farmId: fId,
            zoneId: zoneId !== undefined && zoneId !== null && zoneId !== "" ? Number(zoneId) : null,
            blockId: blockId !== undefined && blockId !== null && blockId !== "" ? Number(blockId) : null,
            isShared: typeof isShared === "boolean" ? isShared : false,
            mqttIntervalSeconds:
                mqttIntervalSeconds !== undefined && mqttIntervalSeconds !== null && mqttIntervalSeconds !== ""
                    ? Number(mqttIntervalSeconds)
                    : 5,
        };

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/devices`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
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
        console.error("Create Device API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to create device",
                data: null,
            },
            { status: 500 }
        );
    }
}
