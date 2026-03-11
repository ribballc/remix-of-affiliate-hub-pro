/**
 * Creator feed data with analytics (TikTok Shop Partner / open collaboration style).
 * @see https://partner.tiktokshop.com/docv2/page/get-open-collaboration-creator-content-detail-202508
 */
import type { Affiliate, AffiliatePlatform, AffiliateStatus } from "./affiliates";
import { affiliates } from "./affiliates";

export type GmvTier = "none" | "under_5k" | "5k_25k" | "25k_100k" | "100k_plus";

export interface CreatorAnalytics {
  /** Average views per content piece */
  avgViews: number;
  /** Total content pieces (posts/videos) */
  contentCount: number;
  /** Total likes across content */
  totalLikes: number;
  /** GMV tier for TikTok Shop / open collaboration */
  gmvTier: GmvTier;
  /** Last activity timestamp (ISO) */
  lastActive: string;
  /** Collaboration count (open collabs) */
  collaborationCount: number;
}

export interface CreatorFeedItem extends Affiliate {
  analytics: CreatorAnalytics;
  avatarUrl?: string;
  /** Set when item is from TikTok Shop API */
  _source?: "tiktok";
  postFulfillRate?: number;
  gmv30d?: number;
}

const GMV_TIERS: GmvTier[] = ["none", "under_5k", "5k_25k", "25k_100k", "100k_plus"];

function mockAnalytics(a: Affiliate): CreatorAnalytics {
  const seed = a.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const tierIndex = Math.min(4, Math.floor((seed % 100) / 20));
  return {
    avgViews: Math.round(5000 + (seed % 200) * 1200 + a.followers * 0.15),
    contentCount: 12 + (seed % 40),
    totalLikes: Math.round(a.followers * (a.engagementRate / 100) * (8 + (seed % 12))),
    gmvTier: GMV_TIERS[tierIndex],
    lastActive: new Date(Date.now() - (seed % 21) * 24 * 60 * 60 * 1000).toISOString(),
    collaborationCount: (seed % 15),
  };
}

export const creatorFeedItems: CreatorFeedItem[] = affiliates.map((a) => ({
  ...a,
  analytics: mockAnalytics(a),
  avatarUrl: undefined,
}));

export const GMV_LABELS: Record<GmvTier, string> = {
  none: "None",
  under_5k: "<$5K",
  "5k_25k": "$5K–$25K",
  "25k_100k": "$25K–$100K",
  "100k_plus": "$100K+",
};

export const GMV_BADGE_CLASS: Record<GmvTier, string> = {
  none: "bg-muted text-muted-foreground border-muted-foreground/30",
  under_5k: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30",
  "5k_25k": "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  "25k_100k": "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "100k_plus": "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
};

export type FeedSortKey = "followers" | "engagement" | "avgViews" | "contentCount" | "gmv" | "lastActive";

/** Map TikTok Shop API creator to CreatorFeedItem for the feed UI. */
export function mapTikTokCreatorToFeedItem(
  c: import("@/lib/tiktokApi").TikTokApiCreator
): CreatorFeedItem {
  const handle = c.handle.startsWith("@") ? c.handle : `@${c.handle}`;
  return {
    id: c.id,
    name: c.full_name ?? handle,
    platform: "TikTok",
    handle,
    followers: c.follower_count,
    engagementRate: c.engagement_rate,
    niche: c.niche?.length ? c.niche.join(", ") : "TikTok creator",
    status: "New",
    clientId: null,
    notes: "",
    addedAt: new Date().toISOString(),
    profileUrl: c.profile_url ?? undefined,
    avatarUrl: c.avatar_url ?? undefined,
    analytics: {
      avgViews: c.avg_views ?? 0,
      contentCount: 0,
      totalLikes: 0,
      gmvTier: c.gmv_tier,
      lastActive: c.last_active ?? new Date().toISOString(),
      collaborationCount: 0,
    },
    _source: "tiktok" as const,
    postFulfillRate: c.post_fulfill_rate ?? undefined,
    gmv30d: c.gmv_30d ?? undefined,
  };
}
