import type { DiscoverFilters } from "@/hooks/useDiscoverAffiliates";
import type { AffiliateRow } from "@/lib/supabase";

export type SegmentType = "dynamic" | "manual";

export interface Segment {
  id: string;
  name: string;
  type: SegmentType;
  filter_rules?: DiscoverFilters | null;
  memberIds: string[];
  updatedAt: string;
}

export interface SegmentTemplate {
  id: string;
  name: string;
  description: string;
  filter_rules: DiscoverFilters;
}

const PLATFORMS = ["tiktok", "instagram", "youtube"] as const;
const GMV_TIERS = ["none", "under_5k", "5k_25k", "25k_100k", "100k_plus"] as const;

function buildMockAffiliates(): AffiliateRow[] {
  const list: AffiliateRow[] = [];
  const niches = ["Beauty", "Skincare", "Fashion", "Fitness", "Lifestyle", "Health", "Wellness"];
  for (let i = 0; i < 80; i++) {
    const platform = PLATFORMS[i % 3];
    list.push({
      id: `aff-${i}`,
      handle: `@creator_${i}`,
      full_name: `Creator ${i}`,
      platform,
      follower_count: 5000 + i * 2000 + (i % 5) * 10000,
      following_count: 200 + i,
      avg_views: 5000 + i * 500,
      engagement_rate: 2 + (i % 15) * 0.5,
      gmv_tier: GMV_TIERS[i % 5],
      niche: niches.slice(0, (i % 3) + 1),
      bio: "Creator bio",
      profile_url: null,
      avatar_url: null,
      email: i % 3 === 0 ? `c${i}@example.com` : null,
      country: "United States",
      language: "en",
      verified: i % 4 === 0,
      last_active: i % 5 === 0 ? null : new Date(Date.now() - (i % 4) * 15 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return list;
}

export const MOCK_AFFILIATES = buildMockAffiliates();

export function applyFilterRules(affiliates: AffiliateRow[], rules: DiscoverFilters): string[] {
  return affiliates
    .filter((a) => {
      if (rules.platform !== "all" && a.platform !== rules.platform) return false;
      if (a.follower_count < rules.followerRange[0] || a.follower_count > rules.followerRange[1]) return false;
      const eng = a.engagement_rate != null ? Number(a.engagement_rate) * 100 : 0;
      if (eng < rules.engagementRange[0] || eng > rules.engagementRange[1]) return false;
      if (rules.gmvTiers.length > 0 && !rules.gmvTiers.includes(a.gmv_tier)) return false;
      if (rules.niches.length > 0 && !a.niche.some((n) => rules.niches.includes(n))) return false;
      if (rules.country && a.country !== rules.country) return false;
      if (rules.hasEmail === true && !a.email) return false;
      if (rules.lastActiveDays && a.last_active) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - rules.lastActiveDays);
        if (new Date(a.last_active) < cutoff) return false;
      }
      return true;
    })
    .map((a) => a.id);
}

export function segmentHealth(affiliates: AffiliateRow[]): number {
  if (affiliates.length === 0) return 0;
  const avgEngagement =
    affiliates.reduce((s, a) => s + (a.engagement_rate != null ? Number(a.engagement_rate) * 100 : 0), 0) /
    affiliates.length;
  const pctWithEmail = (affiliates.filter((a) => !!a.email).length / affiliates.length) * 100;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const pctActive30 =
    (affiliates.filter((a) => a.last_active && new Date(a.last_active) >= thirtyDaysAgo).length /
      affiliates.length) *
    100;
  const score = avgEngagement * 0.4 + pctWithEmail * 0.3 + pctActive30 * 0.3;
  return Math.round(Math.min(100, Math.max(0, score)));
}

export function platformBreakdown(affiliates: AffiliateRow[]): Record<string, number> {
  const total = affiliates.length;
  if (total === 0) return { tiktok: 0, instagram: 0, youtube: 0 };
  const counts = { tiktok: 0, instagram: 0, youtube: 0 };
  affiliates.forEach((a) => {
    if (a.platform in counts) counts[a.platform as keyof typeof counts]++;
  });
  return {
    tiktok: Math.round((counts.tiktok / total) * 100),
    instagram: Math.round((counts.instagram / total) * 100),
    youtube: Math.round((counts.youtube / total) * 100),
  };
}

export const SEGMENT_TEMPLATES: SegmentTemplate[] = [
  {
    id: "skincare-nano",
    name: "Skincare Nano (5K-50K followers, beauty niche, high engagement)",
    description: "5K–50K followers, Beauty/Skincare niche, 4%+ engagement",
    filter_rules: {
      search: "",
      platform: "all",
      followerRange: [5000, 50000],
      engagementRange: [4, 20],
      gmvTiers: [],
      niches: ["Beauty", "Skincare"],
      country: null,
      hasEmail: null,
      lastActiveDays: null,
      sort: "followers",
    },
  },
  {
    id: "tiktok-gmv",
    name: "TikTok GMV Earners ($5K+ GMV tier)",
    description: "TikTok creators with $5K+ GMV tier",
    filter_rules: {
      search: "",
      platform: "tiktok",
      followerRange: [1000, 10000000],
      engagementRange: [0, 20],
      gmvTiers: ["5k_25k", "25k_100k", "100k_plus"],
      niches: [],
      country: null,
      hasEmail: null,
      lastActiveDays: null,
      sort: "gmv",
    },
  },
  {
    id: "email-verified-micro",
    name: "Email-Verified Micro Influencers",
    description: "Micro influencers with verified email",
    filter_rules: {
      search: "",
      platform: "all",
      followerRange: [1000, 100000],
      engagementRange: [0, 20],
      gmvTiers: [],
      niches: [],
      country: null,
      hasEmail: true,
      lastActiveDays: null,
      sort: "followers",
    },
  },
  {
    id: "recently-active-mid",
    name: "Recently Active (30 days) Mid-Tier",
    description: "Active in last 30 days, 50K–500K followers",
    filter_rules: {
      search: "",
      platform: "all",
      followerRange: [50000, 500000],
      engagementRange: [0, 20],
      gmvTiers: [],
      niches: [],
      country: null,
      hasEmail: null,
      lastActiveDays: 30,
      sort: "recent",
    },
  },
];
