"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllFarmsClient } from "../services/farm-service";
import type { Farm } from "../types/farm.types";

export function useAllFarms(initialPageSize = 20) {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(initialPageSize);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
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

    const fetchAllFarms = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllFarmsClient({
                page,
                pageSize,
                search: debouncedSearch,
            });
            setFarms(Array.isArray(data.items) ? data.items : []);
            setTotalCount(data.totalCount ?? 0);
            setTotalPages(Math.max(1, data.totalPages ?? 1));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load farms");
            setFarms([]);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedSearch]);

    useEffect(() => {
        fetchAllFarms();
    }, [fetchAllFarms]);

    const resetFilters = useCallback(() => {
        setSearch("");
        setDebouncedSearch("");
        setPage(1);
    }, []);

    return {
        farms,
        page,
        pageSize,
        totalCount,
        totalPages,
        search,
        loading,
        error,
        setPage,
        setSearch,
        resetFilters,
        refetch: fetchAllFarms,
    };
}
