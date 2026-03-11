/**
 * TikTok Shop Partner API client (calls our proxy server; never exposes secret).
 * @see https://partner.tiktokshop.com/docv2/page/get-open-collaboration-creator-content-detail-202508
 */

export type GmvTier = "none" | "under_5k" | "5k_25k" | "25k_100k" | "100k_plus";

export interface TikTokApiCreator {
  id: string;
  handle: string;
  full_name: string | null;
  platform: string;
  follower_count: number;
  engagement_rate: number;
  avg_views: number;
  gmv_tier: GmvTier;
  niche: string[];
  avatar_url: string | null;
  profile_url: string | null;
  last_active: string | null;
  post_fulfill_rate: number | null;
  gmv_30d: number | null;
}

export interface TikTokCreatorsResponse {
  creators: TikTokApiCreator[];
  total: number;
}

export interface TikTokApiError {
  error: string;
  message?: string;
  hint?: string;
}

const API_BASE = "";

export async function fetchTikTokCreators(): Promise<TikTokCreatorsResponse> {
  const res = await fetch(`${API_BASE}/api/tiktok/creators`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: TikTokApiError = {
      error: data.error ?? "TikTok API error",
      message: data.message,
      hint: data.hint,
    };
    throw new Error(err.message ?? err.error);
  }

  return {
    creators: data.creators ?? [],
    total: data.total ?? (data.creators ?? []).length,
  };
}

export async function checkTikTokToken(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/tiktok/token`);
  const data = await res.json().catch(() => ({}));
  return res.ok && data.ok === true;
}
