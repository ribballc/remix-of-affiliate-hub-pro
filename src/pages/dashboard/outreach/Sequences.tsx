import { useState, useCallback } from "react";
import {
  GripVertical,
  Plus,
  Sparkles,
  Trash2,
  Send,
  Mail,
  MessageCircle,
  Target,
  ChevronDown,
} from "lucide-react";
import { Video } from "lucide-react";
import {
  STEP_TYPES,
  SEQUENCE_TYPES,
  MERGE_TAGS,
  DEFAULT_DELIVERY,
  createEmptyStep,
  mockStepStats,
  type SequenceStep,
  type StepTypeValue,
  type SequenceTypeValue,
  type DeliverySettings,
} from "@/lib/sequences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEP_TYPE_ICONS: Record<StepTypeValue, React.ReactNode> = {
  tiktok_dm: <Video className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  ig_dm: <MessageCircle className="h-4 w-4" />,
  targeted_invite: <Target className="h-4 w-4" />,
};

async function mockAiWrite(_stepNumber: number, _stepType: StepTypeValue): Promise<string> {
  await new Promise((r) => setTimeout(r, 800));
  return `Hi {{firstName}},\n\nI noticed your work in {{niche}} and thought you'd be a great fit for {{clientBrand}}. We're looking for creators like you ({{handle}}) to partner with.\n\nWould you be open to a quick chat about {{productName}}? No commitment—just exploring if we align.\n\nBest,\nThe team`;
}

function insertMergeTag(message: string, tag: string, cursorPosition: number): { text: string; newCursor: number } {
  const before = message.slice(0, cursorPosition);
  const after = message.slice(cursorPosition);
  const newText = before + tag + after;
  return { text: newText, newCursor: cursorPosition + tag.length };
}

