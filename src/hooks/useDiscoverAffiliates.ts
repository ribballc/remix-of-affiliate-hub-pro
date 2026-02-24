import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AffiliateRow } from "@/lib/supabase";
import {
  FOLLOWER_MIN,
  FOLLOWER_MAX,
  ENGAGEMENT_MAX,
  PAGE_SIZE,
  type PlatformFilter,
} from "@/lib/discover-constants";

export type DiscoverFilters = {
  search: string;
  platform: PlatformFilter;
  followerRange: [number, number];
  engagementRange: [number, number];
  gmvTiers: string[];
  niches: string[];
  country: string | null;
  hasEmail: boolean | null;
  lastActiveDays: number | null;
  sort: "followers" | "engagement" | "gmv" | "recent";
};

const defaultFilters: DiscoverFilters = {
  search: "",
  platform: "all",
  followerRange: [FOLLOWER_MIN, FOLLOWER_MAX],
  engagementRange: [0, ENGAGEMENT_MAX],
  gmvTiers: [],
  niches: [],
  country: null,
  hasEmail: null,
  lastActiveDays: null,
  sort: "followers",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

async function fetchAffiliates(
  filters: DiscoverFilters,
  page: number
): Promise<{ data: AffiliateRow[]; total: number | null }> {
  if (supabase) {
    let q = supabase
      .from("affiliates")
      .select("*", { count: "exact" });

    if (filters.platform !== "all") {
      q = q.eq("platform", filters.platform);
    }
    q = q.gte("follower_count", filters.followerRange[0]);
    q = q.lte("follower_count", filters.followerRange[1]);
    if (filters.engagementRange[0] > 0 || filters.engagementRange[1] < ENGAGEMENT_MAX) {
      if (filters.engagementRange[0] > 0) {
        q = q.gte("engagement_rate", filters.engagementRange[0] / 100);
      }
      if (filters.engagementRange[1] < ENGAGEMENT_MAX) {
        q = q.lte("engagement_rate", filters.engagementRange[1] / 100);
      }
    }
    if (filters.gmvTiers.length > 0) {
      q = q.in("gmv_tier", filters.gmvTiers);
    }
    if (filters.niches.length > 0) {
      q = q.overlaps("niche", filters.niches);
    }
    if (filters.country) {
      q = q.eq("country", filters.country);
    }
    if (filters.hasEmail === true) {
      q = q.not("email", "is", null);
    }
    if (filters.lastActiveDays) {
      const since = new Date();
      since.setDate(since.getDate() - filters.lastActiveDays);
      q = q.gte("last_active", since.toISOString());
    }
    if (filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      q = q.or(`handle.ilike.${term},full_name.ilike.${term},bio.ilike.${term}`);
    }

    const orderCol =
      filters.sort === "followers"
        ? "follower_count"
        : filters.sort === "engagement"
          ? "engagement_rate"
          : filters.sort === "gmv"
            ? "gmv_tier"
            : "last_active";
    const ascending = filters.sort === "recent";
    q = q.order(orderCol, { ascending, nullsFirst: false });

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await q.range(from, to).select("*");

    if (error) throw error;
    return { data: (data ?? []) as AffiliateRow[], total: count ?? null };
  }

  const mockData: AffiliateRow[] = Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: `mock-${page}-${i}`,
    handle: `@creator${page * PAGE_SIZE + i}`,
    full_name: `Creator ${page * PAGE_SIZE + i}`,
    platform: ["tiktok", "instagram", "youtube"][i % 3] as AffiliateRow["platform"],
    follower_count: 50000 + (page * PAGE_SIZE + i) * 1000,
    following_count: 200,
    avg_views: 10000,
    engagement_rate: 3 + (i % 10) * 0.5,
    gmv_tier: ["none", "under_5k", "5k_25k", "25k_100k", "100k_plus"][i % 5] as AffiliateRow["gmv_tier"],
    niche: ["Beauty", "Skincare", "Fashion"].slice(0, (i % 3) + 1),
    bio: "Creator bio and content about beauty and lifestyle.",
    profile_url: "https://example.com",
    avatar_url: null,
    email: i % 3 === 0 ? "creator@example.com" : null,
    country: "United States",
    language: "en",
    verified: i % 4 === 0,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  await new Promise((r) => setTimeout(r, 400));
  return { data: mockData, total: 500 };
}

export function useDiscoverAffiliates(filters: DiscoverFilters) {
  const debounced = useDebounce(filters, 400);
  const q = useInfiniteQuery({
    queryKey: ["discover-affiliates", debounced],
    queryFn: async ({ pageParam = 0 }) => fetchAffiliates(debounced, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.data.length || lastPage.data.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

  const totalCount = q.data?.pages[0]?.total ?? null;
  const allRows = useMemo(
    () => q.data?.pages.flatMap((p) => p.data) ?? [],
    [q.data?.pages]
  );

  return { ...q, totalCount, allRows, filters: debounced };
}

export { defaultFilters };
