import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/api/api-config";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";

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

        const response = await fetch(`${BACKEND_URL}/api/v1/farms/${id}/users`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const result = await response.json().catch(() => ({
            success: false,
            errorMessage: "Invalid response from farm members service",
            data: [],
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Get Farm Users API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server. Please check your network or VPN."
                        : "Failed to retrieve farm members",
                data: [],
            },
            { status: 500 }
        );
    }
}

