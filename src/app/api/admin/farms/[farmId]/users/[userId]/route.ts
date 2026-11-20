import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/api/api-config";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

// PUT /api/admin/farms/{farmId}/users/{userId}
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ farmId: string; userId: string }> }
) {
    try {
        const { farmId, userId } = await params;
        const fId = Number(farmId);
        const uId = Number(userId);

        if (!Number.isInteger(fId) || fId <= 0 || !Number.isInteger(uId) || uId <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid ID", data: null },
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

        const response = await fetch(
            `${BACKEND_URL}/api/v1/admin/farms/${fId}/users/${uId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Update Farm Member API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to update farm member",
                data: null,
            },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/farms/{farmId}/users/{userId}
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ farmId: string; userId: string }> }
) {
    try {
        const { farmId, userId } = await params;
        const fId = Number(farmId);
        const uId = Number(userId);

        if (!Number.isInteger(fId) || fId <= 0 || !Number.isInteger(uId) || uId <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Invalid ID", data: null },
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

        const response = await fetch(
            `${BACKEND_URL}/api/v1/admin/farms/${fId}/users/${uId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Delete Farm Member API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to remove farm member",
                data: null,
            },
            { status: 500 }
        );
    }
}
