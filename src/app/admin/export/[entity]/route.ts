import { and, asc, getTableColumns, gte, lt, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { requirePermission } from "@/lib/rbac";
import { toCsv, csvResponse, type CsvValue } from "@/lib/csv";
import { db } from "@/lib/db";
import {
  ambassadors,
  cases,
  channels,
  clients,
  invoices,
  leads,
  partners,
  payments,
  retainers,
} from "@/lib/db/schema";
import { parseDateInput } from "@/lib/validation/fields";

/** Exportable tables. Each has a createdAt column used by ?from=&to=. */
const ENTITIES = { cases, leads, clients, payments, invoices, ambassadors, channels, partners, retainers } as const;
type Entity = keyof typeof ENTITIES;

/** Columns never exported: bearer tokens that open client-facing pages. */
const SECRET_COLUMNS = new Set(["publicToken"]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function cell(v: unknown): CsvValue {
  if (v === null || v === undefined) return null;
  if (v instanceof Date || typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  return JSON.stringify(v);
}

/** GET /admin/export/cases?from=2026-10-01&to=2026-10-31 -> CSV (to is inclusive). */
export async function GET(request: Request, { params }: RouteContext<"/admin/export/[entity]">) {
  await requirePermission("data.export");
  const { entity } = await params;
  if (!(entity in ENTITIES)) return new Response("Unknown export", { status: 404 });
  const table = ENTITIES[entity as Entity] as PgTable & { createdAt: (typeof cases)["createdAt"] };
  const columns = getTableColumns(table);
  const names = Object.keys(columns).filter((n) => !SECRET_COLUMNS.has(n));

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const where: SQL[] = [];
  if (from && DATE_RE.test(from)) where.push(gte(table.createdAt, new Date(`${from}T00:00:00Z`)));
  if (to && DATE_RE.test(to)) {
    const end = parseDateInput(to);
    end.setUTCHours(24, 0, 0, 0);
    where.push(lt(table.createdAt, end));
  }

  const rows = (await db
    .select()
    .from(table)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(table.createdAt))) as Record<string, unknown>[];

  const csv = toCsv(
    names,
    rows.map((r) => names.map((n) => cell(r[n]))),
  );
  const stamp = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `rasta-${entity}-${stamp}.csv`);
}
