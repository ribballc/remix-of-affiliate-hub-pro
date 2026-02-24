import { ExternalLink } from "lucide-react";

interface CallOption {
  id: string;
  title: string;
  emoji: string;
  url: string;
}

interface BookCallCardProps {
  option: CallOption;
}

export function BookCallCard({ option }: BookCallCardProps) {
  return (
    <a
      href={option.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card border border-border rounded-xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/30"
    >
      <div className="flex items-center justify-between px-4 py-4 font-medium">
        <span className="flex items-center gap-3">
          <span className="text-lg">{option.emoji}</span>
          <span className="text-foreground">{option.title}</span>
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    </a>
  );
}
