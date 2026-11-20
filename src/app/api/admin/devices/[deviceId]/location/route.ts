import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// PUT /api/admin/devices/[deviceId]/location → PUT {backend}/api/v1/admin/devices/{deviceId}/location
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
                    errorMessage: "Forbidden. Only Admin or SuperAdmin can move devices.",
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

        const body = await request.json().catch(() => ({}));
        const { farmId, zoneId, blockId } = body;

        // Validation: farmId is required and must be an integer > 0
        const parsedFarmId = Number(farmId);
        if (!Number.isInteger(parsedFarmId) || parsedFarmId <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Target farm ID is required.", data: null },
                { status: 400 }
            );
        }

        const parsedZoneId = zoneId === null || zoneId === undefined || zoneId === ""
            ? null
            : Number(zoneId);

        const parsedBlockId = blockId === null || blockId === undefined || blockId === ""
            ? null
            : Number(blockId);

        if (parsedZoneId !== null && (!Number.isInteger(parsedZoneId) || parsedZoneId <= 0)) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid zone ID.", data: null },
                { status: 400 }
            );
        }

        if (parsedBlockId !== null && (!Number.isInteger(parsedBlockId) || parsedBlockId <= 0)) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid block ID.", data: null },
                { status: 400 }
            );
        }

        if (parsedBlockId !== null && parsedZoneId === null) {
            return NextResponse.json(
                { success: false, errorMessage: "A zone must be selected if a block is specified.", data: null },
                { status: 400 }
            );
        }

        const payload = {
            farmId: parsedFarmId,
            zoneId: parsedZoneId,
            blockId: parsedBlockId,
        };

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/devices/${id}/location`, {
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
        console.error("Move Device Location API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to move device",
                data: null,
            },
            { status: 500 }
        );
    }
}
