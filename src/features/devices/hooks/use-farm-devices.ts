"use client";

import { useEffect, useState, useCallback } from "react";
import { getFarmDevices } from "../services/device-service";
import type { DeviceSummary } from "../types/device";

export function useFarmDevices(farmId: number | null) {
    const [devices, setDevices] = useState<DeviceSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDevices = useCallback(async () => {
        if (farmId === null) {
            setDevices([]);
            setError(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getFarmDevices(farmId);
            setDevices(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong"
            );
            setDevices([]);
        } finally {
            setLoading(false);
        }
    }, [farmId]);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    return {
        devices,
        loading,
        error,
        refetch: fetchDevices,
    };
}
