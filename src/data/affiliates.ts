export type AffiliatePlatform = "Instagram" | "TikTok" | "YouTube" | "Other";
export type AffiliateStatus = "New" | "Contacted" | "Responded" | "Declined" | "Onboarded";

export interface Affiliate {
  id: string;
  name: string;
  platform: AffiliatePlatform;
  handle: string;
  followers: number;
  engagementRate: number;
  niche: string;
  status: AffiliateStatus;
  clientId: string | null;
  notes: string;
  addedAt: string;
  profileUrl?: string;
}

export const affiliates: Affiliate[] = [
  {
    id: "1",
    name: "Sarah Chen",
    platform: "Instagram",
    handle: "@glowwithsarah",
    followers: 124000,
    engagementRate: 4.2,
    niche: "Skincare, clean beauty",
    status: "New",
    clientId: null,
    notes: "",
    addedAt: "2025-02-20T10:00:00Z",
    profileUrl: "https://instagram.com/glowwithsarah",
  },
  {
    id: "2",
    name: "Maya Rodriguez",
    platform: "TikTok",
    handle: "@mayaskin",
    followers: 89000,
    engagementRate: 6.8,
    niche: "DTC skincare routines",
    status: "Contacted",
    clientId: "jake",
    notes: "Replied 2/18, interested in brand deal",
    addedAt: "2025-02-15T14:30:00Z",
    profileUrl: "https://tiktok.com/@mayaskin",
  },
  {
    id: "3",
    name: "James Park",
    platform: "YouTube",
    handle: "JamesParkBeauty",
    followers: 256000,
    engagementRate: 3.1,
    niche: "Skincare reviews, ecomm",
    status: "Responded",
    clientId: null,
    notes: "Waiting on rate card",
    addedAt: "2025-02-10T09:15:00Z",
    profileUrl: "https://youtube.com/@JamesParkBeauty",
  },
  {
    id: "4",
    name: "Elena Vasquez",
    platform: "Instagram",
    handle: "@elenabeautyco",
    followers: 67000,
    engagementRate: 5.4,
    niche: "Clean beauty, DTC brands",
    status: "Onboarded",
    clientId: "sean",
    notes: "Live 3/1, code ELENA15",
    addedAt: "2025-01-28T11:00:00Z",
    profileUrl: "https://instagram.com/elenabeautyco",
  },
  {
    id: "5",
    name: "David Kim",
    platform: "TikTok",
    handle: "@davidk.skincare",
    followers: 178000,
    engagementRate: 7.2,
    niche: "Skincare, acne",
    status: "Declined",
    clientId: null,
    notes: "Not taking new collabs until Q2",
    addedAt: "2025-02-05T16:45:00Z",
    profileUrl: "https://tiktok.com/@davidk.skincare",
  },
  {
    id: "6",
    name: "Nina Foster",
    platform: "Instagram",
    handle: "@ninafosterbeauty",
    followers: 94000,
    engagementRate: 4.8,
    niche: "Ecomm, lifestyle",
    status: "Contacted",
    clientId: null,
    notes: "",
    addedAt: "2025-02-12T08:20:00Z",
    profileUrl: "https://instagram.com/ninafosterbeauty",
  },
  {
    id: "7",
    name: "Alex Rivera",
    platform: "YouTube",
    handle: "AlexRiveraSkin",
    followers: 412000,
    engagementRate: 2.9,
    niche: "Skincare science, DTC",
    status: "Responded",
    clientId: "leo",
    notes: "Asking for product sample first",
    addedAt: "2025-02-01T13:00:00Z",
    profileUrl: "https://youtube.com/@AlexRiveraSkin",
  },
  {
    id: "8",
    name: "Priya Sharma",
    platform: "TikTok",
    handle: "@priyaglow",
    followers: 52000,
    engagementRate: 8.1,
    niche: "Skincare, Ayurveda",
    status: "New",
    clientId: null,
    notes: "",
    addedAt: "2025-02-22T10:30:00Z",
    profileUrl: "https://tiktok.com/@priyaglow",
  },
  {
    id: "9",
    name: "Chris Morgan",
    platform: "Other",
    handle: "chrismorgan.io",
    followers: 32000,
    engagementRate: 3.5,
    niche: "Skincare blog, affiliate",
    status: "Onboarded",
    clientId: "jake",
    notes: "Blog post + newsletter 2/15",
    addedAt: "2025-01-20T09:00:00Z",
    profileUrl: "https://chrismorgan.io",
  },
];

export const PLATFORMS: AffiliatePlatform[] = ["Instagram", "TikTok", "YouTube", "Other"];
export const STATUSES: AffiliateStatus[] = ["New", "Contacted", "Responded", "Declined", "Onboarded"];
