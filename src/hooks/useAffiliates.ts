import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AffiliateRow } from "@/lib/supabase";

export type AffiliateDiscoverFilters = {
  platform: string;
  followerMin: number;
  followerMax: number;
  gmvTiers: string[];
  niches: string[];
  hasEmail: boolean;
  minEngagement: number;
  search: string;
  sort: "followers" | "engagement" | "ai_match" | "added";
};

export const DEFAULT_AFFILIATE_DISCOVER_FILTERS: AffiliateDiscoverFilters = {
  platform: "all",
  followerMin: 0,
  followerMax: 10_000_000,
  gmvTiers: [],
  niches: [],
  hasEmail: false,
  minEngagement: 0,
  search: "",
  sort: "followers",
};

const PAGE_SIZE = 24;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

async function fetchAffiliates(
  filters: AffiliateDiscoverFilters
): Promise<{ data: AffiliateRow[]; total: number }> {
  if (!supabase) {
    return { data: [], total: 0 };
  }
  try {
    let q = supabase.from("affiliates").select("*", { count: "exact" });

    if (filters.platform !== "all") {
      q = q.eq("platform", filters.platform);
    }
    q = q.gte("follower_count", filters.followerMin);
    q = q.lte("follower_count", filters.followerMax);
    if (filters.minEngagement > 0) {
      q = q.gte("engagement_rate", filters.minEngagement / 100);
    }
    if (filters.gmvTiers.length > 0) {
      q = q.in("gmv_tier", filters.gmvTiers);
    }
    if (filters.niches.length > 0) {
      q = q.overlaps("niche", filters.niches);
    }
    if (filters.hasEmail) {
      q = q.not("email", "is", null);
    }
    if (filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      q = q.or(`handle.ilike.${term},full_name.ilike.${term}`);
    }

    const orderCol =
      filters.sort === "followers"
        ? "follower_count"
        : filters.sort === "engagement"
          ? "engagement_rate"
          : filters.sort === "ai_match"
            ? "engagement_rate"
            : "created_at";
    q = q.order(orderCol, { ascending: false, nullsFirst: false });

    const { data, count, error } = await q.range(0, PAGE_SIZE - 1);

    if (error) throw error;
    const rows = (data ?? []) as AffiliateRow[];
    return { data: rows, total: count ?? rows.length };
  } catch (e) {
    throw e;
  }
}

export function useAffiliates(filters: AffiliateDiscoverFilters) {
  const debouncedFilters = useDebounce(filters, 300);
  const query = useQuery({
    queryKey: ["affiliates-discover", debouncedFilters],
    queryFn: () => fetchAffiliates(debouncedFilters),
  });
  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Resolve current user's client_id for RLS (clients where user_id = auth.uid()). */
async function getCurrentClientId(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
}

export function useMutateAffiliateStatus() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (affiliateId: string) => {
      if (!supabase) throw new Error("Supabase not configured");
      const clientId = await getCurrentClientId();
      if (!clientId) throw new Error("No client found. Sign in and ensure you have a client record.");
      const { error } = await supabase.from("client_affiliates").insert({
        client_id: clientId,
        affiliate_id: affiliateId,
        status: "discovered",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates-discover"] });
    },
  });
  return mutation;
}

export type SaveSegmentPayload = {
  name: string;
  filterRules: AffiliateDiscoverFilters;
  matchCount: number;
};

export function useSaveSegment() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: SaveSegmentPayload) => {
      if (!supabase) throw new Error("Supabase not configured");
      const clientId = await getCurrentClientId();
      if (!clientId) throw new Error("No client found. Sign in and ensure you have a client record.");
      const filterRules = { ...payload.filterRules, is_dynamic: true };
      const { error } = await supabase.from("affiliate_segments").insert({
        name: payload.name,
        client_id: clientId,
        filter_rules: filterRules,
        affiliate_count: payload.matchCount,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-segments"] });
    },
  });
  return mutation;
}
