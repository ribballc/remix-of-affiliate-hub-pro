export const PLATFORMS = ["tiktok", "instagram", "youtube"] as const;
export type PlatformFilter = (typeof PLATFORMS)[number] | "all";

export const GMV_TIERS = [
  { value: "none", label: "None" },
  { value: "under_5k", label: "<$5K" },
  { value: "5k_25k", label: "$5K-$25K" },
  { value: "25k_100k", label: "$25K-$100K" },
  { value: "100k_plus", label: "$100K+" },
] as const;

export const NICHE_OPTIONS = [
  "Beauty",
  "Skincare",
  "Fitness",
  "Fashion",
  "Food",
  "Lifestyle",
  "Health",
  "Wellness",
  "Home",
  "Tech",
  "Pet",
  "Baby",
  "Finance",
  "Gaming",
  "Travel",
  "DIY",
  "Education",
  "Entertainment",
  "Sports",
  "Outdoors",
  "Automotive",
  "Art",
  "Music",
] as const;

export const LAST_ACTIVE_OPTIONS = [
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
] as const;

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Brazil",
  "India",
  "Mexico",
  "Spain",
  "Italy",
  "Netherlands",
  "Other",
] as const;

export const SORT_OPTIONS = [
  { value: "followers", label: "Followers" },
  { value: "engagement", label: "Engagement" },
  { value: "gmv", label: "GMV" },
  { value: "recent", label: "Recently Active" },
] as const;

export const FOLLOWER_MIN = 1_000;
export const FOLLOWER_MAX = 10_000_000;
export const ENGAGEMENT_MAX = 20;
export const PAGE_SIZE = 50;

export const GMV_BADGE_CLASS: Record<string, string> = {
  none: "bg-muted text-muted-foreground border-muted-foreground/30",
  under_5k: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30",
  "5k_25k": "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  "25k_100k": "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "100k_plus": "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
};
