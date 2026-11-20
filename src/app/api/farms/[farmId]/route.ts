import { NextRequest, NextResponse } from "next/server";
import { farmService } from "@/features/farms/services/farm-service";
import { cookies } from "next/headers";
import type { UpdateFarmPayload } from "@/features/farms/types/farm.types";

// GET /api/farms/{farmId}
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ farmId: string }> }
) {
    try {
        const { farmId } = await params;
        const id = Number(farmId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Invalid farm ID",
                    data: null,
                },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const accessToken = cookieStore.get("aigrow_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Unauthorized. Please log in.",
                    data: null,
                },
                { status: 401 }
            );
        }

        const result = await farmService.getFarmById(
            id,
            accessToken
        );

        return NextResponse.json(result);

    } catch (error) {
        console.error("Get Farm By ID API Error:", error);

        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error
                        ? error.message === "fetch failed"
                            ? "Unable to connect to backend server (172.16.20.58:81). Please ensure you are connected to the network or VPN."
                            : error.message
                        : "Failed to retrieve farm details",
                data: null,
            },
            { status: 500 }
        );
    }
}

// PUT /api/farms/{farmId}
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ farmId: string }> }
) {
    try {
        const { farmId } = await params;
        const id = Number(farmId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Invalid farm ID",
                    data: null,
                },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const accessToken = cookieStore.get("aigrow_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Unauthorized. Please log in.",
                    data: null,
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate payload according to Swagger specification:
        // name: string <= 64 chars
        // utcOffset: string (e.g. "+05:30")
        // address: string <= 500 chars
        // sizeAcre: number > 0 with at most 3 decimals
        // latitude: number -90 to 90
        // longitude: number -180 to 180
        // Extract and support timeZone, utcOffset, and timeZoneId to satisfy backend validation
        const tz = String(body.timeZone || body.utcOffset || body.timeZoneId || "+05:30").trim();
        const payload: UpdateFarmPayload = {
            name: String(body.name || "").trim().slice(0, 64),
            timeZone: tz,
            timeZoneId: String(body.timeZoneId || tz).trim(),
            utcOffset: String(body.utcOffset || tz).trim(),
            address: String(body.address || "").trim().slice(0, 500),
            sizeAcre: Math.round(Number(body.sizeAcre) * 1000) / 1000,
            latitude: Math.round(Number(body.latitude) * 1000000) / 1000000,
            longitude: Math.round(Number(body.longitude) * 1000000) / 1000000,
        };

        const result = await farmService.updateFarm(
            id,
            payload,
            accessToken
        );

        return NextResponse.json(result);

    } catch (error) {
        console.error("Update Farm API Error:", error);

        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error
                        ? error.message === "fetch failed"
                            ? "Unable to connect to backend server (172.16.20.58:81). Please ensure you are connected to the network or VPN."
                            : error.message
                        : "Failed to update farm details",
                data: null,
            },
            { status: 500 }
        );
    }
}
