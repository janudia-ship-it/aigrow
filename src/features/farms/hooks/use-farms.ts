"use client";

import { useEffect, useState, useCallback } from "react";
import type { Farm } from "../types/farm.types";

export function useFarms() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFarms = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/farms", {
                method: "GET",
                cache: "no-store",
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.success) {
                throw new Error(result.errorMessage || "Failed to load farms");
            }

            setFarms(result.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load farms");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFarms();
    }, [fetchFarms]);

    return { farms, loading, error, refetch: fetchFarms };
}