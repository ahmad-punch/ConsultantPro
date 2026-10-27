import { Suspense } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { formatShortDate } from "@/components/admin/format";
import { DispatchGroupCard } from "@/components/admin/network/dispatch-group";
import { PageHeader } from "@/components/admin/page-header";
import { CardsSkeleton } from "@/components/admin/skeletons";
import { requirePermission } from "@/lib/rbac";
import { ENGAGEMENT_STATUS_LABELS, type EngagementStatus } from "@/lib/db/enums";
import { getDispatchBoard, rankedProvidersFor } from "@/lib/queries/network";
import { param } from "@/lib/queries/params";

export const metadata = { title: "Network: dispatch" };

export default function DispatchPage({ searchParams }: PageProps<"/admin/network/dispatch">) {
  return (
    <>
      <PageHeader
        helpTopic="network"
        helpSection="dispatch"
        title="Dispatch"
        description="Open engagements and unassigned errand-type cases, grouped by city and office, so one visit can cover several clients."
      />
      <Suspense fallback={<CardsSkeleton />}>
        <Board searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Board({ searchParams }: { searchParams: PageProps<"/admin/network/dispatch">["searchParams"] }) {
  await requirePermission("network.view");
  const focus = param(await searchParams, "focus")?.toLowerCase();
  const groups = await getDispatchBoard();
  if (groups.length === 0) {
    return <EmptyState title="Nothing to dispatch" description="Errand-type cases without an accepted engagement, and open engagements, appear here." />;
  }
  const withProviders = await Promise.all(
    groups.map(async (g) => ({
      g,
      providers: await rankedProvidersFor(g.city === "No city" ? null : g.city, g.department === "No office" ? null : g.department),
    })),
  );
  withProviders.sort((a, b) => Number(`${b.g.city}|${b.g.department}`.toLowerCase() === focus) - Number(`${a.g.city}|${a.g.department}`.toLowerCase() === focus));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {withProviders.map(({ g, providers }) => (
        <DispatchGroupCard
          key={`${g.city}|${g.department}`}
          city={g.city}
          department={g.department}
          highlighted={`${g.city}|${g.department}`.toLowerCase() === focus}
          items={g.items.map((i) => ({
            key: i.key,
            kind: i.kind,
            caseId: i.caseId,
            caseNumber: i.caseNumber,
            summary: i.summary,
            engagementId: i.engagementId,
            status: i.status,
            statusLabel: i.status ? ENGAGEMENT_STATUS_LABELS[i.status as EngagementStatus] : undefined,
            providerName: i.providerName,
            batchKey: i.batchKey,
            due: i.dueAt ? formatShortDate(i.dueAt) : undefined,
          }))}
          providers={providers.map((p) => ({ id: p.id, name: p.name, tier: p.tier, rating: p.avgRating ?? p.rating, completed: p.casesCompleted }))}
        />
      ))}
    </div>
  );
}
