import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/api/api-config";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

// POST /api/zones/{zoneId}/blocks → POST {backend}/api/v1/zones/{zoneId}/blocks
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ zoneId: string }> }
) {
    try {
        const { zoneId } = await params;
        const id = Number(zoneId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid zone ID", data: null },
                { status: 400 }
            );
        }

        const accessToken = await getToken();
        if (!accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: null },
                { status: 401 }
            );
        }

        const body = await request.json();
        const name = String(body.name || "").trim().slice(0, 64);

        if (!name) {
            return NextResponse.json(
                { success: false, errorMessage: "Block name is required", data: null },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/zones/${id}/blocks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from block service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Create Zone Block API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to create block",
                data: null,
            },
            { status: 500 }
        );
    }
}
