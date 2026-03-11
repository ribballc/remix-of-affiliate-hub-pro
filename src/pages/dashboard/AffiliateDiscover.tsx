import { useState, useCallback, useEffect } from "react";
import {
  Search,
  Music2,
  Instagram,
  Youtube,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAffiliates,
  useMutateAffiliateStatus,
  useSaveSegment,
  DEFAULT_AFFILIATE_DISCOVER_FILTERS,
  type AffiliateDiscoverFilters,
  type SaveSegmentPayload,
} from "@/hooks/useAffiliates";
import type { AffiliateRow } from "@/lib/supabase";
import { GMV_TIERS, GMV_BADGE_CLASS } from "@/lib/discover-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NICHE_PILLS = [
  "Beauty",
  "Skincare",
  "Fitness",
  "Lifestyle",
  "Health",
  "Wellness",
  "Fashion",
  "Food",
  "Home",
  "Pet",
  "Tech",
  "Baby",
] as const;

const PLATFORMS = [
  { value: "all", label: "All" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
] as const;

const SORT_OPTIONS = [
  { value: "followers", label: "Followers" },
  { value: "engagement", label: "Engagement" },
  { value: "ai_match", label: "AI Match" },
  { value: "added", label: "Added" },
] as const;

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function PlatformIcon({ platform }: { platform: AffiliateRow["platform"] }) {
  switch (platform) {
    case "tiktok":
      return <Music2 className="h-4 w-4" />;
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "youtube":
      return <Youtube className="h-4 w-4" />;
    default:
      return <Music2 className="h-4 w-4" />;
  }
}

function countActiveFilters(f: AffiliateDiscoverFilters): number {
  let n = 0;
  if (f.platform !== "all") n++;
  if (f.followerMin > DEFAULT_AFFILIATE_DISCOVER_FILTERS.followerMin || f.followerMax < DEFAULT_AFFILIATE_DISCOVER_FILTERS.followerMax) n++;
  if (f.gmvTiers.length > 0) n++;
  if (f.niches.length > 0) n++;
  if (f.hasEmail) n++;
  if (f.minEngagement > 0) n++;
  if (f.search.trim()) n++;
  return n;
}

function CreatorCard({
  affiliate,
  onSelect,
  onAddToCrm,
  isAdding,
}: {
  affiliate: AffiliateRow;
  onSelect: () => void;
  onAddToCrm: (e: React.MouseEvent) => void;
  isAdding: boolean;
}) {
  const name = affiliate.full_name || affiliate.handle || "Creator";
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const eng = affiliate.engagement_rate != null ? (Number(affiliate.engagement_rate) * 100).toFixed(1) : "—";

  return (
    <article
      className="section-card p-4 cursor-pointer hover:border-primary/40 transition-all"
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 rounded-full border-2 border-border shrink-0 bg-primary/20 text-primary font-bold flex items-center justify-center">
          <AvatarImage src={affiliate.avatar_url ?? undefined} alt={name} />
          <AvatarFallback className="rounded-full bg-primary/20 text-primary text-sm">
            {initials || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground truncate">{name}</span>
            <span className="text-muted-foreground text-sm truncate">{affiliate.handle}</span>
            <PlatformIcon platform={affiliate.platform} />
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {formatFollowers(affiliate.follower_count)}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{eng}%</span>
            {affiliate.gmv_tier && affiliate.gmv_tier !== "none" && (
              <Badge
                variant="outline"
                className={cn("text-xs border", GMV_BADGE_CLASS[affiliate.gmv_tier] ?? "")}
              >
                {GMV_TIERS.find((t) => t.value === affiliate.gmv_tier)?.label ?? affiliate.gmv_tier}
              </Badge>
            )}
          </div>
          {affiliate.ai_match_score != null && Number(affiliate.ai_match_score) > 0 && (
            <div className="mt-2">
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min(100, Number(affiliate.ai_match_score))}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI Match: {Math.round(Number(affiliate.ai_match_score))}%
              </p>
            </div>
          )}
          {affiliate.niche?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {affiliate.niche.slice(0, 3).map((n) => (
                <span
                  key={n}
                  className="rounded-full bg-muted text-muted-foreground text-xs px-2 py-0.5"
                >
                  {n}
                </span>
              ))}
            </div>
          )}
          <Button
            size="sm"
            className="mt-3 bg-primary text-white text-xs rounded-lg px-3 py-1.5 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCrm(e);
            }}
            disabled={isAdding}
          >
            {isAdding ? "Adding…" : "Add to CRM"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function AffiliateDiscover() {
  const [filters, setFilters] = useState<AffiliateDiscoverFilters>(DEFAULT_AFFILIATE_DISCOVER_FILTERS);
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateRow | null>(null);
  const [saveSegmentOpen, setSaveSegmentOpen] = useState(false);
  const [segmentName, setSegmentName] = useState("");

  const { data, total, isLoading, isError, error, refetch } = useAffiliates(filters);
  const addToCrm = useMutateAffiliateStatus();
  const saveSegment = useSaveSegment();

  useEffect(() => {
    if (isError && error) {
      toast.error(error instanceof Error ? error.message : "Failed to load creators");
    }
  }, [isError, error]);

  const activeCount = countActiveFilters(filters);
  const clearFilters = useCallback(() => setFilters(DEFAULT_AFFILIATE_DISCOVER_FILTERS), []);

  const handleAddToCrm = useCallback(
    async (affiliateId: string) => {
      try {
        await addToCrm.mutateAsync(affiliateId);
        toast.success("Added to CRM");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to add to CRM");
      }
    },
    [addToCrm]
  );

  const handleSaveSegment = useCallback(async () => {
    const name = segmentName.trim();
    if (!name) {
      toast.error("Segment name is required");
      return;
    }
    try {
      const payload: SaveSegmentPayload = {
        name,
        filterRules: filters,
        matchCount: total,
      };
      await saveSegment.mutateAsync(payload);
      toast.success("Segment saved!");
      setSaveSegmentOpen(false);
      setSegmentName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save segment");
    }
  }, [segmentName, filters, total, saveSegment]);

  return (
    <div className="flex gap-6">
      {/* Filter sidebar */}
      <aside className="w-72 shrink-0">
        <div className="section-card sticky top-0 p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Filters {activeCount > 0 ? `(${activeCount})` : ""}
            </h2>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Platform</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, platform: p.value }))}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm transition-colors",
                    filters.platform === p.value
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Follower range</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                min={0}
                value={filters.followerMin === 0 ? "" : filters.followerMin}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    followerMin: e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
                placeholder="Min"
                className="border-border"
              />
              <span className="text-muted-foreground text-sm">K</span>
              <Input
                type="number"
                min={0}
                value={filters.followerMax === 10_000_000 ? "" : filters.followerMax}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    followerMax: e.target.value === "" ? 10_000_000 : Number(e.target.value),
                  }))
                }
                placeholder="Max"
                className="border-border"
              />
              <span className="text-muted-foreground text-sm">K</span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">GMV tier</Label>
            <div className="space-y-2 mt-2">
              {GMV_TIERS.map((t) => (
                <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.gmvTiers.includes(t.value)}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        gmvTiers: checked
                          ? [...prev.gmvTiers, t.value]
                          : prev.gmvTiers.filter((x) => x !== t.value),
                      }))
                    }
                  />
                  <span className="text-sm">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Niches</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {NICHE_PILLS.map((n) => {
                const selected = filters.niches.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        niches: selected ? prev.niches.filter((x) => x !== n) : [...prev.niches, n],
                      }))
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-sm border transition-colors",
                      selected
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Has verified email</Label>
            <Switch
              checked={filters.hasEmail}
              onCheckedChange={(v) => setFilters((prev) => ({ ...prev, hasEmail: v }))}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Min engagement %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={filters.minEngagement === 0 ? "" : filters.minEngagement}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minEngagement: e.target.value === "" ? 0 : Number(e.target.value),
                }))
              }
              placeholder="0"
              className="border-border mt-2"
            />
          </div>

          <Button variant="outline" className="w-full" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search handle, name..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-9 border-border"
            />
          </div>
          <span className="text-sm text-muted-foreground">{total} creators found</span>
          <Select
            value={filters.sort}
            onValueChange={(v) =>
              setFilters((prev) => ({ ...prev, sort: v as AffiliateDiscoverFilters["sort"] }))
            }
          >
            <SelectTrigger className="w-[140px] border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSaveSegmentOpen(true)}>
            <Save className="h-4 w-4 mr-1" />
            Save segment
          </Button>
        </div>

        {isError && (
          <div className="section-card p-6 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error instanceof Error ? error.message : "Failed to load creators"}</p>
          </div>
        )}

        {!isError && isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!isError && !isLoading && data.length === 0 && (
          <div className="section-card p-12 text-center text-muted-foreground">
            <p className="font-medium">No creators found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {!isError && !isLoading && data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((affiliate) => (
              <CreatorCard
                key={affiliate.id}
                affiliate={affiliate}
                onSelect={() => setSelectedAffiliate(affiliate)}
                onAddToCrm={() => handleAddToCrm(affiliate.id)}
                isAdding={addToCrm.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile sheet */}
      <Sheet open={!!selectedAffiliate} onOpenChange={(open) => !open && setSelectedAffiliate(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] border-border">
          {selectedAffiliate && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage src={selectedAffiliate.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {(selectedAffiliate.full_name || selectedAffiliate.handle || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedAffiliate.full_name || selectedAffiliate.handle}
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-4">
                <div className="space-y-4 text-sm">
                  <p className="text-muted-foreground">{selectedAffiliate.handle}</p>
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={selectedAffiliate.platform} />
                    <span>{formatFollowers(selectedAffiliate.follower_count)} followers</span>
                    <span>{selectedAffiliate.engagement_rate != null ? (Number(selectedAffiliate.engagement_rate) * 100).toFixed(1) : "—"}% engagement</span>
                  </div>
                  {selectedAffiliate.gmv_tier && selectedAffiliate.gmv_tier !== "none" && (
                    <Badge variant="outline" className={GMV_BADGE_CLASS[selectedAffiliate.gmv_tier]}>
                      {GMV_TIERS.find((t) => t.value === selectedAffiliate.gmv_tier)?.label}
                    </Badge>
                  )}
                  {selectedAffiliate.bio && (
                    <p className="text-muted-foreground">{selectedAffiliate.bio}</p>
                  )}
                  {selectedAffiliate.niche?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedAffiliate.niche.map((n) => (
                        <span key={n} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedAffiliate.profile_url && (
                    <a
                      href={selectedAffiliate.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View profile
                    </a>
                  )}
                  <Button
                    size="sm"
                    className="mt-2 bg-primary text-white"
                    onClick={() => {
                      handleAddToCrm(selectedAffiliate.id);
                      setSelectedAffiliate(null);
                    }}
                    disabled={addToCrm.isPending}
                  >
                    Add to CRM
                  </Button>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Save segment dialog */}
      <Dialog open={saveSegmentOpen} onOpenChange={setSaveSegmentOpen}>
        <DialogContent className="border-border">
          <DialogHeader>
            <DialogTitle>Save segment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Current filters (read-only):</p>
            <div className="flex flex-wrap gap-2">
              {filters.platform !== "all" && (
                <Badge variant="secondary">{filters.platform}</Badge>
              )}
              {(filters.gmvTiers.length > 0 || filters.niches.length > 0) && (
                <>
                  {filters.gmvTiers.map((g) => (
                    <Badge key={g} variant="secondary">
                      {GMV_TIERS.find((t) => t.value === g)?.label ?? g}
                    </Badge>
                  ))}
                  {filters.niches.map((n) => (
                    <Badge key={n} variant="secondary">
                      {n}
                    </Badge>
                  ))}
                </>
              )}
              {filters.hasEmail && <Badge variant="secondary">Has email</Badge>}
              {filters.minEngagement > 0 && (
                <Badge variant="secondary">Eng ≥ {filters.minEngagement}%</Badge>
              )}
              {filters.search.trim() && (
                <Badge variant="secondary">Search: {filters.search}</Badge>
              )}
            </div>
            <p className="text-sm font-medium">
              {total} creators match these filters
            </p>
            <Label>Segment name</Label>
            <Input
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              placeholder="e.g. Skincare nano"
              className="border-border"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveSegmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSegment} disabled={saveSegment.isPending || !segmentName.trim()}>
              {saveSegment.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
