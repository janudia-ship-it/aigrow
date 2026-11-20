"use client";

import { useEffect, useState, useCallback } from "react";
import { getDeviceById } from "../services/device-service";
import type { DeviceDetails } from "../types/device";

export function useDeviceById(deviceId: number | null) {
    const [device, setDevice] = useState<DeviceDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDevice = useCallback(async () => {
        if (deviceId === null || isNaN(deviceId) || deviceId <= 0) {
            setDevice(null);
            setError(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getDeviceById(deviceId);
            setDevice(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load device details"
            );
            setDevice(null);
        } finally {
            setLoading(false);
        }
    }, [deviceId]);

    useEffect(() => {
        fetchDevice();
    }, [fetchDevice]);

    return {
        device,
        loading,
        error,
        refetch: fetchDevice,
    };
}
