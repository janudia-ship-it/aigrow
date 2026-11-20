import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/api/api-config";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

// PUT /api/blocks/{blockId} → PUT {backend}/api/v1/blocks/{blockId}
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ blockId: string }> }
) {
    try {
        const { blockId } = await params;
        const id = Number(blockId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid block ID", data: null },
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

        const response = await fetch(`${BACKEND_URL}/api/v1/blocks/${id}`, {
            method: "PUT",
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
        console.error("Update Block API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to update block",
                data: null,
            },
            { status: 500 }
        );
    }
}

// DELETE /api/blocks/{blockId} → DELETE {backend}/api/v1/blocks/{blockId}
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ blockId: string }> }
) {
    try {
        const { blockId } = await params;
        const id = Number(blockId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid block ID", data: null },
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

        const response = await fetch(`${BACKEND_URL}/api/v1/blocks/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
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
        console.error("Delete Block API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to delete block",
                data: null,
            },
            { status: 500 }
        );
    }
}
