import { Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { AffiliateLink } from "@/data/affiliateLinks";

interface AffiliateLinkCardProps {
  link: AffiliateLink;
}

export function AffiliateLinkCard({ link }: AffiliateLinkCardProps) {
  const handleCopy = async () => {
    let copied = false;
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link.url);
        copied = true;
      }
    } catch {
      // Clipboard API failed
    }
    
    if (!copied) {
      try {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = link.url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (result) copied = true;
      } catch {
        // execCommand also failed
      }
    }
    
    if (copied) {
      toast({
        title: "Link copied!",
        description: "The affiliate link has been copied to your clipboard.",
      });
    } else {
      // Show the URL so user can manually copy (for embedded iframes)
      toast({
        title: "Copy this link:",
        description: link.url,
        duration: 10000,
      });
    }
  };

  const handleOpen = () => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="link-card group relative">
      {link.isNew && (
        <span className="new-badge">New</span>
      )}
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-primary">
        <img
          src={link.thumbnail}
          alt={link.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-sm md:text-base truncate">
          {link.title}
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 mt-1">
          {link.description}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleCopy}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Copy link"
        >
          <Copy className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          onClick={handleOpen}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Open link"
        >
          <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}
