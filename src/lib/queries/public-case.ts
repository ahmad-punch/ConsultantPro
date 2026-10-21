/**
 * Public, unauthenticated case lookup for the client status page (/c/[token]).
 * Returns only the fields the client may see. Archived cases are hidden.
 */
import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";

/** Notes whose body starts with this marker never reach the client. */
export const INTERNAL_NOTE_PREFIX = "[internal]";

export async function getPublicCase(token: string) {
  if (!token || token.length < 16 || token.length > 100) return null;
  const row = await db.query.cases.findFirst({
    where: and(eq(cases.publicToken, token), isNull(cases.archivedAt)),
    columns: {
      id: true,
      caseNumber: true,
      product: true,
      category: true,
      stage: true,
      paymentStatus: true,
      paymentLink: true,
      priceUsd: true,
      driveFolderUrl: true,
      memoDocUrl: true,
      memoDeliveredAt: true,
      nextAction: true,
      nextActionDue: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      client: { columns: { name: true } },
      notes: {
        columns: { id: true, body: true, createdAt: true },
        orderBy: (n, { desc }) => [desc(n.createdAt)],
        limit: 25,
      },
    },
  });
  if (!row) return null;
  const notes = row.notes
    .filter((n) => !n.body.trimStart().toLowerCase().startsWith(INTERNAL_NOTE_PREFIX))
    .slice(0, 5);
  return { ...row, notes, firstName: row.client.name.split(/\s+/)[0] ?? "" };
}

export type PublicCase = NonNullable<Awaited<ReturnType<typeof getPublicCase>>>;