export default function SequencesPage() {
  const [sequenceType, setSequenceType] = useState<SequenceTypeValue>("cold_outreach");
  const [sequenceName, setSequenceName] = useState("My outreach sequence");
  const [steps, setSteps] = useState<SequenceStep[]>(() => [
    { ...createEmptyStep(), stats: mockStepStats(0) },
  ]);
  const [delivery, setDelivery] = useState<DeliverySettings>(DEFAULT_DELIVERY);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [aiWritingId, setAiWritingId] = useState<string | null>(null);
  const [deliveryOpen, setDeliveryOpen] = useState(true);

  const moveStep = useCallback((from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    setSteps((prev) => {
      const next = [...prev];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      return next;
    });
  }, [steps.length]);

  const updateStep = useCallback((id: string, patch: Partial<SequenceStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const removeStep = useCallback((id: string) => {
    setSteps((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
    if (steps.length <= 1) toast.error("Sequence must have at least one step");
  }, [steps.length]);

  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, { ...createEmptyStep(), stats: mockStepStats(prev.length) }]);
  }, []);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === toIndex) {
      setDraggedIndex(null);
      return;
    }
    moveStep(draggedIndex, toIndex);
    setDraggedIndex(null);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const handleAiWrite = useCallback(async (step: SequenceStep, index: number) => {
    setAiWritingId(step.id);
    try {
      const message = await mockAiWrite(index + 1, step.type);
      updateStep(step.id, { message });
      toast.success("Message generated");
    } catch {
      toast.error("AI write failed");
    } finally {
      setAiWritingId(null);
    }
  }, [updateStep]);

  const insertTag = useCallback((stepId: string, tag: string, textareaRef: HTMLTextAreaElement | null) => {
    if (!textareaRef) return;
    const start = textareaRef.selectionStart;
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    const { text, newCursor } = insertMergeTag(step.message, tag, start);
    updateStep(stepId, { message: text });
    setTimeout(() => {
      textareaRef.focus();
      textareaRef.setSelectionRange(newCursor, newCursor);
    }, 0);
  }, [steps, updateStep]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sequences</h1>
          <p className="text-muted-foreground mt-1">Multi-channel automated sequence builder.</p>
        </div>
      </div>

      {/* Sequence type & name */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Sequence type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={sequenceName}
              onChange={(e) => setSequenceName(e.target.value)}
              placeholder="Sequence name"
              className="mt-1 max-w-md border-border"
            />
          </div>
          <Select value={sequenceType} onValueChange={(v) => setSequenceType(v as SequenceTypeValue)}>
            <SelectTrigger className="w-full max-w-md border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEQUENCE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Delivery settings */}
      <Collapsible open={deliveryOpen} onOpenChange={setDeliveryOpen}>
        <Card className="border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer flex flex-row items-center justify-between">
              <CardTitle className="text-base">Delivery settings</CardTitle>
              <ChevronDown className={cn("h-4 w-4 transition-transform", deliveryOpen && "rotate-180")} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Daily DM limit</Label>
                  <Input
                    type="number"
                    min={1}
                    value={delivery.dailyDmLimit}
                    onChange={(e) => setDelivery((d) => ({ ...d, dailyDmLimit: parseInt(e.target.value, 10) || 0 }))}
                    className="mt-1 border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Daily email limit</Label>
                  <Input
                    type="number"
                    min={1}
                    value={delivery.dailyEmailLimit}
                    onChange={(e) => setDelivery((d) => ({ ...d, dailyEmailLimit: parseInt(e.target.value, 10) || 0 }))}
                    className="mt-1 border-border"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Send window start</Label>
                  <Input
                    type="time"
                    value={delivery.sendWindowStart}
                    onChange={(e) => setDelivery((d) => ({ ...d, sendWindowStart: e.target.value }))}
                    className="mt-1 border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Send window end</Label>
                  <Input
                    type="time"
                    value={delivery.sendWindowEnd}
                    onChange={(e) => setDelivery((d) => ({ ...d, sendWindowEnd: e.target.value }))}
                    className="mt-1 border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Timezone</Label>
                  <Select
                    value={delivery.sendWindowTz}
                    onValueChange={(v) => setDelivery((d) => ({ ...d, sendWindowTz: v }))}
                  >
                    <SelectTrigger className="mt-1 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">EST (Eastern)</SelectItem>
                      <SelectItem value="America/Los_Angeles">PST (Pacific)</SelectItem>
                      <SelectItem value="Europe/London">GMT (London)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Weekdays only</p>
                  <p className="text-xs text-muted-foreground">Send only Mon–Fri within the window</p>
                </div>
                <Switch
                  checked={delivery.weekdaysOnly}
                  onCheckedChange={(v) => setDelivery((d) => ({ ...d, weekdaysOnly: v }))}
                />
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">Unsubscribe / opt-out</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contacts who opt out are automatically removed from all sequences. Email steps use an unsubscribe link; DM steps honor platform block/report.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Steps (drag to reorder)</h2>
          <Button size="sm" onClick={addStep} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add step
          </Button>
        </div>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={cn("border-border transition-shadow", draggedIndex === index && "opacity-70 ring-2 ring-primary")}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground" title="Drag to reorder">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="gap-1 border-border">
                    {STEP_TYPE_ICONS[step.type]}
                    Step {index + 1}
                  </Badge>
                  <div className="flex-1 flex gap-2 items-center flex-wrap">
                    <Select
                      value={step.type}
                      onValueChange={(v) => updateStep(step.id, { type: v as StepTypeValue })}
                    >
                      <SelectTrigger className="w-[160px] h-8 border-border text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STEP_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Delay</Label>
                      <Input
                        type="number"
                        min={0}
                        value={step.delayDays}
                        onChange={(e) => updateStep(step.id, { delayDays: parseInt(e.target.value, 10) || 0 })}
                        className="w-16 h-8 border-border text-xs"
                      />
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeStep(step.id)}
                    disabled={steps.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Message template</Label>
                  <div className="flex flex-wrap gap-1 mt-1 mb-2">
                    {MERGE_TAGS.map(({ tag, label }) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-border"
                        onClick={() => {
                          const el = document.getElementById(`msg-${step.id}`) as HTMLTextAreaElement | null;
                          insertTag(step.id, tag, el);
                        }}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    id={`msg-${step.id}`}
                    value={step.message}
                    onChange={(e) => updateStep(step.id, { message: e.target.value })}
                    placeholder="Write your message. Use merge tags above."
                    className="min-h-[100px] border-border resize-y"
                    rows={4}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5"
                      onClick={() => handleAiWrite(step, index)}
                      disabled={!!aiWritingId}
                    >
                      {aiWritingId === step.id ? (
                        "Writing..."
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          AI Write
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Only send if previous step was not replied to</p>
                    <p className="text-xs text-muted-foreground">Skip this step if the contact already replied</p>
                  </div>
                  <Switch
                    checked={step.onlyIfNoReply}
                    onCheckedChange={(v) => updateStep(step.id, { onlyIfNoReply: v })}
                  />
                </div>
                {/* Live stats */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Step stats</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>Sent</span>
                        <span>{step.stats.sent}</span>
                      </div>
                      <Progress value={step.stats.sent ? Math.min(100, (step.stats.sent / 200) * 100) : 0} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>Delivered</span>
                        <span>{step.stats.delivered}</span>
                      </div>
                      <Progress value={step.stats.sent ? Math.min(100, (step.stats.delivered / step.stats.sent) * 100) : 0} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>Replied</span>
                        <span>{step.stats.replied}</span>
                      </div>
                      <Progress value={step.stats.delivered ? Math.min(100, (step.stats.replied / step.stats.delivered) * 100) : 0} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>Opted out</span>
                        <span>{step.stats.optedOut}</span>
                      </div>
                      <Progress value={step.stats.sent ? Math.min(100, (step.stats.optedOut / step.stats.sent) * 100) : 0} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration note */}
      <Card className="border-border border-dashed bg-muted/20">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Integration:</strong> Email steps push to Instantly (POST /api/v1/campaigns/add-leads). DM steps queue for Manus agent execution. Connect your API keys in Settings to enable sending.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
