"use client";

import { useEffect, useState } from "react";
import { getFarmDevices } from "../services/device-service";
import type { DeviceSummary } from "../types/device";

export function useFarmDevices(farmId: number | null) {

    const [devices, setDevices] = useState<DeviceSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        if (farmId === null) {
            setDevices([]);
            setError(null);
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchDevices() {
            try {
                setLoading(true);
                setError(null);

                const data = await getFarmDevices(farmId!);

                if (!cancelled) {
                    setDevices(data);
                }

            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Something went wrong"
                    );
                    setDevices([]);
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchDevices();

        return () => {
            cancelled = true;
        };

    }, [farmId]);

    return {
        devices,
        loading,
        error,
    };
}