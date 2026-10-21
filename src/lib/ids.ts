import { sql } from "drizzle-orm";

import { db as defaultDb, type Database } from "@/lib/db";
import { cases } from "@/lib/db/schema";

export const CASE_NUMBER_PREFIX = "RS-";

/** Format a sequence number as a case number: 7 -> "RS-0007". */
export function formatCaseNumber(n: number): string {
  return `${CASE_NUMBER_PREFIX}${String(n).padStart(4, "0")}`;
}

/**
 * The next free case number, one above the highest existing number
 * ("RS-0001" when there are no cases). Numeric max, so RS-10000 sorts after
 * RS-9999. Two simultaneous inserts can collide on the unique index; the
 * caller should retry once on a unique-violation error (Postgres code 23505).
 */
export async function nextCaseNumber(database: Database = defaultDb): Promise<string> {
  const [row] = await database
    .select({
      max: sql<number | string | null>`max(cast(substring(${cases.caseNumber} from '[0-9]+$') as integer))`,
    })
    .from(cases);
  const current = row?.max == null ? 0 : Number(row.max);
  return formatCaseNumber(current + 1);
}
