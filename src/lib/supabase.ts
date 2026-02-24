import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export type AffiliateRow = {
  id: string;
  handle: string;
  full_name: string | null;
  platform: "tiktok" | "instagram" | "youtube" | "email_only";
  follower_count: number;
  following_count: number;
  avg_views: number | null;
  engagement_rate: number | null;
  gmv_tier: "none" | "under_5k" | "5k_25k" | "25k_100k" | "100k_plus";
  niche: string[];
  bio: string | null;
  profile_url: string | null;
  avatar_url: string | null;
  email: string | null;
  country: string | null;
  language: string | null;
  verified: boolean;
  last_active: string | null;
  created_at: string;
  updated_at: string;
};
