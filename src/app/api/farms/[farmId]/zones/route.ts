import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/api/api-config";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";

// GET /api/farms/{farmId}/zones
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ farmId: string }> }
) {
    try {
        const { farmId } = await params;
        const id = Number(farmId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid farm ID", data: [] },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

        if (!accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: [] },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/farms/${id}/zones`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const result = await response.json().catch(() => ({
            success: false,
            errorMessage: "Invalid response from zones service",
            data: [],
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Get Farm Zones API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server. Please check your network or VPN."
                        : "Failed to retrieve farm zones",
                data: [],
            },
            { status: 500 }
        );
    }
}

// POST /api/farms/{farmId}/zones
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ farmId: string }> }
) {
    try {
        const { farmId } = await params;
        const id = Number(farmId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid farm ID", data: null },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

        if (!accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: null },
                { status: 401 }
            );
        }

        const body = await request.json();
        const name = String(body.name || "").trim().slice(0, 64);
        const zoneType = String(body.zoneType || "").trim();

        if (!name) {
            return NextResponse.json(
                { success: false, errorMessage: "Zone name is required", data: null },
                { status: 400 }
            );
        }

        if (!zoneType) {
            return NextResponse.json(
                { success: false, errorMessage: "Zone type is required", data: null },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/farms/${id}/zones`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, zoneType }),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Failed to create zone",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Create Farm Zone API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server. Please check your network or VPN."
                        : "Failed to create zone",
                data: null,
            },
            { status: 500 }
        );
    }
}
