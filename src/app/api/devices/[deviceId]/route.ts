import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// GET /api/devices/[deviceId] -> GET {BACKEND_URL}/api/v1/devices/{deviceId}
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await params;
        const id = Number(deviceId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid device ID.", data: null },
                { status: 400 }
            );
        }

        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: null },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/devices/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
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
        console.error("Get Device By ID API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to retrieve device details",
                data: null,
            },
            { status: 500 }
        );
    }
}

// PUT /api/devices/[deviceId] -> PUT {BACKEND_URL}/api/v1/devices/{deviceId}
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await params;
        const id = Number(deviceId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid device ID.", data: null },
                { status: 400 }
            );
        }

        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: null },
                { status: 401 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { name } = body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { success: false, errorMessage: "Device name is required.", data: null },
                { status: 400 }
            );
        }

        const trimmedName = name.trim();
        if (trimmedName.length > 64) {
            return NextResponse.json(
                { success: false, errorMessage: "Device name cannot exceed 64 characters.", data: null },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/devices/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: trimmedName }),
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
        console.error("Rename Device API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to rename device",
                data: null,
            },
            { status: 500 }
        );
    }
}
