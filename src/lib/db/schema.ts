/**
 * Data model. Single source of truth, mirrors docs/ARCHITECTURE.md.
 * Columns are camelCase in TypeScript and snake_case in Postgres
 * (`casing: "snake_case"` in drizzle.config.ts and src/lib/db/index.ts).
 * After any change: `pnpm db:generate` and commit the new file in drizzle/.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import {
  CASE_CATEGORIES,
  CASE_STAGES,
  CHANNEL_PLATFORMS,
  CHANNEL_STATUSES,
  CONTENT_FORMATS,
  CONTENT_LANGUAGES,
  CONTENT_STATUSES,
  APPLICATION_STATUSES,
  APPLICATION_TYPES,
  DOCUMENT_TYPES,
  ENGAGEMENT_STATUSES,
  INVOICE_STATUSES,
  ONBOARDING_STAGES,
  PARTNER_TIERS,
  LEAD_STATUSES,
  LEAD_URGENCIES,
  PARTNER_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PRODUCTS,
  RETAINER_STATUSES,
  RETAINER_TIERS,
  TEAM_ROLES,
} from "./enums";

/* ---------------------------------------------------------------- enums */

export const caseCategoryEnum = pgEnum("case_category", CASE_CATEGORIES);
export const caseStageEnum = pgEnum("case_stage", CASE_STAGES);
export const productEnum = pgEnum("product", PRODUCTS);
export const paymentStatusEnum = pgEnum("payment_status", PAYMENT_STATUSES);
export const leadStatusEnum = pgEnum("lead_status", LEAD_STATUSES);
export const leadUrgencyEnum = pgEnum("lead_urgency", LEAD_URGENCIES);
export const partnerTypeEnum = pgEnum("partner_type", PARTNER_TYPES);
export const channelPlatformEnum = pgEnum("channel_platform", CHANNEL_PLATFORMS);
export const channelStatusEnum = pgEnum("channel_status", CHANNEL_STATUSES);
export const contentStatusEnum = pgEnum("content_status", CONTENT_STATUSES);
export const contentFormatEnum = pgEnum("content_format", CONTENT_FORMATS);
export const contentLanguageEnum = pgEnum("content_language", CONTENT_LANGUAGES);
export const retainerTierEnum = pgEnum("retainer_tier", RETAINER_TIERS);
export const retainerStatusEnum = pgEnum("retainer_status", RETAINER_STATUSES);
export const paymentMethodEnum = pgEnum("payment_method", PAYMENT_METHODS);
export const teamRoleEnum = pgEnum("team_role", TEAM_ROLES);
export const documentTypeEnum = pgEnum("document_type", DOCUMENT_TYPES);
export const invoiceStatusEnum = pgEnum("invoice_status", INVOICE_STATUSES);
export const applicationTypeEnum = pgEnum("application_type", APPLICATION_TYPES);
export const applicationStatusEnum = pgEnum("application_status", APPLICATION_STATUSES);
export const partnerTierEnum = pgEnum("partner_tier", PARTNER_TIERS);
export const onboardingStageEnum = pgEnum("onboarding_stage", ONBOARDING_STAGES);
export const engagementStatusEnum = pgEnum("engagement_status", ENGAGEMENT_STATUSES);

/* -------------------------------------------------------------- helpers */

