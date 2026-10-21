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
