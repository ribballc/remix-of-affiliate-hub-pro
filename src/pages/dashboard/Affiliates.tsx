import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowUpDown,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Send,
  Compass,
  FolderGit2,
} from "lucide-react";
import {
  affiliates as initialAffiliates,
  PLATFORMS,
  STATUSES,
  type Affiliate,
  type AffiliatePlatform,
  type AffiliateStatus,
} from "@/data/affiliates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SortKey =
  | "name"
  | "platform"
  | "handle"
  | "followers"
  | "engagementRate"
  | "niche"
  | "status"
  | "addedAt";

const STATUS_BADGE_CLASS: Record<AffiliateStatus, string> = {
  New: "bg-muted text-muted-foreground border-muted-foreground/30",
  Contacted: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Responded: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Declined: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  Onboarded: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function getProfileUrl(a: Affiliate): string {
  if (a.profileUrl) return a.profileUrl;
  switch (a.platform) {
    case "Instagram":
      return `https://instagram.com/${a.handle.replace(/^@/, "")}`;
    case "TikTok":
      return `https://tiktok.com/${a.handle}`;
    case "YouTube":
      return `https://youtube.com/@${a.handle}`;
    default:
      return "#";
  }
}

const addSchema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.enum(["Instagram", "TikTok", "YouTube", "Other"]),
  handle: z.string().min(1, "Handle is required"),
  followers: z.coerce.number().min(0),
  engagementRate: z.coerce.number().min(0).max(100),
  niche: z.string().min(1, "Niche is required"),
  status: z.enum(["New", "Contacted", "Responded", "Declined", "Onboarded"]),
  notes: z.string().optional(),
});

const editSchema = z.object({
  status: z.enum(["New", "Contacted", "Responded", "Declined", "Onboarded"]),
  notes: z.string().optional(),
});

type AddFormValues = z.infer<typeof addSchema>;
type EditFormValues = z.infer<typeof editSchema>;

export default function DashboardAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(initialAffiliates);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("addedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addForm = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      name: "",
      platform: "Instagram",
      handle: "",
      followers: 0,
      engagementRate: 0,
      niche: "",
      status: "New",
      notes: "",
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { status: "New", notes: "" },
  });

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = affiliates.filter((a) => {
      if (platformFilter !== "all" && a.platform !== platformFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (
        q &&
        !a.name.toLowerCase().includes(q) &&
        !a.handle.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "platform":
          cmp = a.platform.localeCompare(b.platform);
          break;
        case "handle":
          cmp = a.handle.localeCompare(b.handle);
          break;
        case "followers":
          cmp = a.followers - b.followers;
          break;
        case "engagementRate":
          cmp = a.engagementRate - b.engagementRate;
          break;
        case "niche":
          cmp = a.niche.localeCompare(b.niche);
          break;
        case "status":
          cmp = STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
          break;
        case "addedAt":
          cmp = a.addedAt.localeCompare(b.addedAt);
          break;
        default:
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [affiliates, search, platformFilter, statusFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else setSortKey(key);
  }

  function onAddSubmit(values: AddFormValues) {
    const id = String(Date.now());
    const newAffiliate: Affiliate = {
      id,
      name: values.name.trim(),
      platform: values.platform as AffiliatePlatform,
      handle: values.handle.trim(),
      followers: values.followers,
      engagementRate: values.engagementRate,
      niche: values.niche.trim(),
      status: values.status as AffiliateStatus,
      clientId: null,
      notes: values.notes?.trim() ?? "",
      addedAt: new Date().toISOString(),
    };
    setAffiliates((prev) => [...prev, newAffiliate]);
    addForm.reset();
    setAddOpen(false);
  }

  function openEdit(a: Affiliate) {
    setEditingId(a.id);
    editForm.reset({ status: a.status, notes: a.notes });
    setEditOpen(true);
  }

  function onEditSubmit(values: EditFormValues) {
    if (!editingId) return;
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === editingId
          ? { ...a, status: values.status as AffiliateStatus, notes: values.notes ?? "" }
          : a
      )
    );
    setEditingId(null);
    setEditOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Affiliates
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage affiliate prospects and outreach.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-border h-9"
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[160px] border-border h-9">
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] border-border h-9">
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
        <Button variant="outline" className="gap-2 shrink-0 border-border" asChild>
          <Link to="/dashboard/affiliates/discover">
            <Compass className="h-4 w-4" />
            Discover
          </Link>
        </Button>
        <Button variant="outline" className="gap-2 shrink-0 border-border" asChild>
          <Link to="/dashboard/affiliates/segments">
            <FolderGit2 className="h-4 w-4" />
            Segments
          </Link>
        </Button>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Add Affiliate
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-background sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Affiliate</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(onAddSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input className="border-border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-border">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PLATFORMS.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Handle</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="@handle"
                            className="border-border"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="followers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Followers</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            className="border-border"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="engagementRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engagement %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            className="border-border"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={addForm.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niche</FormLabel>
                      <FormControl>
                        <Input className="border-border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-border">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Input
                          className="border-border"
                          placeholder="Internal notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Affiliate</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("name")}
                >
                  Name
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("platform")}
                >
                  Platform
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("handle")}
                >
                  Handle
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("followers")}
                >
                  Followers
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("engagementRate")}
                >
                  Engagement
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("niche")}
                >
                  Niche
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.map((a) => (
              <TableRow key={a.id} className="border-border">
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{a.platform}</TableCell>
                <TableCell className="text-muted-foreground">{a.handle}</TableCell>
                <TableCell>{formatFollowers(a.followers)}</TableCell>
                <TableCell>{a.engagementRate}%</TableCell>
                <TableCell className="text-muted-foreground">{a.niche}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("border", STATUS_BADGE_CLASS[a.status])}
                  >
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      title="Send Outreach (Instantly placeholder)"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">Outreach</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                      title="View Profile"
                    >
                      <a
                        href={getProfileUrl(a)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Edit status & notes"
                      onClick={() => openEdit(a)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="border-border bg-background sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Affiliate</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input
                        className="border-border"
                        placeholder="Internal notes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
