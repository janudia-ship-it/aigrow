"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getActuatorTypes } from "../services/device-service";
import type { ActuatorType } from "../types/device";

export function useActuatorTypes(actuatorType?: string) {
    const [actuatorTypes, setActuatorTypes] = useState<ActuatorType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getActuatorTypes(actuatorType);
            setActuatorTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load actuator types");
            setActuatorTypes([]);
        } finally {
            setLoading(false);
        }
    }, [actuatorType]);

    useEffect(() => {
        fetchTypes();
    }, [fetchTypes]);

    // Map by lower-cased actuatorType for fast, case-insensitive lookups
    const typeMap = useMemo(() => {
        const map = new Map<string, ActuatorType>();
        for (const at of actuatorTypes) {
            if (at.actuatorType) {
                map.set(at.actuatorType.toLowerCase(), at);
            }
        }
        return map;
    }, [actuatorTypes]);

    const getActuatorType = useCallback(
        (typeKey: string | null | undefined): ActuatorType | undefined => {
            if (!typeKey) return undefined;
            return typeMap.get(typeKey.toLowerCase());
        },
        [typeMap]
    );

    return {
        actuatorTypes,
        loading,
        error,
        refetch: fetchTypes,
        getActuatorType,
    };
}
