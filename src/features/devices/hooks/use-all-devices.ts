"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllDevices } from "../services/device-service";
import type { AdminDevice } from "../types/device";

export function useAllDevices(initialPageSize = 20) {
    const [devices, setDevices] = useState<AdminDevice[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(initialPageSize);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [farmId, setFarmId] = useState<number | undefined>(undefined);
    const [deviceType, setDeviceType] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchAllDevices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllDevices({
                page,
                pageSize,
                search: debouncedSearch,
                farmId,
                deviceType: deviceType || undefined,
            });
            setDevices(Array.isArray(data.items) ? data.items : []);
            setTotalCount(data.totalCount ?? 0);
            setTotalPages(Math.max(1, data.totalPages ?? 1));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load devices");
            setDevices([]);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedSearch, farmId, deviceType]);

    useEffect(() => {
        fetchAllDevices();
    }, [fetchAllDevices]);

    const handleSetFarmId = useCallback((id: number | undefined) => {
        setFarmId(id);
        setPage(1);
    }, []);

    const handleSetDeviceType = useCallback((type: string) => {
        setDeviceType(type);
        setPage(1);
    }, []);

    const resetFilters = useCallback(() => {
        setSearch("");
        setDebouncedSearch("");
        setFarmId(undefined);
        setDeviceType("");
        setPage(1);
    }, []);

    return {
        devices,
        page,
        pageSize,
        totalCount,
        totalPages,
        search,
        farmId,
        deviceType,
        loading,
        error,
        setPage,
        setSearch,
        setFarmId: handleSetFarmId,
        setDeviceType: handleSetDeviceType,
        resetFilters,
        refetch: fetchAllDevices,
    };
}
