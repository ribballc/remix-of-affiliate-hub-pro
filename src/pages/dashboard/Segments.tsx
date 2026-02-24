import { useState, useMemo, useCallback } from "react";
import {
  ArrowUpDown,
  Download,
  Send,
  Trash2,
  FolderInput,
  Sparkles,
} from "lucide-react";
import {
  Segment,
  SegmentTemplate,
  MOCK_AFFILIATES,
  applyFilterRules,
  segmentHealth,
  platformBreakdown,
  SEGMENT_TEMPLATES,
} from "@/lib/segments";
import type { AffiliateRow } from "@/lib/supabase";
import { GMV_TIERS } from "@/lib/discover-constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
  return d.toLocaleDateString();
}

type SortKey = "handle" | "platform" | "followers" | "engagement" | "gmv" | "email" | "last_active";

function sortAffiliates(rows: AffiliateRow[], key: SortKey, dir: "asc" | "desc"): AffiliateRow[] {
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "handle":
        cmp = (a.handle ?? "").localeCompare(b.handle ?? "");
        break;
      case "platform":
        cmp = a.platform.localeCompare(b.platform);
        break;
      case "followers":
        cmp = a.follower_count - b.follower_count;
        break;
      case "engagement":
        cmp = (a.engagement_rate ?? 0) - (b.engagement_rate ?? 0);
        break;
      case "gmv":
        cmp = GMV_TIERS.findIndex((t) => t.value === a.gmv_tier) - GMV_TIERS.findIndex((t) => t.value === b.gmv_tier);
        break;
      case "email":
        cmp = (a.email ? 1 : 0) - (b.email ? 1 : 0);
        break;
      case "last_active":
        cmp = (a.last_active ?? "").localeCompare(b.last_active ?? "");
        break;
      default:
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

function exportCsv(affiliates: AffiliateRow[]) {
  const headers = ["Handle", "Platform", "Followers", "Engagement %", "GMV Tier", "Email"];
  const rows = affiliates.map((a) =>
    [
      a.handle,
      a.platform,
      a.follower_count,
      a.engagement_rate != null ? (Number(a.engagement_rate) * 100).toFixed(1) : "",
      a.gmv_tier,
      a.email ?? "",
    ].join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `segment-export-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [detailSort, setDetailSort] = useState<SortKey>("followers");
  const [detailSortDir, setDetailSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveTargetSegmentId, setMoveTargetSegmentId] = useState<string | null>(null);

  const members = useMemo(() => {
    if (!selectedSegment) return [];
    return selectedSegment.memberIds
      .map((id) => MOCK_AFFILIATES.find((a) => a.id === id))
      .filter(Boolean) as AffiliateRow[];
  }, [selectedSegment]);

  const sortedMembers = useMemo(
    () => sortAffiliates(members, detailSort, detailSortDir),
    [members, detailSort, detailSortDir]
  );

  const health = useMemo(() => segmentHealth(members), [members]);
  const platformPct = useMemo(() => platformBreakdown(members), [members]);
  const avgEngagement = useMemo(() => {
    if (members.length === 0) return 0;
    const sum = members.reduce((s, a) => s + (a.engagement_rate != null ? Number(a.engagement_rate) * 100 : 0), 0);
    return (sum / members.length).toFixed(1);
  }, [members]);
  const avgFollowers = useMemo(() => {
    if (members.length === 0) return 0;
    const sum = members.reduce((s, a) => s + a.follower_count, 0);
    return Math.round(sum / members.length);
  }, [members]);

  const activateTemplate = useCallback((t: SegmentTemplate) => {
    const ids = applyFilterRules(MOCK_AFFILIATES, t.filter_rules);
    const newSegment: Segment = {
      id: `seg-${Date.now()}`,
      name: t.name,
      type: "dynamic",
      filter_rules: t.filter_rules,
      memberIds: ids,
      updatedAt: new Date().toISOString(),
    };
    setSegments((prev) => [...prev, newSegment]);
    toast.success(`Segment "${t.name}" created with ${ids.length} affiliates`);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === sortedMembers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(sortedMembers.map((a) => a.id)));
  }, [sortedMembers, selectedIds.size]);

  const handleRemoveSelected = useCallback(() => {
    if (!selectedSegment || selectedIds.size === 0) return;
    setSegments((prev) =>
      prev.map((s) =>
        s.id === selectedSegment.id
          ? { ...s, memberIds: s.memberIds.filter((id) => !selectedIds.has(id)), updatedAt: new Date().toISOString() }
          : s
      )
    );
    setSelectedSegment((s) =>
      s
        ? {
            ...s,
            memberIds: s.memberIds.filter((id) => !selectedIds.has(id)),
            updatedAt: new Date().toISOString(),
          }
        : null
    );
    setSelectedIds(new Set());
    toast.success("Removed selected affiliates");
  }, [selectedSegment, selectedIds]);

  const handleMoveToSegment = useCallback(() => {
    if (!selectedSegment || !moveTargetSegmentId || selectedIds.size === 0) return;
    const target = segments.find((s) => s.id === moveTargetSegmentId);
    if (!target) return;
    const toMove = [...selectedIds];
    setSegments((prev) =>
      prev.map((s) => {
        if (s.id === selectedSegment.id)
          return {
            ...s,
            memberIds: s.memberIds.filter((id) => !toMove.includes(id)),
            updatedAt: new Date().toISOString(),
          };
        if (s.id === moveTargetSegmentId)
          return {
            ...s,
            memberIds: [...new Set([...s.memberIds, ...toMove])],
            updatedAt: new Date().toISOString(),
          };
        return s;
      })
    );
    setSelectedSegment((s) =>
      s && s.id === selectedSegment.id
        ? { ...s, memberIds: s.memberIds.filter((id) => !toMove.includes(id)), updatedAt: new Date().toISOString() }
        : s
    );
    setSelectedIds(new Set());
    setMoveTargetSegmentId(null);
    toast.success(`Moved ${toMove.length} to "${target.name}"`);
  }, [selectedSegment, moveTargetSegmentId, selectedIds, segments]);

  const handleSort = useCallback((key: SortKey) => {
    setDetailSort(key);
    setDetailSortDir((d) => (detailSort === key ? (d === "asc" ? "desc" : "asc") : "desc"));
  }, [detailSort]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Segments</h1>
        <p className="text-muted-foreground mt-1">
          Dynamic (filter-based) and manual segments for outreach.
        </p>
      </div>

      {/* Pre-built templates */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Smart segment templates
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SEGMENT_TEMPLATES.map((t) => (
            <Card key={t.id} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium leading-tight">{t.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full" onClick={() => activateTemplate(t)}>
                  Activate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Segment cards */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Your segments</h2>
        {segments.length === 0 ? (
          <Card className="border-border border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No segments yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Activate a template above or create one from Discover.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map((seg) => {
              const segMembers = seg.memberIds
                .map((id) => MOCK_AFFILIATES.find((a) => a.id === id))
                .filter(Boolean) as AffiliateRow[];
              const pct = platformBreakdown(segMembers);
              const avgEng =
                segMembers.length === 0
                  ? 0
                  : (
                      segMembers.reduce((s, a) => s + (a.engagement_rate != null ? Number(a.engagement_rate) * 100 : 0), 0) /
                      segMembers.length
                    ).toFixed(1);
              const avgFol =
                segMembers.length === 0 ? 0 : Math.round(segMembers.reduce((s, a) => s + a.follower_count, 0) / segMembers.length);
              return (
                <Card
                  key={seg.id}
                  className="cursor-pointer border-border transition-shadow hover:shadow-md"
                  onClick={() => {
                    setSelectedSegment(seg);
                    setSelectedIds(new Set());
                    setMoveTargetSegmentId(null);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold leading-tight">{seg.name}</CardTitle>
                      <Badge variant={seg.type === "dynamic" ? "default" : "secondary"} className="shrink-0 text-[10px]">
                        {seg.type === "dynamic" ? "Auto" : "Manual"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{seg.memberIds.length}</p>
                    <p className="text-xs text-muted-foreground">affiliates</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      TikTok {pct.tiktok}% / IG {pct.instagram}% / YouTube {pct.youtube}%
                    </p>
                    <p>Avg engagement: {avgEng}% · Avg followers: {formatFollowers(avgFol)}</p>
                    <p>Updated {formatDate(seg.updatedAt)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Segment detail sheet */}
      <Sheet open={!!selectedSegment} onOpenChange={(open) => !open && setSelectedSegment(null)}>
        <SheetContent side="right" className="w-full border-border sm:max-w-4xl overflow-hidden flex flex-col p-0">
          {selectedSegment && (
            <>
              <SheetHeader className="p-6 pb-4 border-b border-border">
                <SheetTitle className="flex items-center justify-between">
                  <span>{selectedSegment.name}</span>
                  <Badge variant={selectedSegment.type === "dynamic" ? "default" : "secondary"}>
                    {selectedSegment.type === "dynamic" ? "Auto" : "Manual"}
                  </Badge>
                </SheetTitle>
                <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                  <span>{members.length} affiliates</span>
                  <span>TikTok {platformPct.tiktok}% / IG {platformPct.instagram}% / YT {platformPct.youtube}%</span>
                  <span>Avg eng: {avgEngagement}% · Avg followers: {formatFollowers(avgFollowers)}</span>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Segment Health</p>
                  <div className="flex items-center gap-2">
                    <Progress value={health} className="h-2 flex-1" />
                    <span className="text-sm font-medium tabular-nums">{health}/100</span>
                  </div>
                </div>
              </SheetHeader>

              {/* Bulk actions */}
              <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border bg-muted/30">
                <Button size="sm" variant="outline" className="gap-1.5 border-border" disabled={selectedIds.size === 0}>
                  <Send className="h-3.5 w-3.5" />
                  Launch Outreach Campaign
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 border-border" onClick={() => exportCsv(sortedMembers)}>
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-border text-destructive hover:text-destructive"
                  disabled={selectedIds.size === 0}
                  onClick={handleRemoveSelected}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove Selected
                </Button>
                <div className="flex items-center gap-2">
                  <Select value={moveTargetSegmentId ?? ""} onValueChange={(v) => setMoveTargetSegmentId(v || null)}>
                    <SelectTrigger className="w-[200px] h-8 border-border text-xs">
                      <SelectValue placeholder="Move to segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments
                        .filter((s) => s.id !== selectedSegment.id)
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-border"
                    disabled={!moveTargetSegmentId || selectedIds.size === 0}
                    onClick={handleMoveToSegment}
                  >
                    <FolderInput className="h-3.5 w-3.5" />
                    Move
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedIds.size === sortedMembers.length && sortedMembers.length > 0}
                          onCheckedChange={selectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>
                        <button type="button" className="flex items-center gap-1 font-medium" onClick={() => handleSort("handle")}>
                          Handle <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" className="flex items-center gap-1 font-medium" onClick={() => handleSort("platform")}>
                          Platform <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" className="flex items-center gap-1 font-medium" onClick={() => handleSort("followers")}>
                          Followers <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" className="flex items-center gap-1 font-medium" onClick={() => handleSort("engagement")}>
                          Engagement <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" className="flex items-center gap-1 font-medium" onClick={() => handleSort("gmv")}>
                          GMV <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" className="flex items-center gap-1 font-medium" onClick={() => handleSort("email")}>
                          Email <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" className="flex items-center gap-1 font-medium" onClick={() => handleSort("last_active")}>
                          Last Active <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMembers.map((a) => (
                      <TableRow key={a.id} className="border-border">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(a.id)}
                            onCheckedChange={() => toggleSelect(a.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${a.handle}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{a.handle}</TableCell>
                        <TableCell className="capitalize">{a.platform}</TableCell>
                        <TableCell>{formatFollowers(a.follower_count)}</TableCell>
                        <TableCell>
                          {a.engagement_rate != null ? `${(Number(a.engagement_rate) * 100).toFixed(1)}%` : "—"}
                        </TableCell>
                        <TableCell>{GMV_TIERS.find((t) => t.value === a.gmv_tier)?.label ?? a.gmv_tier}</TableCell>
                        <TableCell>{a.email ? "Yes" : "—"}</TableCell>
                        <TableCell>{a.last_active ? formatDate(a.last_active) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
