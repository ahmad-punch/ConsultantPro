import { ToneBadge, type Tone } from "@/components/admin/badges";
import {
  APPLICATION_STATUS_LABELS,
  ENGAGEMENT_STATUS_LABELS,
  ONBOARDING_STAGE_LABELS,
  PARTNER_TIER_LABELS,
  type ApplicationStatus,
  type EngagementStatus,
  type OnboardingStage,
  type PartnerTier,
} from "@/lib/db/enums";

const APP_TONE: Record<ApplicationStatus, Tone> = { new: "info", reviewing: "warning", interview: "highlight", approved: "success", rejected: "neutral" };
const TIER_TONE: Record<PartnerTier, Tone> = { probation: "neutral", bronze: "highlight", silver: "info", gold: "solid" };
const STAGE_TONE: Record<OnboardingStage, Tone> = { applied: "neutral", agreement_sent: "info", agreement_signed: "info", trial_case: "warning", active: "success", suspended: "danger" };
const ENG_TONE: Record<EngagementStatus, Tone> = { proposed: "info", accepted: "primary", in_progress: "warning", delivered: "highlight", completed: "success", cancelled: "neutral", disputed: "danger" };

export const ApplicationStatusBadge = ({ status }: { status: ApplicationStatus }) => <ToneBadge tone={APP_TONE[status]}>{APPLICATION_STATUS_LABELS[status]}</ToneBadge>;
export const TierBadge = ({ tier }: { tier: PartnerTier }) => <ToneBadge tone={TIER_TONE[tier]}>{PARTNER_TIER_LABELS[tier]}</ToneBadge>;
export const OnboardingBadge = ({ stage }: { stage: OnboardingStage }) => <ToneBadge tone={STAGE_TONE[stage]}>{ONBOARDING_STAGE_LABELS[stage]}</ToneBadge>;
export const EngagementStatusBadge = ({ status }: { status: EngagementStatus }) => <ToneBadge tone={ENG_TONE[status]}>{ENGAGEMENT_STATUS_LABELS[status]}</ToneBadge>;
