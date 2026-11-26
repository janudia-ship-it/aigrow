import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// GET /api/users -> GET {BACKEND_URL}/api/v1/users
export async function GET(request: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                { errorCode: 401, errorMessage: "Unauthorized. Please log in.", success: false, message: null, data: null },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const query = new URLSearchParams();

        const page = searchParams.get("page");
        const pageSize = searchParams.get("pageSize");
        const search = searchParams.get("search");
        const role = searchParams.get("role");
        const isActive = searchParams.get("isActive");
        const isEmailVerified = searchParams.get("isEmailVerified");

        if (page) query.set("page", page);
        if (pageSize) query.set("pageSize", pageSize);
        if (search) query.set("search", search);
        if (role) query.set("role", role);
        if (isActive !== null && isActive !== undefined && isActive !== "") {
            query.set("isActive", isActive);
        }
        if (isEmailVerified !== null && isEmailVerified !== undefined && isEmailVerified !== "") {
            query.set("isEmailVerified", isEmailVerified);
        }

        const qs = query.toString();
        const url = `${BACKEND_URL}/api/v1/users${qs ? `?${qs}` : ""}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from users service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Get All Users API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to fetch users",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
