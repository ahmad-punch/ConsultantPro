import "server-only";

/**
 * The 90-day gate (docs/BUSINESS-PLAN.md section 10.2) and supporting tables.
 * Volumes are small (hundreds of rows), so rows are fetched once per range and
 * aggregated in TypeScript, which keeps the logic identical on Neon and PGlite.
 *
 * Definitions (also shown on the metrics page):
 * - Paid cases: cases created in range with paymentStatus = paid.
 * - Blended revenue per paid interaction: sum / count of paid payments (cases
 *   and retainers) with paidAt in range.
 * - Referral share: paid cases in range with an ambassador or a referring case.
 * - Retainer sign-ups: retainers started in range (any status).
 * - Median days to memo: working days (Mon-Fri) from case creation to
 *   memoDeliveredAt, for cases created in range with a memo delivered.
 * - Would recommend: closed cases in range with an answer; share answering yes.
 */
import { and, asc, desc, eq, gte, isNull, lt, or } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { db } from "@/lib/db";
import {
  CASE_CATEGORIES,
  CHANNEL_PLATFORMS,
  CHANNEL_STATUSES,
  PRODUCTS,
  type CaseCategory,
  type ChannelPlatform,
  type ChannelStatus,
  type ProductType,
} from "@/lib/db/enums";
import { cases, channels, leads, metricsSnapshots, payments, retainers } from "@/lib/db/schema";

import { median, workingDaysBetween } from "./time";

export type MetricsRange = { from: Date; to: Date };

export type GateMetric = {
  key: string;
  label: string;
  value: number | null;
  display: string;
  threshold: string;
  pass: boolean | null;
  detail: string;
};

