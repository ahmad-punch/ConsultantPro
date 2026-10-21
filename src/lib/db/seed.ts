/**
 * `pnpm db:seed`: wipe all tables and load demo data for the control panel.
 * Every name is an obvious demo name; phone numbers use ranges reserved for
 * fiction; emails use example.com. Never put real people in here.
 *
 * Local PGlite: stop `pnpm dev` first (PGlite allows one process per folder).
 * Neon (DATABASE_URL set): refuses to run unless you pass `--force`, because
 * it deletes every row.
 */
import { eq, sql } from "drizzle-orm";

import { formatCaseNumber } from "../ids";
import type { Database } from "./index";
import * as s from "./schema";

// Wall-clock time without Date.now(): demo mode can import this module during
// a render, where Next.js rejects Date.now() under cacheComponents.
const now = Math.round(performance.timeOrigin + performance.now());
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(now - n * DAY);
const daysFromNow = (n: number) => new Date(now + n * DAY);

export type SeedCounts = Record<
  | "team"
  | "partners"
  | "ambassadors"
  | "channels"
  | "clients"
  | "cases"
  | "notes"
  | "leads"
  | "retainers"
  | "payments"
  | "content",
  number
>;

/**
 * Wipe every table and load the demo data into `db`. Used by the CLI below
 * and by demo mode (in-memory PGlite on a deploy without DATABASE_URL).
 * Returns the row counts per table.
 */
