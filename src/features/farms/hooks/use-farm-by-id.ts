"use client";

import { useEffect, useState } from "react";
import type { FarmDetails } from "../types/farm.types";

export function useFarmById(farmId: number | null) {

    const [farmDetails, setFarmDetails] =
        useState<FarmDetails | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        if (farmId === null) {
            setFarmDetails(null);
            setLoading(false);
            setError(null);
            return;
        }

        const controller = new AbortController();

        const fetchFarmDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/farms/${farmId}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        signal: controller.signal,
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.errorMessage ||
                        "Failed to retrieve farm details"
                    );
                }

                setFarmDetails(result.data);

            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong"
                );

                setFarmDetails(null);

            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchFarmDetails();

        return () => controller.abort();

    }, [farmId]);

    return { farmDetails, loading, error };
}