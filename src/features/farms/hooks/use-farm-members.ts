"use client";

import { useEffect, useState, useCallback } from "react";
import { getFarmMembers } from "../services/member-service";
import type { FarmMember } from "../types/member.types";

export function useFarmMembers(farmId: number | null) {
    const [members, setMembers] = useState<FarmMember[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        if (!farmId) {
            setMembers([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getFarmMembers(farmId);
            setMembers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load members");
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }, [farmId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return { members, loading, error, refetch: fetchMembers };
}

