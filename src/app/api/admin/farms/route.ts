import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// GET /api/admin/farms -> GET {BACKEND_URL}/api/v1/admin/farms
export async function GET(request: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                {
                    errorCode: 401,
                    errorMessage: "Unauthorized. Please log in.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 401 }
            );
        }

        const role = session.user?.role?.toLowerCase()?.trim();
        if (role !== "admin" && role !== "superadmin" && role !== "super admin") {
            return NextResponse.json(
                {
                    errorCode: 2002,
                    errorMessage: "Forbidden. Only Admin or SuperAdmin can view all farms.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const pageParam = searchParams.get("page");
        const pageSizeParam = searchParams.get("pageSize");
        const searchParam = searchParams.get("search");

        const query = new URLSearchParams();
        if (pageParam) {
            const page = Math.min(10000, Math.max(1, Number(pageParam) || 1));
            query.set("page", String(page));
        }
        if (pageSizeParam) {
            const pageSize = Math.min(100, Math.max(1, Number(pageSizeParam) || 20));
            query.set("pageSize", String(pageSize));
        }
        if (searchParam && searchParam.trim()) {
            query.set("search", searchParam.trim().slice(0, 100));
        }

        const qs = query.toString();
        const url = qs
            ? `${BACKEND_URL}/api/v1/admin/farms?${qs}`
            : `${BACKEND_URL}/api/v1/admin/farms`;

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
            errorMessage: "Invalid response from farms service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Get All Farms API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to retrieve farms",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}

// POST /api/admin/farms -> POST {BACKEND_URL}/api/v1/admin/farms
export async function POST(request: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                {
                    errorCode: 401,
                    errorMessage: "Unauthorized. Please log in.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 401 }
            );
        }

        const role = session.user?.role?.toLowerCase()?.trim();
        if (role !== "admin" && role !== "superadmin" && role !== "super admin") {
            return NextResponse.json(
                {
                    errorCode: 2002,
                    errorMessage: "Forbidden. Only Admin or SuperAdmin can create farms.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 403 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const response = await fetch(`${BACKEND_URL}/api/v1/admin/farms`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json().catch(() => ({
            errorCode: 500,
            errorMessage: "Invalid response from backend",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Create Farm API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to create farm",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
