import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/api-config";
import { getAuthSession } from "@/lib/auth/session";

// GET /api/admin/devices → GET {backend}/api/v1/admin/devices
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
                    errorMessage: "Forbidden. Only Admin or SuperAdmin can view all devices.",
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
        const farmIdParam = searchParams.get("farmId");
        const deviceTypeParam = searchParams.get("deviceType");

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
        if (farmIdParam) {
            const farmId = Number(farmIdParam);
            if (Number.isInteger(farmId) && farmId > 0) {
                query.set("farmId", String(farmId));
            }
        }
        if (deviceTypeParam && deviceTypeParam.trim()) {
            query.set("deviceType", deviceTypeParam.trim());
        }

        const qs = query.toString();
        const url = qs
            ? `${BACKEND_URL}/api/v1/admin/devices?${qs}`
            : `${BACKEND_URL}/api/v1/admin/devices`;

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
            errorMessage: "Invalid response from devices service",
            success: false,
            message: null,
            data: null,
        }));

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Get All Devices API Error:", error);
        return NextResponse.json(
            {
                errorCode: 500,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to retrieve devices",
                success: false,
                message: null,
                data: null,
            },
            { status: 500 }
        );
    }
}

// POST /api/admin/devices → POST {backend}/api/v1/admin/devices
export async function POST(request: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session.accessToken) {
            return NextResponse.json(
                { success: false, errorMessage: "Unauthorized. Please log in.", data: null },
                { status: 401 }
            );
        }

        const role = session.user?.role?.toLowerCase();
        if (role !== "admin" && role !== "superadmin") {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Forbidden. Only Admin or SuperAdmin can add devices.",
                    data: null,
                },
                { status: 403 }
            );
        }

        const accessToken = session.accessToken;

        const body = await request.json();
        const {
            deviceType,
            macAddress,
            name,
            farmId,
            zoneId,
            blockId,
            isShared,
            mqttIntervalSeconds,
        } = body;

        // Validation
        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { success: false, errorMessage: "Device name is required.", data: null },
                { status: 400 }
            );
        }

        if (!deviceType || typeof deviceType !== "string" || !deviceType.trim()) {
            return NextResponse.json(
                { success: false, errorMessage: "Device type is required.", data: null },
                { status: 400 }
            );
        }

        if (!macAddress || typeof macAddress !== "string") {
            return NextResponse.json(
                { success: false, errorMessage: "MAC address is required.", data: null },
                { status: 400 }
            );
        }

        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(macAddress.trim())) {
            return NextResponse.json(
                {
                    success: false,
                    errorMessage: "Invalid MAC address format. Expected format: AA:BB:CC:DD:EE:FF",
                    data: null,
                },
                { status: 400 }
            );
        }

        // Format MAC to upper case with colons
        const formattedMac = macAddress.trim().replace(/-/g, ":").toUpperCase();

        const fId = Number(farmId);
        if (!Number.isInteger(fId) || fId <= 0) {
            return NextResponse.json(
                { success: false, errorMessage: "Valid farm ID is required.", data: null },
                { status: 400 }
            );
        }

        const payload: Record<string, unknown> = {
            deviceType: deviceType.trim(),
            macAddress: formattedMac,
            name: name.trim().slice(0, 64),
            farmId: fId,
            zoneId: zoneId !== undefined && zoneId !== null && zoneId !== "" ? Number(zoneId) : null,
            blockId: blockId !== undefined && blockId !== null && blockId !== "" ? Number(blockId) : null,
            isShared: typeof isShared === "boolean" ? isShared : false,
            mqttIntervalSeconds:
                mqttIntervalSeconds !== undefined && mqttIntervalSeconds !== null && mqttIntervalSeconds !== ""
                    ? Number(mqttIntervalSeconds)
                    : 5,
        };

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/devices`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
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
        console.error("Create Device API Error:", error);
        return NextResponse.json(
            {
                success: false,
                errorMessage:
                    error instanceof Error && error.message === "fetch failed"
                        ? "Unable to connect to backend server."
                        : "Failed to create device",
                data: null,
            },
            { status: 500 }
        );
    }
}
