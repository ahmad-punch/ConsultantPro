import { count } from "drizzle-orm";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, leads } from "@/lib/db/schema";

// Placeholder dashboard. The admin-panel agent replaces this file.
export default function AdminHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <Suspense fallback={<Skeleton className="h-6 w-48" />}>
        <Counts />
      </Suspense>
    </div>
  );
}

async function Counts() {
  await requireAdmin();
  const [[caseCount], [leadCount]] = await Promise.all([
    db.select({ n: count() }).from(cases),
    db.select({ n: count() }).from(leads),
  ]);
  return (
    <p className="text-muted-foreground">
      {caseCount?.n ?? 0} cases, {leadCount?.n ?? 0} leads.
    </p>
  );
}