const id = () => uuid().primaryKey().defaultRandom();
const ts = () => timestamp({ withTimezone: true, mode: "date" });
const timestamps = {
  createdAt: ts().notNull().defaultNow(),
  updatedAt: ts()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* --------------------------------------------------------------- tables */

export const teamMembers = pgTable("team_members", {
  id: id(),
  name: text().notNull(),
  role: teamRoleEnum().notNull().default("case_manager"),
  email: text().notNull(),
  active: boolean().notNull().default(true),
  ...timestamps,
});

export const ambassadors = pgTable(
  "ambassadors",
  {
    id: id(),
    name: text().notNull(),
    country: text().notNull(),
    city: text(),
    whatsapp: text(),
    referralCode: text().notNull(),
    commissionPct: integer().notNull().default(10),
    totalPaidUsd: integer().notNull().default(0),
    active: boolean().notNull().default(true),
    notes: text(),
    archivedAt: ts(),
    ...timestamps,
  },
  (t) => [uniqueIndex("ambassadors_referral_code_idx").on(t.referralCode)],
);

export const clients = pgTable(
  "clients",
  {
    id: id(),
    name: text().notNull(),
    whatsapp: text(),
    email: text(),
    country: text(),
    city: text(),
    ambassadorId: uuid().references(() => ambassadors.id, { onDelete: "set null" }),
    notes: text(),
    archivedAt: ts(),
    ...timestamps,
  },
  (t) => [index("clients_ambassador_id_idx").on(t.ambassadorId)],
);

export const partners = pgTable("partners", {
  id: id(),
  name: text().notNull(),
  type: partnerTypeEnum().notNull(),
  city: text(),
  whatsapp: text(),
  email: text(),
  ownLetterhead: boolean().notNull().default(false),
  feeTerms: text(),
  slaDays: integer(),
  rating: integer(),
  active: boolean().notNull().default(true),
  tier: partnerTierEnum().notNull().default("probation"),
  onboardingStage: onboardingStageEnum().notNull().default("applied"),
  barCouncilNumber: text(),
  specialties: text(),
  /** Government offices this provider can work with, comma separated: NADRA, FBR, Land Revenue, SECP, Courts, HEC, Passport, Police. */
  departments: text(),
  /** Cities or districts served, comma separated. */
  serviceAreas: text(),
  languages: text(),
  bio: text(),
  availabilityNote: text(),
  agreementVersion: text(),
  agreementSignedAt: ts(),
  noPoachingAcceptedAt: ts(),
  casesCompleted: integer().notNull().default(0),
  avgRating: integer(),
  archivedAt: ts(),
  ...timestamps,
});

export const cases = pgTable(
  "cases",
  {
    id: id(),
    caseNumber: text().notNull(),
    clientId: uuid()
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    category: caseCategoryEnum().notNull(),
    product: productEnum().notNull(),
    stage: caseStageEnum().notNull().default("intake"),
    priceUsd: integer().notNull().default(0),
    paymentStatus: paymentStatusEnum().notNull().default("unpaid"),
    /** Which office the work happens at (NADRA, FBR, Land Revenue, SECP, Courts, ...). Used by the dispatch board. */
    department: text(),
    /** City or district where the work physically happens. Used to pool errands. */
    locationCity: text(),
    publicToken: text().notNull().$defaultFn(() => crypto.randomUUID()),
    archivedAt: ts(),
    paymentLink: text(),
    caseManagerId: uuid().references(() => teamMembers.id, { onDelete: "set null" }),
    partnerId: uuid().references(() => partners.id, { onDelete: "set null" }),
    driveFolderUrl: text(),
    memoDocUrl: text(),
    memoDeliveredAt: ts(),
    summary: text().notNull(),
    nextAction: text(),
    nextActionDue: ts(),
    nps: integer(),
    wouldRecommend: boolean(),
    ambassadorId: uuid().references(() => ambassadors.id, { onDelete: "set null" }),
    referredByCaseId: uuid().references((): AnyPgColumn => cases.id, {
      onDelete: "set null",
    }),
    closedAt: ts(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("cases_case_number_idx").on(t.caseNumber),
    index("cases_client_id_idx").on(t.clientId),
    index("cases_case_manager_id_idx").on(t.caseManagerId),
    index("cases_partner_id_idx").on(t.partnerId),
    index("cases_ambassador_id_idx").on(t.ambassadorId),
    index("cases_referred_by_case_id_idx").on(t.referredByCaseId),
    index("cases_stage_idx").on(t.stage),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: id(),
    name: text().notNull(),
    whatsapp: text().notNull(),
    email: text(),
    details: jsonb().$type<Record<string, string>>(),
    archivedAt: ts(),
    country: text().notNull(),
    category: caseCategoryEnum().notNull(),
    urgency: leadUrgencyEnum().notNull().default("normal"),
    description: text().notNull(),
    referralCode: text(),
    source: text().notNull().default("website"),
    status: leadStatusEnum().notNull().default("new"),
    convertedCaseId: uuid().references(() => cases.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [
    index("leads_converted_case_id_idx").on(t.convertedCaseId),
    index("leads_status_idx").on(t.status),
  ],
);

export const caseNotes = pgTable(
  "case_notes",
  {
    id: id(),
    caseId: uuid()
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    authorName: text().notNull(),
    body: text().notNull(),
    ...timestamps,
  },
  (t) => [index("case_notes_case_id_idx").on(t.caseId)],
);

export const channels = pgTable(
  "channels",
  {
    id: id(),
    name: text().notNull(),
    platform: channelPlatformEnum().notNull(),
    country: text(),
    memberCount: integer(),
    adminContact: text(),
    status: channelStatusEnum().notNull().default("identified"),
    lastPostedAt: ts(),
    cadenceDays: integer(),
    ambassadorId: uuid().references(() => ambassadors.id, { onDelete: "set null" }),
    notes: text(),
    archivedAt: ts(),
    ...timestamps,
  },
  (t) => [index("channels_ambassador_id_idx").on(t.ambassadorId)],
);

export const contentItems = pgTable("content_items", {
  id: id(),
  title: text().notNull(),
  format: contentFormatEnum().notNull(),
  language: contentLanguageEnum().notNull().default("en"),
  targetPlatform: text(),
  status: contentStatusEnum().notNull().default("idea"),
  scheduledFor: ts(),
  postedAt: ts(),
  url: text(),
  body: text(),
  notes: text(),
  archivedAt: ts(),
  ...timestamps,
});

export const retainers = pgTable(
  "retainers",
  {
    id: id(),
    clientId: uuid()
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    tier: retainerTierEnum().notNull(),
    monthlyUsd: integer().notNull(),
    status: retainerStatusEnum().notNull().default("active"),
    startedAt: ts().notNull().defaultNow(),
    cancelledAt: ts(),
    ...timestamps,
  },
  (t) => [index("retainers_client_id_idx").on(t.clientId)],
);

export const payments = pgTable(
  "payments",
  {
    id: id(),
    caseId: uuid().references(() => cases.id, { onDelete: "set null" }),
    retainerId: uuid().references(() => retainers.id, { onDelete: "set null" }),
    amountUsd: integer().notNull(),
    method: paymentMethodEnum().notNull().default("stripe"),
    status: paymentStatusEnum().notNull().default("unpaid"),
    reference: text(),
    paidAt: ts(),
    ...timestamps,
  },
  (t) => [
    index("payments_case_id_idx").on(t.caseId),
    index("payments_retainer_id_idx").on(t.retainerId),
  ],
);

/* ------------------------------------------------------------ relations */



/* ------------------------------------------------- partner network */

export const partnerApplications = pgTable(
  "partner_applications",
  {
    id: id(),
    type: applicationTypeEnum().notNull(),
    status: applicationStatusEnum().notNull().default("new"),
    name: text().notNull(),
    email: text(),
    whatsapp: text().notNull(),
    country: text().notNull().default("Pakistan"),
    city: text(),
    barCouncilNumber: text(),
    yearsExperience: integer(),
    specialties: text(),
    languages: text(),
    bio: text(),
    channelOrNetwork: text(),
    source: text().notNull().default("website"),
    acceptedTermsAt: ts(),
    notes: text(),
    reviewedAt: ts(),
    convertedPartnerId: uuid().references(() => partners.id, { onDelete: "set null" }),
    convertedAmbassadorId: uuid().references(() => ambassadors.id, { onDelete: "set null" }),
    archivedAt: ts(),
    ...timestamps,
  },
  (t) => [index("partner_applications_status_idx").on(t.status)],
);

export const partnerEngagements = pgTable(
  "partner_engagements",
  {
    id: id(),
    partnerId: uuid()
      .notNull()
      .references(() => partners.id, { onDelete: "restrict" }),
    caseId: uuid()
      .notNull()
      .references(() => cases.id, { onDelete: "restrict" }),
    role: text().notNull().default("advocate"),
    status: engagementStatusEnum().notNull().default("proposed"),
    agreedFeeUsd: integer().notNull().default(0),
    /** "partner" = advocate bills the client directly (default for legal work); "company" = we bill and pay out. */
    feeBilledBy: text().notNull().default("partner"),
    department: text(),
    locationCity: text(),
    /** Engagements with the same batchKey are run together on one visit (pooling). */
    batchKey: text(),
    slaDays: integer(),
    dueAt: ts(),
    noPoachingAcknowledgedAt: ts(),
    rating: integer(),
    ratingNote: text(),
    startedAt: ts(),
    deliveredAt: ts(),
    completedAt: ts(),
    notes: text(),
    ...timestamps,
  },
  (t) => [
    index("partner_engagements_partner_id_idx").on(t.partnerId),
    index("partner_engagements_case_id_idx").on(t.caseId),
  ],
);

/* ------------------------------------------------- documents & exports */

export const brandingSettings = pgTable("branding_settings", {
  id: id(),
  legalName: text().notNull().default(""),
  tradingName: text().notNull().default(""),
  addressLines: text().notNull().default(""),
  email: text().notNull().default(""),
  phone: text().notNull().default(""),
  website: text().notNull().default(""),
  logoUrl: text(),
  primaryColor: text().notNull().default("#0F3D2E"),
  accentColor: text().notNull().default("#B5542D"),
  showLogo: boolean().notNull().default(true),
  footerText: text().notNull().default(""),
  taxLabel: text().notNull().default(""),
  taxNumber: text().notNull().default(""),
  bankDetails: text().notNull().default(""),
  currency: text().notNull().default("USD"),
  ...timestamps,
});

export const documentTemplates = pgTable(
  "document_templates",
  {
    id: id(),
    type: documentTypeEnum().notNull(),
    name: text().notNull(),
    isDefault: boolean().notNull().default(false),
    title: text().notNull().default(""),
    intro: text().notNull().default(""),
    terms: text().notNull().default(""),
    footer: text().notNull().default(""),
    /** Free-form sections rendered after the main body: [{ heading, body }]. */
    sections: jsonb().$type<Array<{ heading: string; body: string }>>().notNull().default([]),
    /** Template-level switches, e.g. { showBankDetails: true, showSignature: false }. */
    options: jsonb().$type<Record<string, boolean | string>>().notNull().default({}),
    ...timestamps,
  },
  (t) => [index("document_templates_type_idx").on(t.type)],
);

export const invoices = pgTable(
  "invoices",
  {
    id: id(),
    invoiceNumber: text().notNull(),
    type: documentTypeEnum().notNull().default("invoice"),
    status: invoiceStatusEnum().notNull().default("draft"),
    clientId: uuid().references(() => clients.id, { onDelete: "set null" }),
    caseId: uuid().references(() => cases.id, { onDelete: "set null" }),
    retainerId: uuid().references(() => retainers.id, { onDelete: "set null" }),
    templateId: uuid().references(() => documentTemplates.id, { onDelete: "set null" }),
    issueDate: ts().notNull().defaultNow(),
    dueDate: ts(),
    currency: text().notNull().default("USD"),
    subtotalUsd: integer().notNull().default(0),
    taxUsd: integer().notNull().default(0),
    totalUsd: integer().notNull().default(0),
    notes: text(),
    /** Snapshot of client and branding at issue time so the PDF never changes retroactively. */
    snapshot: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    paymentId: uuid().references(() => payments.id, { onDelete: "set null" }),
    sentAt: ts(),
    paidAt: ts(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("invoices_number_idx").on(t.invoiceNumber),
    index("invoices_client_id_idx").on(t.clientId),
    index("invoices_case_id_idx").on(t.caseId),
  ],
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: id(),
    invoiceId: uuid()
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    position: integer().notNull().default(0),
    description: text().notNull(),
    quantity: integer().notNull().default(1),
    unitUsd: integer().notNull().default(0),
    amountUsd: integer().notNull().default(0),
  },
  (t) => [index("invoice_items_invoice_id_idx").on(t.invoiceId)],
);

export const generatedDocuments = pgTable(
  "generated_documents",
  {
    id: id(),
    type: documentTypeEnum().notNull(),
    documentNumber: text().notNull(),
    caseId: uuid().references(() => cases.id, { onDelete: "set null" }),
    clientId: uuid().references(() => clients.id, { onDelete: "set null" }),
    invoiceId: uuid().references(() => invoices.id, { onDelete: "set null" }),
    templateId: uuid().references(() => documentTemplates.id, { onDelete: "set null" }),
    title: text().notNull(),
    /** Everything needed to re-render the PDF exactly as first generated. */
    payload: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    ...timestamps,
  },
  (t) => [index("generated_documents_case_id_idx").on(t.caseId)],
);

export const metricsSnapshots = pgTable("metrics_snapshots", {
  id: id(),
  takenAt: ts().notNull().defaultNow(),
  rangeFrom: ts(),
  rangeTo: ts(),
  /** The six gate metrics plus pass flags, as computed by src/lib/queries/metrics.ts. */
  values: jsonb().$type<Record<string, number | boolean | null>>().notNull().default({}),
  note: text(),
});

export const teamMembersRelations = relations(teamMembers, ({ many }) => ({
  cases: many(cases),
}));

export const ambassadorsRelations = relations(ambassadors, ({ many }) => ({
  clients: many(clients),
  cases: many(cases),
  channels: many(channels),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  ambassador: one(ambassadors, {
    fields: [clients.ambassadorId],
    references: [ambassadors.id],
  }),
  cases: many(cases),
  retainers: many(retainers),
}));

export const partnersRelations = relations(partners, ({ many }) => ({
  cases: many(cases),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  client: one(clients, { fields: [cases.clientId], references: [clients.id] }),
  caseManager: one(teamMembers, {
    fields: [cases.caseManagerId],
    references: [teamMembers.id],
  }),
  partner: one(partners, { fields: [cases.partnerId], references: [partners.id] }),
  ambassador: one(ambassadors, {
    fields: [cases.ambassadorId],
    references: [ambassadors.id],
  }),
  referredByCase: one(cases, {
    fields: [cases.referredByCaseId],
    references: [cases.id],
    relationName: "case_referrals",
  }),
  referredCases: many(cases, { relationName: "case_referrals" }),
  notes: many(caseNotes),
  payments: many(payments),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  convertedCase: one(cases, {
    fields: [leads.convertedCaseId],
    references: [cases.id],
  }),
}));

export const caseNotesRelations = relations(caseNotes, ({ one }) => ({
  case: one(cases, { fields: [caseNotes.caseId], references: [cases.id] }),
}));

export const channelsRelations = relations(channels, ({ one }) => ({
  ambassador: one(ambassadors, {
    fields: [channels.ambassadorId],
    references: [ambassadors.id],
  }),
}));

export const retainersRelations = relations(retainers, ({ one, many }) => ({
  client: one(clients, { fields: [retainers.clientId], references: [clients.id] }),
  payments: many(payments),
}));

export const partnerApplicationsRelations = relations(partnerApplications, ({ one }) => ({
  partner: one(partners, { fields: [partnerApplications.convertedPartnerId], references: [partners.id] }),
  ambassador: one(ambassadors, { fields: [partnerApplications.convertedAmbassadorId], references: [ambassadors.id] }),
}));

export const partnerEngagementsRelations = relations(partnerEngagements, ({ one }) => ({
  partner: one(partners, { fields: [partnerEngagements.partnerId], references: [partners.id] }),
  case: one(cases, { fields: [partnerEngagements.caseId], references: [cases.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  case: one(cases, { fields: [invoices.caseId], references: [cases.id] }),
  retainer: one(retainers, { fields: [invoices.retainerId], references: [retainers.id] }),
  template: one(documentTemplates, { fields: [invoices.templateId], references: [documentTemplates.id] }),
  payment: one(payments, { fields: [invoices.paymentId], references: [payments.id] }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

export const generatedDocumentsRelations = relations(generatedDocuments, ({ one }) => ({
  case: one(cases, { fields: [generatedDocuments.caseId], references: [cases.id] }),
  client: one(clients, { fields: [generatedDocuments.clientId], references: [clients.id] }),
  invoice: one(invoices, { fields: [generatedDocuments.invoiceId], references: [invoices.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  case: one(cases, { fields: [payments.caseId], references: [cases.id] }),
  retainer: one(retainers, {
    fields: [payments.retainerId],
    references: [retainers.id],
  }),
}));

/* ---------------------------------------------------------------- types */

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type Ambassador = typeof ambassadors.$inferSelect;
export type NewAmbassador = typeof ambassadors.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type CaseNote = typeof caseNotes.$inferSelect;
export type NewCaseNote = typeof caseNotes.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;
export type Retainer = typeof retainers.$inferSelect;
export type NewRetainer = typeof retainers.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type BrandingSettings = typeof brandingSettings.$inferSelect;
export type NewBrandingSettings = typeof brandingSettings.$inferInsert;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type NewDocumentTemplate = typeof documentTemplates.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type NewGeneratedDocument = typeof generatedDocuments.$inferInsert;
export type MetricsSnapshot = typeof metricsSnapshots.$inferSelect;
export type NewMetricsSnapshot = typeof metricsSnapshots.$inferInsert;
export type PartnerApplication = typeof partnerApplications.$inferSelect;
export type NewPartnerApplication = typeof partnerApplications.$inferInsert;
export type PartnerEngagement = typeof partnerEngagements.$inferSelect;
export type NewPartnerEngagement = typeof partnerEngagements.$inferInsert;
