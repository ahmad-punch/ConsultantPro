import { cn } from "@/lib/utils";
import {
  CASE_STAGE_LABELS,
  CHANNEL_STATUS_LABELS,
  CONTENT_STATUS_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_URGENCY_LABELS,
  PAYMENT_STATUS_LABELS,
  RETAINER_STATUS_LABELS,
  type CaseStage,
  type ChannelStatus,
  type ContentStatus,
  type LeadStatus,
  type LeadUrgency,
  type PaymentStatus,
  type RetainerStatus,
} from "@/lib/db/enums";

/**
 * One colour language for every status in the panel. Tones map to the design
 * tokens in globals.css; never use raw palette classes for statuses.
 */
export type Tone = "neutral" | "info" | "warning" | "success" | "highlight" | "primary" | "solid" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-info-soft text-info border-info/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  success: "bg-success-soft text-success border-success/20",
  highlight: "bg-highlight-soft text-highlight border-highlight/20",
  primary: "bg-secondary text-secondary-foreground border-primary/15",
  solid: "bg-primary text-primary-foreground border-primary",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
};

export const TONE_DOT: Record<Tone, string> = {
  neutral: "bg-muted-foreground/50",
  info: "bg-info",
  warning: "bg-warning",
  success: "bg-success",
  highlight: "bg-highlight",
  primary: "bg-primary/60",
  solid: "bg-primary",
  danger: "bg-destructive",
};

export function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-full border px-2 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const STAGE_TONE: Record<CaseStage, Tone> = {
  intake: "info",
  triage: "warning",
  memo_drafting: "highlight",
  memo_delivered: "primary",
  managed: "solid",
  errand_in_progress: "solid",
  closed: "success",
  declined: "neutral",
};

export function StageBadge({ stage }: { stage: CaseStage }) {
  return <ToneBadge tone={STAGE_TONE[stage]}>{CASE_STAGE_LABELS[stage]}</ToneBadge>;
}

const PAYMENT_TONE: Record<PaymentStatus, Tone> = { unpaid: "warning", paid: "success", refunded: "neutral" };
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <ToneBadge tone={PAYMENT_TONE[status]}>{PAYMENT_STATUS_LABELS[status]}</ToneBadge>;
}

const LEAD_TONE: Record<LeadStatus, Tone> = { new: "info", contacted: "warning", converted: "success", lost: "neutral" };
export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <ToneBadge tone={LEAD_TONE[status]}>{LEAD_STATUS_LABELS[status]}</ToneBadge>;
}

const URGENCY_TONE: Record<LeadUrgency, Tone> = { low: "neutral", normal: "primary", urgent: "danger" };
export function UrgencyBadge({ urgency }: { urgency: LeadUrgency }) {
  return <ToneBadge tone={URGENCY_TONE[urgency]}>{LEAD_URGENCY_LABELS[urgency]}</ToneBadge>;
}

const CHANNEL_TONE: Record<ChannelStatus, Tone> = {
  identified: "neutral",
  contacted: "info",
  joined: "primary",
  posted: "success",
  paused: "warning",
};
export function ChannelStatusBadge({ status }: { status: ChannelStatus }) {
  return <ToneBadge tone={CHANNEL_TONE[status]}>{CHANNEL_STATUS_LABELS[status]}</ToneBadge>;
}

const CONTENT_TONE: Record<ContentStatus, Tone> = {
  idea: "neutral",
  drafted: "info",
  approved: "highlight",
  posted: "success",
};
export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return <ToneBadge tone={CONTENT_TONE[status]}>{CONTENT_STATUS_LABELS[status]}</ToneBadge>;
}

export function RetainerStatusBadge({ status }: { status: RetainerStatus }) {
  return (
    <ToneBadge tone={status === "active" ? "success" : "neutral"}>{RETAINER_STATUS_LABELS[status]}</ToneBadge>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <ToneBadge tone={active ? "success" : "neutral"}>{active ? "Active" : "Inactive"}</ToneBadge>;
}

export function DueBadge({ label, tone }: { label: string; tone: Tone }) {
  return <ToneBadge tone={tone}>{label}</ToneBadge>;
}
