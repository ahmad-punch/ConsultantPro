/**
 * Enum values shared by the Drizzle schema, zod validation and UI labels.
 * This file has no runtime dependencies so client components can import it
 * without pulling in drizzle-orm. Change values only through the foundation
 * owner: every change needs a schema migration (`pnpm db:generate`).
 */

export const CASE_CATEGORIES = [
  "property",
  "inheritance",
  "police_fir",
  "tax_fbr",
  "nadra",
  "attestation",
  "company_secp",
  "court",
  "errand",
  "other",
] as const;
export type CaseCategory = (typeof CASE_CATEGORIES)[number];

export const CASE_STAGES = [
  "intake",
  "triage",
  "memo_drafting",
  "memo_delivered",
  "managed",
  "errand_in_progress",
  "closed",
  "declined",
] as const;
export type CaseStage = (typeof CASE_STAGES)[number];

export const PRODUCTS = [
  "question",
  "call",
  "assessment",
  "managed",
  "errand",
  "retainer",
] as const;
export type ProductType = (typeof PRODUCTS)[number];

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const LEAD_STATUSES = ["new", "contacted", "converted", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_URGENCIES = ["low", "normal", "urgent"] as const;
export type LeadUrgency = (typeof LEAD_URGENCIES)[number];

export const PARTNER_TYPES = [
  "advocate",
  "errand_runner",
  "adviser",
  "accountant",
] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];

export const CHANNEL_PLATFORMS = [
  "whatsapp",
  "facebook",
  "association",
  "community_centre",
  "linkedin",
  "youtube",
  "other",
] as const;
export type ChannelPlatform = (typeof CHANNEL_PLATFORMS)[number];

export const CHANNEL_STATUSES = [
  "identified",
  "contacted",
  "joined",
  "posted",
  "paused",
] as const;
export type ChannelStatus = (typeof CHANNEL_STATUSES)[number];

export const CONTENT_STATUSES = ["idea", "drafted", "approved", "posted"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_FORMATS = ["post", "script", "guide", "video", "email"] as const;
export type ContentFormat = (typeof CONTENT_FORMATS)[number];

export const CONTENT_LANGUAGES = ["en", "ur", "both"] as const;
export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];

export const RETAINER_TIERS = ["watch", "plus", "family_office"] as const;
export type RetainerTier = (typeof RETAINER_TIERS)[number];

export const RETAINER_STATUSES = ["active", "cancelled"] as const;
export type RetainerStatus = (typeof RETAINER_STATUSES)[number];

export const PAYMENT_METHODS = ["stripe", "wise", "payoneer", "bank", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const TEAM_ROLES = ["founder", "case_manager", "ops"] as const;

export const DOCUMENT_TYPES = ["invoice", "receipt", "quote", "engagement_letter", "case_summary"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  invoice: "Invoice",
  receipt: "Receipt",
  quote: "Quote",
  engagement_letter: "Engagement letter",
  case_summary: "Case summary",
};

export const APPLICATION_TYPES = ["advocate", "errand_runner", "accountant", "ambassador"] as const;
export type ApplicationType = (typeof APPLICATION_TYPES)[number];
export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  advocate: "Advocate",
  errand_runner: "Errand runner",
  accountant: "Accountant / tax adviser",
  ambassador: "Community ambassador",
};

export const APPLICATION_STATUSES = ["new", "reviewing", "interview", "approved", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  approved: "Approved",
  rejected: "Rejected",
};

export const PARTNER_TIERS = ["probation", "bronze", "silver", "gold"] as const;
export type PartnerTier = (typeof PARTNER_TIERS)[number];
export const PARTNER_TIER_LABELS: Record<PartnerTier, string> = {
  probation: "Probation",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

export const ONBOARDING_STAGES = ["applied", "agreement_sent", "agreement_signed", "trial_case", "active", "suspended"] as const;
export type OnboardingStage = (typeof ONBOARDING_STAGES)[number];
export const ONBOARDING_STAGE_LABELS: Record<OnboardingStage, string> = {
  applied: "Applied",
  agreement_sent: "Agreement sent",
  agreement_signed: "Agreement signed",
  trial_case: "Trial case",
  active: "Active",
  suspended: "Suspended",
};

export const ENGAGEMENT_STATUSES = ["proposed", "accepted", "in_progress", "delivered", "completed", "cancelled", "disputed"] as const;
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];
export const ENGAGEMENT_STATUS_LABELS: Record<EngagementStatus, string> = {
  proposed: "Proposed",
  accepted: "Accepted",
  in_progress: "In progress",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

export const INVOICE_STATUSES = ["draft", "sent", "paid", "void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  void: "Void",
};
export type TeamRole = (typeof TEAM_ROLES)[number];

/* Human-readable labels. Use these in tables, badges and selects. */

export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  property: "Property",
  inheritance: "Inheritance",
  police_fir: "Police / FIR",
  tax_fbr: "Tax (FBR)",
  nadra: "NADRA / NICOP",
  attestation: "Attestation",
  company_secp: "Company (SECP)",
  court: "Court records",
  errand: "Errand",
  other: "Other",
};

export const CASE_STAGE_LABELS: Record<CaseStage, string> = {
  intake: "Intake",
  triage: "Triage",
  memo_drafting: "Memo drafting",
  memo_delivered: "Memo delivered",
  managed: "Managed",
  errand_in_progress: "Errand in progress",
  closed: "Closed",
  declined: "Declined",
};

export const PRODUCT_LABELS: Record<ProductType, string> = {
  question: "Pathway Question",
  call: "Pathway Call",
  assessment: "Case Assessment",
  managed: "Managed Case",
  errand: "Errand",
  retainer: "Family Affairs retainer",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  lost: "Lost",
};

export const LEAD_URGENCY_LABELS: Record<LeadUrgency, string> = {
  low: "Low",
  normal: "Normal",
  urgent: "Urgent",
};

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  advocate: "Advocate",
  errand_runner: "Errand runner",
  adviser: "Adviser",
  accountant: "Accountant",
};

export const CHANNEL_PLATFORM_LABELS: Record<ChannelPlatform, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  association: "Association",
  community_centre: "Community centre",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  other: "Other",
};

export const CHANNEL_STATUS_LABELS: Record<ChannelStatus, string> = {
  identified: "Identified",
  contacted: "Contacted",
  joined: "Joined",
  posted: "Posted",
  paused: "Paused",
};

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "Idea",
  drafted: "Drafted",
  approved: "Approved",
  posted: "Posted",
};

export const CONTENT_FORMAT_LABELS: Record<ContentFormat, string> = {
  post: "Post",
  script: "Script",
  guide: "Guide",
  video: "Video",
  email: "Email",
};

export const CONTENT_LANGUAGE_LABELS: Record<ContentLanguage, string> = {
  en: "English",
  ur: "Urdu",
  both: "English + Urdu",
};

export const RETAINER_TIER_LABELS: Record<RetainerTier, string> = {
  watch: "Watch",
  plus: "Plus",
  family_office: "Family Office",
};

export const RETAINER_STATUS_LABELS: Record<RetainerStatus, string> = {
  active: "Active",
  cancelled: "Cancelled",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: "Stripe",
  wise: "Wise",
  payoneer: "Payoneer",
  bank: "Bank transfer",
  other: "Other",
};

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  founder: "Founder",
  case_manager: "Case manager",
  ops: "Operations",
};
