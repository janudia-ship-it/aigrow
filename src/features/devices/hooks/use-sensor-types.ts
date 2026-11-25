"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getSensorTypes } from "../services/device-service";
import type { SensorType } from "../types/device";

export function useSensorTypes(sensorType?: string) {
    const [sensorTypes, setSensorTypes] = useState<SensorType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSensorTypes(sensorType);
            setSensorTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load sensor types");
            setSensorTypes([]);
        } finally {
            setLoading(false);
        }
    }, [sensorType]);

    useEffect(() => {
        fetchTypes();
    }, [fetchTypes]);

    // Map by lower-cased sensorType for fast, case-insensitive lookups
    const typeMap = useMemo(() => {
        const map = new Map<string, SensorType>();
        for (const st of sensorTypes) {
            if (st.sensorType) {
                map.set(st.sensorType.toLowerCase(), st);
            }
        }
        return map;
    }, [sensorTypes]);

    const getSensorType = useCallback(
        (typeKey: string | null | undefined): SensorType | undefined => {
            if (!typeKey) return undefined;
            return typeMap.get(typeKey.toLowerCase());
        },
        [typeMap]
    );

    return {
        sensorTypes,
        loading,
        error,
        refetch: fetchTypes,
        getSensorType,
    };
}
