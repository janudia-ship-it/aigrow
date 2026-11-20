"use client";

import { useEffect, useState, useCallback } from "react";
import { getFarmZones } from "../services/zone-service";
import type { Zone } from "../types/zone.types";

export function useFarmZones(farmId: number | null) {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchZones = useCallback(async () => {
        if (!farmId) {
            setZones([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getFarmZones(farmId);
            setZones(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load zones");
            setZones([]);
        } finally {
            setLoading(false);
        }
    }, [farmId]);

    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    return { zones, loading, error, refetch: fetchZones };
}