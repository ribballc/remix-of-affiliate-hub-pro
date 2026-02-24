import { useState } from "react";
import adsMasteryLogo from "@/assets/ads-mastery-logo.png";
import { ChevronDown } from "lucide-react";

const callOptions = [
  { id: "onboarding", title: "Onboarding Call", emoji: "🚀", url: "https://calendly.com/jake-chappellteam/onboarding-call-1on1-ads-mastery-mentorship" },
  { id: "week-1", title: "Week 1 Call", emoji: "1️⃣", url: "https://calendly.com/jake-chappellteam/week-1-call-1on1-ads-mastery-mentorship" },
  { id: "week-2", title: "Week 2 Call", emoji: "2️⃣", url: "https://calendly.com/jake-chappellteam/week-2-call-1on1-ads-mastery-mentorship" },
  { id: "week-3", title: "Week 3 Call", emoji: "3️⃣", url: "https://calendly.com/jake-chappellteam/week-3-call-1on1-ads-mastery-mentorship" },
  { id: "week-4", title: "Week 4 Call", emoji: "4️⃣", url: "https://calendly.com/jake-chappellteam/week-4-call-1on1-ads-mastery-mentorship" },
  { id: "week-5", title: "Week 5 Call", emoji: "5️⃣", url: "https://calendly.com/jake-chappellteam/week-5-call-1on1-ads-mastery-mentorship" },
  { id: "week-6", title: "Week 6 Call", emoji: "6️⃣", url: "https://calendly.com/jake-chappellteam/week-6-call-1on1-ads-mastery-mentorship" },
  { id: "week-7", title: "Week 7 Call", emoji: "7️⃣", url: "https://calendly.com/jake-chappellteam/week-7-call-1on1-ads-mastery-mentorship" },
  { id: "week-8", title: "Week 8 Call", emoji: "8️⃣", url: "https://calendly.com/jake-chappellteam/week-8-call-1on1-ads-mastery-mentorship" },
];

const Index = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-8 md:py-12 bg-[#4042fd]">
        <div className="container max-w-4xl mx-auto px-4">
          <img src={adsMasteryLogo} alt="Ads Mastery" className="h-16 md:h-20 mx-auto object-contain" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 pt-10 md:pt-14 pb-10 md:pb-16">
        <div className="mb-8 text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Book Your 1-on-1 Call</h1>
          <p className="text-muted-foreground text-base md:text-lg">Schedule your 1-on-1 session below with Jake</p>
        </div>

        <div className="space-y-3">
          {callOptions.map((option) => (
            <div
              key={option.id}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300"
            >
              <button
                onClick={() => toggleAccordion(option.id)}
                className="w-full flex items-center justify-between px-4 py-4 font-medium text-left hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-foreground">{option.title}</span>
                </span>
                <ChevronDown 
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openId === option.id ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {openId === option.id && (
                <div className="px-4 pb-4">
                  <iframe
                    src={option.url}
                    width="100%"
                    height="700"
                    frameBorder="0"
                    className="rounded-lg"
                    title={option.title}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
