export const STEP_TYPES = [
  { value: "tiktok_dm", label: "TikTok DM" },
  { value: "email", label: "Email" },
  { value: "ig_dm", label: "IG DM" },
  { value: "targeted_invite", label: "Targeted Invite" },
] as const;

export type StepTypeValue = (typeof STEP_TYPES)[number]["value"];

export const SEQUENCE_TYPES = [
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "reengagement", label: "Re-engagement" },
  { value: "post_sample_followup", label: "Post-Sample Follow-up" },
  { value: "top_performer_upsell", label: "Top Performer Upsell" },
] as const;

export type SequenceTypeValue = (typeof SEQUENCE_TYPES)[number]["value"];

export const MERGE_TAGS = [
  { tag: "{{firstName}}", label: "First name" },
  { tag: "{{handle}}", label: "Handle" },
  { tag: "{{productName}}", label: "Product name" },
  { tag: "{{niche}}", label: "Niche" },
  { tag: "{{gmvTier}}", label: "GMV tier" },
  { tag: "{{clientBrand}}", label: "Client brand" },
] as const;

export interface StepStats {
  sent: number;
  delivered: number;
  replied: number;
  optedOut: number;
}

export interface SequenceStep {
  id: string;
  type: StepTypeValue;
  delayDays: number;
  message: string;
  onlyIfNoReply: boolean;
  stats: StepStats;
}

export interface DeliverySettings {
  dailyDmLimit: number;
  dailyEmailLimit: number;
  sendWindowStart: string; // "09:00"
  sendWindowEnd: string;   // "17:00"
  sendWindowTz: string;    // "America/New_York"
  weekdaysOnly: boolean;
}

export const DEFAULT_DELIVERY: DeliverySettings = {
  dailyDmLimit: 100,
  dailyEmailLimit: 250,
  sendWindowStart: "09:00",
  sendWindowEnd: "17:00",
  sendWindowTz: "America/New_York",
  weekdaysOnly: true,
};

export function createEmptyStep(): SequenceStep {
  return {
    id: crypto.randomUUID(),
    type: "email",
    delayDays: 0,
    message: "",
    onlyIfNoReply: false,
    stats: {
      sent: 0,
      delivered: 0,
      replied: 0,
      optedOut: 0,
    },
  };
}

export function mockStepStats(stepIndex: number): StepStats {
  const base = (stepIndex + 1) * 12;
  return {
    sent: base + 20,
    delivered: base + 15,
    replied: Math.floor(base / 4),
    optedOut: Math.floor(base / 20),
  };
}
