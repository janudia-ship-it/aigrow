"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllUsers } from "../services/user-service";
import type { UserDetails } from "../types/user.types";

export function useAllUsers(defaultPageSize = 20) {
    const [users, setUsers] = useState<UserDetails[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(defaultPageSize);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllUsers({
                page,
                pageSize,
                search,
                role,
                isActive,
                isEmailVerified,
            });
            setUsers(data.items);
            setTotalCount(data.totalCount);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load users");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, role, isActive, isEmailVerified]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const handleRoleChange = (val: string) => {
        setRole(val);
        setPage(1);
    };

    const handleActiveChange = (val: boolean | undefined) => {
        setIsActive(val);
        setPage(1);
    };

    const handleEmailVerifiedChange = (val: boolean | undefined) => {
        setIsEmailVerified(val);
        setPage(1);
    };

    const resetFilters = () => {
        setSearch("");
        setRole("");
        setIsActive(undefined);
        setIsEmailVerified(undefined);
        setPage(1);
    };

    return {
        users,
        page,
        pageSize,
        totalCount,
        totalPages,
        search,
        role,
        isActive,
        isEmailVerified,
        loading,
        error,
        setPage,
        setSearch: handleSearchChange,
        setRole: handleRoleChange,
        setIsActive: handleActiveChange,
        setIsEmailVerified: handleEmailVerifiedChange,
        resetFilters,
        refetch: fetch,
    };
}
