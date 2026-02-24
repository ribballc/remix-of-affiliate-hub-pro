import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import adsMasteryLogo from "@/assets/ads-mastery-logo.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const MOCK_REPLY =
  "I'm your Meta strategy assistant powered by your coaching call library. This feature will be live once the RAG backend is connected.";

const KNOWLEDGE_SOURCES = [
  "Meta Ads Strategy",
  "Funnel Structure",
  "Creative Strategy",
  "Audience Research",
  "Scaling",
  "Troubleshooting",
] as const;

const SUGGESTED_QUESTIONS = [
  "What's our cold traffic structure?",
  "How do we scale a winning adset?",
  "What creative angles work for skincare?",
  "How do we handle a dying campaign?",
] as const;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

async function postChat(message: string): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("API not available");
    const data = (await res.json()) as { reply?: string; message?: string };
    return data.reply ?? data.message ?? MOCK_REPLY;
  } catch {
    return MOCK_REPLY;
  }
}

export default function DashboardAiAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const toSend = (text ?? input).trim();
    if (!toSend || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: toSend,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const reply = await postChat(toSend);

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: reply,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  }

  function handleSuggestedClick(question: string) {
    setInput(question);
    handleSend(question);
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-0 rounded-lg border border-border bg-background">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar: Knowledge Base Sources */}
        <aside className="hidden w-56 shrink-0 border-r border-border bg-muted/30 md:block">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Knowledge Base Sources
            </h3>
            <ul className="space-y-2">
              {KNOWLEDGE_SOURCES.map((label) => (
                <li key={label}>
                  <Badge
                    variant="secondary"
                    className="w-full justify-center py-1.5 text-xs font-normal"
                  >
                    {label}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex flex-1 flex-col min-w-0">
          <ScrollArea className="flex-1 min-h-0 px-4">
            <div className="py-4 space-y-4 min-h-full">
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Ask anything about Meta ads strategy. Try a suggested question below.
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-2",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {m.role === "assistant" && (
                    <Avatar className="h-8 w-8 shrink-0 rounded-full border border-border">
                      <AvatarImage src={adsMasteryLogo} alt="Ads Mastery" />
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {m.content}
                  </div>
                  {m.role === "user" && <div className="w-8 shrink-0" />}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-8 w-8 shrink-0 rounded-full border border-border">
                    <AvatarImage src={adsMasteryLogo} alt="Ads Mastery" />
                  </Avatar>
                  <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Suggested questions */}
          <div className="shrink-0 border-t border-border px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSuggestedClick(q)}
                  disabled={isLoading}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div className="shrink-0 border-t border-border p-4">
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder="Ask about Meta ads strategy..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="min-h-[44px] max-h-32 resize-none border-border"
                rows={1}
                disabled={isLoading}
              />
              <Button
                type="button"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
