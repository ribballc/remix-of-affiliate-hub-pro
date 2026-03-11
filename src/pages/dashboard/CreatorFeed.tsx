import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ExternalLink,
  Send,
  Video,
  Instagram,
  Youtube,
  Link2,
  BarChart3,
  Heart,
  Calendar,
  FileVideo,
  TrendingUp,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  creatorFeedItems,
  GMV_LABELS,
  GMV_BADGE_CLASS,
  mapTikTokCreatorToFeedItem,
  type CreatorFeedItem,
  type FeedSortKey,
  type GmvTier,
} from "@/data/creatorFeed";
import { fetchTikTokCreators } from "@/lib/tiktokApi";
import { PLATFORMS, STATUSES, type AffiliatePlatform, type AffiliateStatus } from "@/data/affiliates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASS: Record<AffiliateStatus, string> = {
  New: "bg-muted text-muted-foreground border-muted-foreground/30",
  Contacted: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Responded: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Declined: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  Onboarded: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString();
}

function getProfileUrl(c: CreatorFeedItem): string {
  if (c.profileUrl) return c.profileUrl;
  switch (c.platform) {
    case "Instagram":
      return `https://instagram.com/${c.handle.replace(/^@/, "")}`;
    case "TikTok":
      return `https://tiktok.com/${c.handle}`;
    case "YouTube":
      return `https://youtube.com/@${c.handle}`;
    default:
      return "#";
  }
}

function PlatformIcon({ platform }: { platform: AffiliatePlatform }) {
  switch (platform) {
    case "Instagram":
      return <Instagram className="h-3.5 w-3.5" />;
    case "YouTube":
      return <Youtube className="h-3.5 w-3.5" />;
    case "TikTok":
      return <Video className="h-3.5 w-3.5" />;
    default:
      return <Link2 className="h-3.5 w-3.5" />;
  }
}

const SORT_OPTIONS: { value: FeedSortKey; label: string }[] = [
  { value: "followers", label: "Followers" },
  { value: "engagement", label: "Engagement" },
  { value: "avgViews", label: "Avg. views" },
  { value: "contentCount", label: "Content count" },
  { value: "gmv", label: "GMV tier" },
  { value: "lastActive", label: "Last active" },
];