export async function seedDatabase(db: Database): Promise<SeedCounts> {
  await db.execute(
    sql`truncate table payments, retainers, case_notes, leads, cases, clients, channels, content_items, partners, ambassadors, team_members restart identity cascade`,
  );

  /* ---------------------------------------------------------- team */
  const [founder, manager] = await db
    .insert(s.teamMembers)
    .values([
      { name: "Demo Founder", role: "founder", email: "demo-founder@example.com" },
      { name: "Demo Case Manager", role: "case_manager", email: "demo-cm@example.com" },
    ])
    .returning();

  /* ------------------------------------------------------ partners */
  const partners = await db
    .insert(s.partners)
    .values([
      {
        name: "Demo Advocate 1",
        type: "advocate",
        city: "Lahore",
        whatsapp: "+92 300 0000101",
        email: "demo-advocate-1@example.com",
        ownLetterhead: true,
        feeTerms: "Fixed fee per stage, billed to the client directly.",
        slaDays: 5,
        rating: 5,
      },
      {
        name: "Demo Advocate 2",
        type: "advocate",
        city: "Islamabad",
        whatsapp: "+92 300 0000102",
        email: "demo-advocate-2@example.com",
        ownLetterhead: true,
        feeTerms: "Fixed fee for memo review; hourly for court work, billed directly.",
        slaDays: 7,
        rating: 4,
      },
      {
        name: "Demo Errand Runner 1",
        type: "errand_runner",
        city: "Lahore",
        whatsapp: "+92 300 0000103",
        feeTerms: "Per errand, agreed in advance.",
        slaDays: 3,
        rating: 4,
      },
      {
        name: "Demo Errand Runner 2",
        type: "errand_runner",
        city: "Rawalpindi",
        whatsapp: "+92 300 0000104",
        feeTerms: "Per errand, agreed in advance.",
        slaDays: 3,
      },
      {
        name: "Demo Accountant 1",
        type: "accountant",
        city: "Karachi",
        email: "demo-accountant-1@example.com",
        feeTerms: "Fixed fee per non-resident tax return.",
        slaDays: 10,
        rating: 5,
      },
      {
        name: "Demo Adviser 1",
        type: "adviser",
        city: "Islamabad",
        email: "demo-adviser-1@example.com",
        feeTerms: "TODO: confirm terms",
        active: false,
      },
    ])
    .returning();
  const [advocate1, advocate2, runner1, runner2, accountant] = partners;

  /* --------------------------------------------------- ambassadors */
  const ambassadors = await db
    .insert(s.ambassadors)
    .values([
      {
        name: "Demo Ambassador 1",
        country: "United Kingdom",
        city: "Birmingham",
        whatsapp: "+44 7700 900101",
        referralCode: "DEMO-UK1",
        commissionPct: 10,
        totalPaidUsd: 25,
      },
      {
        name: "Demo Ambassador 2",
        country: "United States",
        city: "Houston",
        whatsapp: "+1 202 555 0101",
        referralCode: "DEMO-US1",
        commissionPct: 10,
      },
      {
        name: "Demo Ambassador 3",
        country: "United Arab Emirates",
        city: "Dubai",
        whatsapp: "+971 50 000 0101",
        referralCode: "DEMO-AE1",
        commissionPct: 10,
      },
      {
        name: "Demo Ambassador 4",
        country: "Canada",
        city: "Toronto",
        whatsapp: "+1 416 555 0101",
        referralCode: "DEMO-CA1",
        commissionPct: 10,
        active: false,
        notes: "Paused while travelling.",
      },
    ])
    .returning();
  const [ambUk, ambUs, ambAe] = ambassadors;

  /* ------------------------------------------------------ channels */
  await db.insert(s.channels).values([
    { name: "Demo WhatsApp group: Birmingham families", platform: "whatsapp", country: "United Kingdom", memberCount: 240, status: "posted", lastPostedAt: daysAgo(4), cadenceDays: 14, ambassadorId: ambUk.id },
    { name: "Demo WhatsApp group: Manchester professionals", platform: "whatsapp", country: "United Kingdom", memberCount: 180, status: "joined", cadenceDays: 14 },
    { name: "Demo Facebook group: Pakistanis in Texas", platform: "facebook", country: "United States", memberCount: 5200, status: "posted", lastPostedAt: daysAgo(9), cadenceDays: 7, ambassadorId: ambUs.id },
    { name: "Demo Facebook group: Overseas property owners", platform: "facebook", country: "Global", memberCount: 12000, status: "contacted", adminContact: "Demo Group Admin 1" },
    { name: "Demo association: UK Pakistani doctors", platform: "association", country: "United Kingdom", status: "identified", notes: "Ask for a newsletter slot." },
    { name: "Demo association: Gulf engineers forum", platform: "association", country: "United Arab Emirates", status: "contacted", ambassadorId: ambAe.id },
    { name: "Demo community centre: Bradford", platform: "community_centre", country: "United Kingdom", status: "identified" },
    { name: "Demo community centre: Toronto east", platform: "community_centre", country: "Canada", status: "paused", notes: "Restart after Ramadan." },
    { name: "Demo LinkedIn group: Pakistani diaspora in tech", platform: "linkedin", country: "Global", memberCount: 3100, status: "joined", cadenceDays: 30 },
    { name: "Demo YouTube channel: property explainer collab", platform: "youtube", country: "Pakistan", status: "identified" },
    { name: "Demo WhatsApp group: Dubai residents", platform: "whatsapp", country: "United Arab Emirates", memberCount: 320, status: "posted", lastPostedAt: daysAgo(20), cadenceDays: 14, ambassadorId: ambAe.id },
    { name: "Demo mosque newsletter: Houston", platform: "other", country: "United States", status: "contacted", ambassadorId: ambUs.id },
  ]);

  /* ------------------------------------------------------- clients */
  const clientRows = await db
    .insert(s.clients)
    .values([
      { name: "Demo Client 1", whatsapp: "+44 7700 900201", email: "demo-client-1@example.com", country: "United Kingdom", city: "Birmingham", ambassadorId: ambUk.id },
      { name: "Demo Client 2", whatsapp: "+1 202 555 0102", email: "demo-client-2@example.com", country: "United States", city: "Houston", ambassadorId: ambUs.id },
      { name: "Demo Client 3", whatsapp: "+971 50 000 0201", country: "United Arab Emirates", city: "Dubai" },
      { name: "Demo Client 4", whatsapp: "+44 7700 900202", email: "demo-client-4@example.com", country: "United Kingdom", city: "London" },
      { name: "Demo Client 5", whatsapp: "+1 416 555 0102", country: "Canada", city: "Toronto" },
      { name: "Demo Client 6", whatsapp: "+44 7700 900203", country: "United Kingdom", city: "Bradford", notes: "Prefers Urdu on calls." },
      { name: "Demo Client 7", whatsapp: "+966 50 000 0201", country: "Saudi Arabia", city: "Riyadh" },
      { name: "Demo Client 8", whatsapp: "+1 202 555 0103", email: "demo-client-8@example.com", country: "United States", city: "Chicago" },
      { name: "Demo Client 9", whatsapp: "+61 491 570 101", country: "Australia", city: "Sydney" },
    ])
    .returning();
  const c = clientRows;

  /* --------------------------------------------------------- cases */
  type CaseSeed = typeof s.cases.$inferInsert;
  const caseSeeds: Omit<CaseSeed, "caseNumber">[] = [
    {
      clientId: c[0].id, category: "property", product: "assessment", stage: "closed",
      priceUsd: 249, paymentStatus: "paid", caseManagerId: manager.id, partnerId: advocate1.id,
      summary: "Plot in a Lahore housing society transferred without the owner's knowledge. Needs to know the forum and the steps.",
      memoDocUrl: "https://docs.google.com/document/d/TODO-demo-memo-1", memoDeliveredAt: daysAgo(40),
      nps: 9, wouldRecommend: true, ambassadorId: ambUk.id, closedAt: daysAgo(35), createdAt: daysAgo(45),
    },
    {
      clientId: c[1].id, category: "inheritance", product: "managed", stage: "managed",
      priceUsd: 700, paymentStatus: "paid", caseManagerId: manager.id, partnerId: advocate2.id,
      summary: "Succession certificate for late father's bank account and house in Rawalpindi. Three heirs abroad.",
      driveFolderUrl: "https://drive.google.com/drive/folders/TODO-demo-2", memoDeliveredAt: daysAgo(25),
      nextAction: "Collect attested consent letters from the two other heirs", nextActionDue: daysFromNow(3),
      ambassadorId: ambUs.id, createdAt: daysAgo(32),
    },
    {
      clientId: c[2].id, category: "nadra", product: "errand", stage: "errand_in_progress",
      priceUsd: 50, paymentStatus: "paid", caseManagerId: founder.id, partnerId: runner2.id,
      summary: "Family registration certificate (FRC) needed for a child's NICOP application.",
      nextAction: "Runner to collect FRC from NADRA centre", nextActionDue: daysFromNow(2), createdAt: daysAgo(6),
    },
    {
      clientId: c[3].id, category: "tax_fbr", product: "call", stage: "memo_delivered",
      priceUsd: 49, paymentStatus: "paid", caseManagerId: founder.id, partnerId: accountant.id,
      summary: "Non-resident with rental income in Islamabad asking whether to become a filer.",
      memoDeliveredAt: daysAgo(2), createdAt: daysAgo(5),
    },
    {
      clientId: c[4].id, category: "attestation", product: "errand", stage: "closed",
      priceUsd: 60, paymentStatus: "paid", caseManagerId: manager.id, partnerId: runner1.id,
      summary: "HEC and MOFA attestation of a degree for a licensing application abroad.",
      nps: 10, wouldRecommend: true, closedAt: daysAgo(12), createdAt: daysAgo(30),
    },
    {
      clientId: c[5].id, category: "property", product: "assessment", stage: "memo_drafting",
      priceUsd: 249, paymentStatus: "paid", caseManagerId: manager.id, partnerId: advocate1.id,
      summary: "Tenant stopped paying rent and refuses to vacate a house in Lahore.",
      driveFolderUrl: "https://drive.google.com/drive/folders/TODO-demo-6",
      nextAction: "Advocate review of draft memo", nextActionDue: daysFromNow(1), createdAt: daysAgo(3),
    },
    {
      clientId: c[6].id, category: "police_fir", product: "assessment", stage: "triage",
      priceUsd: 249, paymentStatus: "unpaid", caseManagerId: founder.id,
      summary: "Relative named in an FIR over a land dispute. Wants to understand the process. Advocate-only matter.",
      nextAction: "Send payment link and request copy of the FIR", nextActionDue: daysFromNow(1), createdAt: daysAgo(1),
    },
    {
      clientId: c[7].id, category: "company_secp", product: "question", stage: "intake",
      priceUsd: 15, paymentStatus: "unpaid",
      summary: "How to close a dormant private limited company registered with SECP.",
      createdAt: daysAgo(0),
    },
    {
      clientId: c[0].id, category: "court", product: "errand", stage: "managed",
      priceUsd: 75, paymentStatus: "paid", caseManagerId: manager.id, partnerId: runner1.id,
      summary: "Certified copies of a civil court order for the earlier property matter.",
      nextAction: "Follow up with copying branch", nextActionDue: daysAgo(1), createdAt: daysAgo(8),
    },
    {
      clientId: c[8].id, category: "other", product: "question", stage: "declined",
      priceUsd: 15, paymentStatus: "refunded",
      summary: "Asked us to 'get someone to make the problem go away'. Declined: we only offer process and information.",
      closedAt: daysAgo(14), createdAt: daysAgo(15),
    },
  ];

  const caseRows = [];
  for (const [i, seed] of caseSeeds.entries()) {
    const [row] = await db
      .insert(s.cases)
      .values({ ...seed, caseNumber: formatCaseNumber(i + 1), updatedAt: seed.createdAt })
      .returning();
    caseRows.push(row);
  }
  // Case 9 was referred by the client's own first case; case 2 by an ambassador.
  await db
    .update(s.cases)
    .set({ referredByCaseId: caseRows[0].id })
    .where(eq(s.cases.id, caseRows[8].id));

  /* ---------------------------------------------------- case notes */
  const author = (id: string | null | undefined) =>
    id === founder.id ? founder.name : manager.name;
  const notes: (typeof s.caseNotes.$inferInsert)[] = [];
  for (const [i, row] of caseRows.entries()) {
    notes.push({
      caseId: row.id,
      authorName: author(row.caseManagerId),
      body: "Case opened from intake form.",
      createdAt: caseSeeds[i].createdAt ?? daysAgo(1),
    });
    if (row.stage !== "intake") {
      notes.push({
        caseId: row.id,
        authorName: author(row.caseManagerId),
        body: `Stage changed: intake -> ${row.stage}.`,
        createdAt: daysAgo(Math.max(0, Math.round((now - (row.createdAt?.getTime() ?? now)) / DAY) - 1)),
      });
    }
  }
  notes.push(
    { caseId: caseRows[1].id, authorName: manager.name, body: "Advocate confirmed fixed fee for the succession petition; client will pay the advocate directly." },
    { caseId: caseRows[6].id, authorName: founder.name, body: "Explained that police matters are handled only by an independent advocate on their own letterhead." },
    { caseId: caseRows[9].id, authorName: founder.name, body: "Declined and refunded. Request was for influence, not process." },
  );
  await db.insert(s.caseNotes).values(notes);

  /* --------------------------------------------------------- leads */
  await db.insert(s.leads).values([
    { name: "Demo Lead 1", whatsapp: "+44 7700 900301", country: "United Kingdom", category: "property", urgency: "urgent", description: "Someone is building on our family plot in Gujranwala.", source: "website", status: "new" },
    { name: "Demo Lead 2", whatsapp: "+1 202 555 0104", email: "demo-lead-2@example.com", country: "United States", category: "inheritance", description: "Need to transfer my late mother's flat to the heirs.", referralCode: "DEMO-US1", source: "ambassador", status: "contacted" },
    { name: "Demo Lead 3", whatsapp: "+971 50 000 0301", country: "United Arab Emirates", category: "nadra", urgency: "low", description: "NICOP renewal for my parents who live with me.", source: "whatsapp", status: "new" },
    { name: "Demo Lead 4", whatsapp: "+44 7700 900302", country: "United Kingdom", category: "tax_fbr", description: "Do I need to file in Pakistan if I sell a plot?", source: "facebook", status: "lost" },
    { name: "Demo Lead 5", whatsapp: "+1 202 555 0105", country: "United States", category: "inheritance", description: "Bank account of late father, three heirs abroad.", source: "ambassador", referralCode: "DEMO-US1", status: "converted", convertedCaseId: caseRows[1].id },
    { name: "Demo Lead 6", whatsapp: "+966 50 000 0301", country: "Saudi Arabia", category: "police_fir", urgency: "urgent", description: "Brother named in FIR, what happens next?", source: "website", status: "converted", convertedCaseId: caseRows[6].id },
    { name: "Demo Lead 7", whatsapp: "+61 491 570 102", country: "Australia", category: "attestation", description: "Degree attestation for nursing registration.", source: "referral", status: "contacted" },
    { name: "Demo Lead 8", whatsapp: "+1 416 555 0103", country: "Canada", category: "company_secp", urgency: "low", description: "Dormant company, want to close it.", source: "linkedin", status: "new" },
  ]);

  /* ----------------------------------------------------- retainers */
  const retainerRows = await db
    .insert(s.retainers)
    .values([
      { clientId: c[0].id, tier: "watch", monthlyUsd: 79, startedAt: daysAgo(30) },
      { clientId: c[1].id, tier: "plus", monthlyUsd: 149, startedAt: daysAgo(20) },
      { clientId: c[3].id, tier: "family_office", monthlyUsd: 249, status: "cancelled", startedAt: daysAgo(60), cancelledAt: daysAgo(5) },
    ])
    .returning();

  /* ------------------------------------------------------ payments */
  const paidCasePayments = caseRows
    .filter((row) => row.paymentStatus === "paid" || row.paymentStatus === "refunded")
    .map((row, i) => ({
      caseId: row.id,
      amountUsd: row.priceUsd,
      method: (i % 3 === 0 ? "wise" : "stripe") as "wise" | "stripe",
      status: row.paymentStatus,
      reference: `DEMO-PAY-${String(i + 1).padStart(3, "0")}`,
      paidAt: row.createdAt,
    }));
  await db.insert(s.payments).values([
    ...paidCasePayments,
    { retainerId: retainerRows[0].id, amountUsd: 79, method: "stripe", status: "paid", reference: "DEMO-RET-001", paidAt: daysAgo(30) },
    { retainerId: retainerRows[1].id, amountUsd: 149, method: "stripe", status: "paid", reference: "DEMO-RET-002", paidAt: daysAgo(20) },
    { retainerId: retainerRows[2].id, amountUsd: 249, method: "bank", status: "paid", reference: "DEMO-RET-003", paidAt: daysAgo(60) },
    { retainerId: retainerRows[2].id, amountUsd: 249, method: "bank", status: "paid", reference: "DEMO-RET-004", paidAt: daysAgo(30) },
  ]);

  /* ------------------------------------------------- content items */
  await db.insert(s.contentItems).values([
    { title: "Five signs your plot back home needs checking", format: "post", language: "both", targetPlatform: "facebook", status: "posted", postedAt: daysAgo(9), url: "https://example.com/TODO-demo-post" },
    { title: "Succession certificate: what overseas heirs need", format: "guide", language: "en", targetPlatform: "website", status: "approved", scheduledFor: daysFromNow(2) },
    { title: "NICOP for children: documents checklist", format: "post", language: "ur", targetPlatform: "whatsapp", status: "drafted" },
    { title: "Explainer: what a Pathway Memo contains", format: "video", language: "both", targetPlatform: "youtube", status: "idea", notes: "Lawyer-fronted video depends on the Bar Council Rule 135 decision." },
    { title: "Welcome email for new retainer clients", format: "email", language: "en", targetPlatform: "email", status: "drafted" },
    { title: "Script: why we never promise outcomes", format: "script", language: "en", targetPlatform: "youtube", status: "idea" },
  ]);

  const counts = await Promise.all(
    [s.teamMembers, s.partners, s.ambassadors, s.channels, s.clients, s.cases, s.caseNotes, s.leads, s.retainers, s.payments, s.contentItems].map(
      async (table) => (await db.select({ n: sql<number>`count(*)::int` }).from(table))[0]?.n ?? 0,
    ),
  );
  return {
    team: counts[0],
    partners: counts[1],
    ambassadors: counts[2],
    channels: counts[3],
    clients: counts[4],
    cases: counts[5],
    notes: counts[6],
    leads: counts[7],
    retainers: counts[8],
    payments: counts[9],
    content: counts[10],
  };
}

/* ------------------------------------------------------------ CLI */
async function main() {
  const { config } = await import("dotenv");
  config({ path: [".env.local", ".env"], quiet: true });

  if (process.env.DATABASE_URL && !process.argv.includes("--force")) {
    console.error(
      "DATABASE_URL is set. Seeding deletes every row. Re-run with `pnpm db:seed --force` if you mean it.",
    );
    process.exit(1);
  }

  const { db, closeDb, getDbDriver } = await import("./index");
  console.log(`Seeding (${getDbDriver()})...`);
  const n = await seedDatabase(db);
  console.log(
    `Seeded: team ${n.team}, partners ${n.partners}, ambassadors ${n.ambassadors}, channels ${n.channels}, clients ${n.clients}, cases ${n.cases}, notes ${n.notes}, leads ${n.leads}, retainers ${n.retainers}, payments ${n.payments}, content ${n.content}.`,
  );
  await closeDb();
}

// Run only when executed directly (`pnpm db:seed`), not when imported by the
// app for demo mode.
if (/[\\/]seed\.[cm]?[jt]s$/.test(process.argv[1] ?? "")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
