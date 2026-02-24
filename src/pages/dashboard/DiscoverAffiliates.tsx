import { useState, useRef, useCallback } from "react";
import {
  Search,
  Save,
  Instagram,
  Youtube,
  Mail,
  ExternalLink,
  Plus,
  Send,
  ChevronDown,
  Check,
  Video,
} from "lucide-react";
import { useDiscoverAffiliates, defaultFilters, type DiscoverFilters } from "@/hooks/useDiscoverAffiliates";
import type { AffiliateRow } from "@/lib/supabase";
import {
  PLATFORMS,
  GMV_TIERS,
  NICHE_OPTIONS,
  LAST_ACTIVE_OPTIONS,
  COUNTRIES,
  SORT_OPTIONS,
  FOLLOWER_MIN,
  FOLLOWER_MAX,
  ENGAGEMENT_MAX,
  GMV_BADGE_CLASS,
  type PlatformFilter,
} from "@/lib/discover-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function PlatformIcon({ platform }: { platform: AffiliateRow["platform"] }) {
  switch (platform) {
    case "instagram":
      return <Instagram className="h-3.5 w-3.5" />;
    case "youtube":
      return <Youtube className="h-3.5 w-3.5" />;
    case "tiktok":
      return <Video className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

export default function DiscoverAffiliates() {
  const [filters, setFilters] = useState<DiscoverFilters>(defaultFilters);
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateRow | null>(null);
  const [saveSegmentOpen, setSaveSegmentOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, totalCount, allRows } =
    useDiscoverAffiliates(filters);

  const updateFilters = useCallback((patch: Partial<DiscoverFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (isFetchingNextPage || !hasNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      });
      if (el) observer.current.observe(el);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0 overflow-hidden rounded-lg border border-border bg-background">
      {/* Filters sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-muted/20">
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Platform</Label>
              <ToggleGroup
                type="single"
                value={filters.platform}
                onValueChange={(v) => v && updateFilters({ platform: v as PlatformFilter })}
                className="mt-2 flex flex-wrap gap-1"
              >
                <ToggleGroupItem value="all" size="sm" className="text-xs">
                  All
                </ToggleGroupItem>
                {PLATFORMS.map((p) => (
                  <ToggleGroupItem key={p} value={p} size="sm" className="text-xs capitalize">
                    {p}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Followers: {formatFollowers(filters.followerRange[0])} – {formatFollowers(filters.followerRange[1])}
              </Label>
              <Slider
                className="mt-2"
                min={Math.log10(FOLLOWER_MIN)}
                max={Math.log10(FOLLOWER_MAX)}
                step={0.1}
                value={[
                  Math.log10(filters.followerRange[0]),
                  Math.log10(filters.followerRange[1]),
                ]}
                onValueChange={([a, b]) =>
                  updateFilters({
                    followerRange: [Math.round(10 ** a), Math.round(10 ** b)],
                  })
                }
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Engagement: {filters.engagementRange[0]}% – {filters.engagementRange[1]}%
              </Label>
              <Slider
                className="mt-2"
                min={0}
                max={ENGAGEMENT_MAX}
                step={0.5}
                value={filters.engagementRange}
                onValueChange={(v) => updateFilters({ engagementRange: v as [number, number] })}
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">GMV Tier</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {GMV_TIERS.map((t) => {
                  const on = filters.gmvTiers.includes(t.value);
                  return (
                    <Badge
                      key={t.value}
                      variant="outline"
                      className={cn(
                        "cursor-pointer border text-xs",
                        on ? "bg-primary text-primary-foreground" : ""
                      )}
                      onClick={() =>
                        updateFilters({
                          gmvTiers: on
                            ? filters.gmvTiers.filter((x) => x !== t.value)
                            : [...filters.gmvTiers, t.value],
                        })
                      }
                    >
                      {t.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Niche</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2 flex w-full justify-between border-border">
                    {filters.niches.length ? `${filters.niches.length} selected` : "Select niches"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="Search niche..." />
                    <CommandList>
                      <CommandEmpty>No niche found.</CommandEmpty>
                      <CommandGroup>
                        {NICHE_OPTIONS.map((n) => {
                          const on = filters.niches.includes(n);
                          return (
                            <CommandItem
                              key={n}
                              onSelect={() =>
                                updateFilters({
                                  niches: on
                                    ? filters.niches.filter((x) => x !== n)
                                    : [...filters.niches, n],
                                })
                              }
                            >
                              {on ? <Check className="mr-2 h-4 w-4" /> : <span className="mr-2 w-4" />}
                              {n}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Country</Label>
              <Select
                value={filters.country ?? "all"}
                onValueChange={(v) => updateFilters({ country: v === "all" ? null : v })}
              >
                <SelectTrigger className="mt-2 border-border">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Has Email</Label>
              <Switch
                checked={filters.hasEmail === true}
                onCheckedChange={(v) => updateFilters({ hasEmail: v ? true : null })}
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Last Active</Label>
              <Select
                value={filters.lastActiveDays?.toString() ?? "any"}
                onValueChange={(v) =>
                  updateFilters({ lastActiveDays: v === "any" ? null : parseInt(v, 10) })
                }
              >
                <SelectTrigger className="mt-2 border-border">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {LAST_ACTIVE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value.toString()}>
                      Within {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main: top bar + grid */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <div className="flex shrink-0 items-center gap-4 border-b border-border px-4 py-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bio, niche, handle..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-9 border-border h-9"
            />
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {totalCount != null ? `${totalCount.toLocaleString()} results` : "—"}
          </span>
          <Select
            value={filters.sort}
            onValueChange={(v) => updateFilters({ sort: v as DiscoverFilters["sort"] })}
          >
            <SelectTrigger className="w-[160px] border-border h-9">
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
          <Button size="sm" variant="outline" className="gap-1.5 border-border" onClick={() => setSaveSegmentOpen(true)}>
            <Save className="h-4 w-4" />
            Save as Segment
          </Button>
        </div>

        {/* Results grid */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="border-border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allRows.map((row) => (
                  <Card
                    key={row.id}
                    className="cursor-pointer border-border transition-shadow hover:shadow-md"
                    onClick={() => setSelectedAffiliate(row)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-12 w-12 shrink-0">
                            <AvatarImage src={row.avatar_url ?? undefined} alt={row.handle} />
                            <AvatarFallback className="text-xs">
                              {(row.full_name ?? row.handle).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{row.handle}</p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <PlatformIcon platform={row.platform} />
                              {formatFollowers(row.follower_count)} ·{" "}
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                {row.engagement_rate != null ? `${Number(row.engagement_rate).toFixed(1)}%` : "—"} eng
                              </Badge>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Badge
                          variant="outline"
                          className={cn("text-xs border", GMV_BADGE_CLASS[row.gmv_tier] ?? "")}
                        >
                          {GMV_TIERS.find((t) => t.value === row.gmv_tier)?.label ?? row.gmv_tier}
                        </Badge>
                      </div>
                      {row.niche?.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {row.niche.slice(0, 3).join(", ")}
                          {row.niche.length > 3 ? ` +${row.niche.length - 3} more` : ""}
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-border text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to segment
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Segment
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Quick outreach
                          }}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div ref={lastRef} className="h-4 w-full" />
            {isFetchingNextPage && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Profile drawer */}
      <Sheet open={!!selectedAffiliate} onOpenChange={(open) => !open && setSelectedAffiliate(null)}>
        <SheetContent side="right" className="w-full border-border sm:max-w-lg overflow-y-auto">
          {selectedAffiliate && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedAffiliate.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(selectedAffiliate.full_name ?? selectedAffiliate.handle).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedAffiliate.handle}</p>
                    <p className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                      <PlatformIcon platform={selectedAffiliate.platform} />
                      {formatFollowers(selectedAffiliate.follower_count)} ·{" "}
                      {selectedAffiliate.engagement_rate != null
                        ? `${Number(selectedAffiliate.engagement_rate).toFixed(1)}% engagement`
                        : ""}
                    </p>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {selectedAffiliate.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
                    <p className="text-sm text-foreground">{selectedAffiliate.bio}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Stats</h4>
                  <ul className="text-sm space-y-1">
                    <li>Followers: {formatFollowers(selectedAffiliate.follower_count)}</li>
                    <li>Avg views: {selectedAffiliate.avg_views != null ? formatFollowers(selectedAffiliate.avg_views) : "—"}</li>
                    <li>GMV tier: {GMV_TIERS.find((t) => t.value === selectedAffiliate.gmv_tier)?.label ?? selectedAffiliate.gmv_tier}</li>
                    <li>Country: {selectedAffiliate.country ?? "—"}</li>
                    {selectedAffiliate.email && (
                      <li className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedAffiliate.email}
                      </li>
                    )}
                  </ul>
                </div>
                {selectedAffiliate.niche?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Niche</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAffiliate.niche.map((n) => (
                        <Badge key={n} variant="secondary" className="text-xs">
                          {n}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Top content (examples)</h4>
                  <p className="text-xs text-muted-foreground">
                    Links to top content will appear here once connected to the platform API.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Outreach history (this client)</h4>
                  <p className="text-xs text-muted-foreground">
                    No outreach yet. Use Quick Outreach or Add to Segment to start.
                  </p>
                </div>
                {selectedAffiliate.profile_url && (
                  <Button variant="outline" size="sm" className="w-full gap-2 border-border" asChild>
                    <a href={selectedAffiliate.profile_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      View profile
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