export async function getFirstCaseDate(): Promise<Date | null> {
  const [row] = await db
    .select({ createdAt: cases.createdAt })
    .from(cases)
    .orderBy(asc(cases.createdAt))
    .limit(1);
  return row?.createdAt ?? null;
}

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${Math.round(n * 100)}%`;

export async function getMetrics(range: MetricsRange) {
  const inRange = (col: AnyPgColumn) => and(gte(col, range.from), lt(col, range.to));

  const [caseRows, paidPayments, retainerRows, leadRows, channelRows] = await Promise.all([
    db
      .select({
        id: cases.id,
        category: cases.category,
        product: cases.product,
        stage: cases.stage,
        priceUsd: cases.priceUsd,
        paymentStatus: cases.paymentStatus,
        ambassadorId: cases.ambassadorId,
        referredByCaseId: cases.referredByCaseId,
        memoDeliveredAt: cases.memoDeliveredAt,
        wouldRecommend: cases.wouldRecommend,
        nps: cases.nps,
        createdAt: cases.createdAt,
      })
      .from(cases)
      .where(and(inRange(cases.createdAt), isNull(cases.archivedAt))),
    db
      .select({
        amountUsd: payments.amountUsd,
        paidAt: payments.paidAt,
        caseProduct: cases.product,
        retainerId: payments.retainerId,
      })
      .from(payments)
      .leftJoin(cases, eq(payments.caseId, cases.id))
      .where(
        and(
          eq(payments.status, "paid"),
          inRange(payments.paidAt),
          or(isNull(payments.caseId), isNull(cases.archivedAt)),
        ),
      ),
    db
      .select({ id: retainers.id, tier: retainers.tier, status: retainers.status })
      .from(retainers)
      .where(inRange(retainers.startedAt)),
    db
      .select({ source: leads.source, status: leads.status })
      .from(leads)
      .where(and(inRange(leads.createdAt), isNull(leads.archivedAt))),
    db
      .select({ platform: channels.platform, status: channels.status })
      .from(channels)
      .where(isNull(channels.archivedAt)),
  ]);

  /* ------------------------------------------------------------ gate */
  const paid = caseRows.filter((c) => c.paymentStatus === "paid");
  const revenue = paidPayments.reduce((s, p) => s + p.amountUsd, 0);
  const blended = paidPayments.length ? revenue / paidPayments.length : null;
  const referred = paid.filter((c) => c.ambassadorId || c.referredByCaseId);
  const referralShare = paid.length ? referred.length / paid.length : null;
  const memoDays = caseRows
    .filter((c) => c.memoDeliveredAt)
    .map((c) => workingDaysBetween(c.createdAt, c.memoDeliveredAt!));
  const medianMemo = median(memoDays);
  const answered = caseRows.filter((c) => c.stage === "closed" && c.wouldRecommend !== null);
  const recommendShare = answered.length
    ? answered.filter((c) => c.wouldRecommend).length / answered.length
    : null;
  const npsScores = caseRows.filter((c) => c.nps !== null).map((c) => c.nps!);

  const gate: GateMetric[] = [
    {
      key: "paid",
      label: "Paid cases",
      value: paid.length,
      display: String(paid.length),
      threshold: "At least 20",
      pass: paid.length >= 20,
      detail: `${caseRows.length} cases opened in range`,
    },
    {
      key: "blended",
      label: "Revenue per paid interaction",
      value: blended,
      display: blended === null ? "No payments" : usd(Math.round(blended)),
      threshold: "At least $40",
      pass: blended === null ? null : blended >= 40,
      detail: `${usd(revenue)} across ${paidPayments.length} paid payments`,
    },
    {
      key: "referrals",
      label: "Paid cases from referrals",
      value: referralShare,
      display: referralShare === null ? "No paid cases" : pct(referralShare),
      threshold: "At least 30%",
      pass: referralShare === null ? null : referralShare >= 0.3,
      detail: `${referred.length} of ${paid.length} via an ambassador or earlier client`,
    },
    {
      key: "retainers",
      label: "Retainer sign-ups",
      value: retainerRows.length,
      display: String(retainerRows.length),
      threshold: "At least 3",
      pass: retainerRows.length >= 3,
      detail: `${retainerRows.filter((r) => r.status === "active").length} still active`,
    },
    {
      key: "memo",
      label: "Median working days to memo",
      value: medianMemo,
      display: medianMemo === null ? "No memos yet" : medianMemo.toFixed(1),
      threshold: "Under 5",
      pass: medianMemo === null ? null : medianMemo < 5,
      detail: `${memoDays.length} memos delivered`,
    },
    {
      key: "recommend",
      label: "Would recommend",
      value: recommendShare,
      display: recommendShare === null ? "No answers yet" : pct(recommendShare),
      threshold: "At least 80%",
      pass: recommendShare === null ? null : recommendShare >= 0.8,
      detail: `${answered.length} closed cases answered${
        npsScores.length ? `; mean NPS score ${(npsScores.reduce((a, b) => a + b, 0) / npsScores.length).toFixed(1)}` : ""
      }`,
    },
  ];

  /* ------------------------------------------------- leads by source */
  const sourceMap = new Map<string, { total: number; converted: number; lost: number }>();
  for (const l of leadRows) {
    const s = sourceMap.get(l.source) ?? { total: 0, converted: 0, lost: 0 };
    s.total += 1;
    if (l.status === "converted") s.converted += 1;
    if (l.status === "lost") s.lost += 1;
    sourceMap.set(l.source, s);
  }
  const leadsBySource = [...sourceMap.entries()]
    .map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => b.total - a.total);

  /* ----------------------------------------------- cases by category */
  const casesByCategory = CASE_CATEGORIES.map((category: CaseCategory) => {
    const rows = caseRows.filter((c) => c.category === category);
    const paidRows = rows.filter((c) => c.paymentStatus === "paid");
    return {
      category,
      total: rows.length,
      paid: paidRows.length,
      revenueUsd: paidRows.reduce((s, c) => s + c.priceUsd, 0),
    };
  }).filter((r) => r.total > 0);

  /* ------------------------------------- revenue by product by month */
  const months = new Map<string, Record<ProductType, number>>();
  for (const p of paidPayments) {
    if (!p.paidAt) continue;
    const month = p.paidAt.toISOString().slice(0, 7);
    const product: ProductType = p.retainerId ? "retainer" : (p.caseProduct ?? "question");
    const row = months.get(month) ?? (Object.fromEntries(PRODUCTS.map((x) => [x, 0])) as Record<ProductType, number>);
    row[product] += p.amountUsd;
    months.set(month, row);
  }
  const revenueByMonth = [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, byProduct]) => ({
      month,
      byProduct,
      total: Object.values(byProduct).reduce((a, b) => a + b, 0),
    }));

  /* ------------------------------------------------ channel coverage */
  const channelCoverage = CHANNEL_PLATFORMS.map((platform: ChannelPlatform) => {
    const rows = channelRows.filter((c) => c.platform === platform);
    const byStatus = Object.fromEntries(
      CHANNEL_STATUSES.map((s: ChannelStatus) => [s, rows.filter((r) => r.status === s).length]),
    ) as Record<ChannelStatus, number>;
    return { platform, total: rows.length, byStatus };
  });

  return {
    gate,
    passed: gate.filter((g) => g.pass === true).length,
    revenue,
    leadsTotal: leadRows.length,
    leadsBySource,
    casesByCategory,
    revenueByMonth,
    channelCoverage,
  };
}
export type Metrics = Awaited<ReturnType<typeof getMetrics>>;


/* ------------------------------------------------------- snapshots */

/** Flatten the gate into the jsonb shape stored on metrics_snapshots. */
export function gateToSnapshotValues(gate: GateMetric[]): Record<string, number | boolean | null> {
  const out: Record<string, number | boolean | null> = {};
  for (const g of gate) {
    out[g.key] = g.value;
    out[`${g.key}Pass`] = g.pass;
  }
  out.passed = gate.filter((g) => g.pass === true).length;
  return out;
}

/** Compute the gate for `range` now and store it. Call after requireAdmin(). */
export async function saveMetricsSnapshot(range: MetricsRange, note: string | null) {
  const { gate } = await getMetrics(range);
  const [row] = await db
    .insert(metricsSnapshots)
    .values({ rangeFrom: range.from, rangeTo: range.to, values: gateToSnapshotValues(gate), note })
    .returning({ id: metricsSnapshots.id });
  return row.id;
}

export async function listMetricsSnapshots(limit = 50) {
  return db.select().from(metricsSnapshots).orderBy(desc(metricsSnapshots.takenAt)).limit(limit);
}
