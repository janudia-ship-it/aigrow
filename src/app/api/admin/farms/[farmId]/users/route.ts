import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/api/api-config";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

// POST /api/admin/farms/{farmId}/users  → POST {backend}/api/v1/admin/farms/{farmId}/users
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

        const accessToken = await getToken();
        if (!accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: null },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/farms/${id}/users`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from farm members service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Add Farm Member API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to add farm member",
                data: null,
            },
            { status: 500 }
        );
    }
}
