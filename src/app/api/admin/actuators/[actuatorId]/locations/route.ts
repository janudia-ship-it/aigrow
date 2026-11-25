import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// PUT /api/admin/actuators/[actuatorId]/locations -> PUT {BACKEND_URL}/api/v1/admin/actuators/{actuatorId}/locations
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
        const { areas } = body;

        if (!Array.isArray(areas)) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Areas array is required.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

        const formattedAreas = areas.map((area: any) => ({
            zoneId: area.zoneId !== null && area.zoneId !== undefined ? Number(area.zoneId) : null,
            blockId: area.blockId !== null && area.blockId !== undefined ? Number(area.blockId) : null,
        }));

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/actuators/${id}/locations`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ areas: formattedAreas }),
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
                errorMessage: error?.message || "Internal server error updating actuator locations",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
