import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/api/api-config";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";

// GET /api/users/lookup?search=...  → GET {backend}/api/v1/users/lookup?search=...
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

        if (!accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: [] },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") ?? "";

        const url = new URL(`${BACKEND_URL}/api/v1/users/lookup`);
        if (search) url.searchParams.set("search", search);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const result = await response.json().catch(() => ({
            success: false,
            errorMessage: "Invalid response from user lookup service",
            data: [],
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("User Lookup API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to look up users",
                data: [],
            },
            { status: 500 }
        );
    }
}