function CreatorCard({ creator }: { creator: CreatorFeedItem }) {
  const a = creator.analytics;
  return (
    <article className="section-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-5">
        <div className="flex items-center gap-3 shrink-0">
          <Avatar className="h-14 w-14 rounded-xl border-2 border-border">
            <AvatarImage src={creator.avatarUrl} alt={creator.name} />
            <AvatarFallback className="rounded-xl bg-muted text-foreground text-lg">
              {creator.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="sm:hidden">
            <p className="font-semibold text-foreground">{creator.name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <PlatformIcon platform={creator.platform} />
              {creator.handle}
            </p>
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground">{creator.name}</p>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <PlatformIcon platform={creator.platform} />
              {creator.handle}
            </span>
            <Badge variant="outline" className={cn("border", STATUS_BADGE_CLASS[creator.status])}>
              {creator.status}
            </Badge>
            <Badge variant="outline" className={cn("border", GMV_BADGE_CLASS[a.gmvTier])}>
              {GMV_LABELS[a.gmvTier]}
            </Badge>
          </div>
          <div className="flex sm:hidden gap-2 flex-wrap">
            <Badge variant="outline" className={cn("border", STATUS_BADGE_CLASS[creator.status])}>
              {creator.status}
            </Badge>
            <Badge variant="outline" className={cn("border", GMV_BADGE_CLASS[a.gmvTier])}>
              {GMV_LABELS[a.gmvTier]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{creator.niche}</p>

          {/* Creator analytics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="stat-card">
              <p className="stat-number">{formatNumber(creator.followers)}</p>
              <p className="stat-label">Followers</p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{creator.engagementRate}%</p>
              <p className="stat-label">Engagement</p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{formatNumber(a.avgViews)}</p>
              <p className="stat-label flex items-center gap-1">
                <BarChart3 className="h-3 w-3" /> Avg views
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{a.contentCount}</p>
              <p className="stat-label flex items-center gap-1">
                <FileVideo className="h-3 w-3" /> Content
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{formatNumber(a.totalLikes)}</p>
              <p className="stat-label flex items-center gap-1">
                <Heart className="h-3 w-3" /> Likes
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{formatDate(a.lastActive)}</p>
              <p className="stat-label flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Last active
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {a.collaborationCount} collabs
            </span>
            {creator.postFulfillRate != null && (
              <span>Fulfill rate: {(creator.postFulfillRate * 100).toFixed(0)}%</span>
            )}
            {creator.gmv30d != null && creator.gmv30d > 0 && (
              <span>GMV 30d: ${(creator.gmv30d / 1000).toFixed(1)}K</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <a href={getProfileUrl(creator)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                View profile
              </a>
            </Button>
            <Button variant="default" size="sm" className="gap-1">
              <Send className="h-3.5 w-3.5" />
              Quick outreach
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CreatorFeed() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [gmvTier, setGmvTier] = useState<string>("all");
  const [sort, setSort] = useState<FeedSortKey>("lastActive");
  const [source, setSource] = useState<"local" | "tiktok">("local");

  const {
    data: tiktokData,
    isLoading: tiktokLoading,
    isError: tiktokError,
    refetch: refetchTikTok,
    isFetching: tiktokFetching,
  } = useQuery({
    queryKey: ["tiktok-creators"],
    queryFn: fetchTikTokCreators,
    enabled: source === "tiktok",
    staleTime: 1000 * 60 * 5,
  });

  const tiktokFeedItems: CreatorFeedItem[] = useMemo(
    () => (tiktokData?.creators ?? []).map(mapTikTokCreatorToFeedItem),
    [tiktokData]
  );

  const baseList = source === "tiktok" ? tiktokFeedItems : creatorFeedItems;

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = baseList.filter((c) => {
      if (platform !== "all" && c.platform !== platform) return false;
      if (status !== "all" && c.status !== status) return false;
      if (gmvTier !== "all" && c.analytics.gmvTier !== gmvTier) return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.handle.toLowerCase().includes(q) &&
        !c.niche.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case "followers":
          cmp = a.followers - b.followers;
          break;
        case "engagement":
          cmp = a.engagementRate - b.engagementRate;
          break;
        case "avgViews":
          cmp = a.analytics.avgViews - b.analytics.avgViews;
          break;
        case "contentCount":
          cmp = a.analytics.contentCount - b.analytics.contentCount;
          break;
        case "gmv": {
          const order: GmvTier[] = ["none", "under_5k", "5k_25k", "25k_100k", "100k_plus"];
          cmp = order.indexOf(a.analytics.gmvTier) - order.indexOf(b.analytics.gmvTier);
          break;
        }
        case "lastActive":
          cmp = new Date(a.analytics.lastActive).getTime() - new Date(b.analytics.lastActive).getTime();
          break;
        default:
          break;
      }
      return -cmp; // desc: newest / highest first
    });
    return list;
  }, [baseList, search, platform, status, gmvTier, sort]);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="page-header flex-wrap gap-4">
        <div>
          <h1 className="page-title">Creator Feed</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All creators with analytics — TikTok Shop open collaboration style
          </p>
        </div>
        <Link to="/dashboard/affiliates">
          <Button variant="outline" size="sm">
            Back to Affiliates
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Source:</span>
          <Button
            variant={source === "local" ? "default" : "outline"}
            size="sm"
            onClick={() => setSource("local")}
          >
            Local
          </Button>
          <Button
            variant={source === "tiktok" ? "default" : "outline"}
            size="sm"
            onClick={() => setSource("tiktok")}
            disabled={tiktokLoading || tiktokFetching}
          >
            {tiktokLoading || tiktokFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Video className="h-4 w-4 mr-1" />
            )}
            From TikTok
          </Button>
          {source === "tiktok" && (
            <Button variant="ghost" size="icon" onClick={() => refetchTikTok()} disabled={tiktokFetching}>
              <RefreshCw className={tiktokFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
          )}
        </div>
      </div>
      {source === "tiktok" && tiktokError && (
        <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          TikTok API unavailable. Start the API server with <code className="bg-muted px-1 rounded">npm run server</code> and ensure .env has TIKTOK_SHOP_APP_KEY and TIKTOK_SHOP_APP_SECRET.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search name, handle, niche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-border"
          />
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-[130px] border-border">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[130px] border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={gmvTier} onValueChange={setGmvTier}>
          <SelectTrigger className="w-[130px] border-border">
            <SelectValue placeholder="GMV" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All GMV</SelectItem>
            {(Object.keys(GMV_LABELS) as GmvTier[]).map((t) => (
              <SelectItem key={t} value={t}>
                {GMV_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as FeedSortKey)}>
          <SelectTrigger className="w-[140px] border-border">
            <Filter className="h-4 w-4 mr-1.5" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredAndSorted.length} creator{filteredAndSorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* TikTok-style vertical feed */}
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-4 pb-6 max-w-4xl">
          {filteredAndSorted.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
          {filteredAndSorted.length === 0 && (
            <div className="section-card p-12 text-center text-muted-foreground">
              No creators match your filters. Try adjusting search or filters.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
