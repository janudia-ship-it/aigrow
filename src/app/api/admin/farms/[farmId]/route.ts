import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// DELETE /api/admin/farms/[farmId] -> DELETE {BACKEND_URL}/api/v1/admin/farms/{farmId}
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ farmId: string }> }
) {
    try {
        const { farmId } = await params;
        const id = Number(farmId);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    errorCode: 1000,
                    errorMessage: "Invalid farm ID.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 400 }
            );
        }

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
                    errorMessage: "Forbidden. Only Admin or SuperAdmin can delete farms.",
                    success: false,
                    message: null,
                    data: null,
                },
                { status: 403 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/farms/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
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
        console.error("Delete Farm API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to delete farm",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}
