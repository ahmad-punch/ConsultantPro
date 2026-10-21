import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { enumOptions } from "@/components/admin/format";
import { OnboardingBadge, TierBadge } from "@/components/admin/network/network-badges";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { PARTNER_TIERS, PARTNER_TIER_LABELS, PARTNER_TYPES, PARTNER_TYPE_LABELS } from "@/lib/db/enums";
import { listProviders, readProviderFilters } from "@/lib/queries/network";
import { DEPARTMENTS, splitList } from "@/lib/validation/applications";

export const metadata = { title: "Network: providers" };

export default function ProvidersPage({ searchParams }: PageProps<"/admin/network/providers">) {
  return (
    <>
      <PageHeader
        helpTopic="network"
        helpSection="providers"
        title="Providers"
        description="Every solution provider: advocates, errand runners, accountants and advisers, with the offices and cities they cover."
      />
      <Suspense fallback={<TableSkeleton />}>
        <Providers searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Providers({ searchParams }: { searchParams: PageProps<"/admin/network/providers">["searchParams"] }) {
  await requireAdmin();
  const f = readProviderFilters(await searchParams);
  const rows = await listProviders(f);
  return (
    <>
      <FilterBar
        basePath="/admin/network/providers"
        values={f}
        searchPlaceholder="Name or city"
        filters={[
          { name: "type", label: "Types", options: enumOptions(PARTNER_TYPES, PARTNER_TYPE_LABELS) },
          { name: "department", label: "Offices", options: DEPARTMENTS.map((d) => ({ value: d, label: d })) },
          { name: "tier", label: "Tiers", options: enumOptions(PARTNER_TIERS, PARTNER_TIER_LABELS) },
        ]}
      />
      {f.city ? <p className="mb-3 text-xs text-muted-foreground">Serving city: {f.city}</p> : null}
      {rows.length === 0 ? (
        <EmptyState title="No providers" description="Approve an application, or add one under Partners." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="hidden sm:table-cell">Onboarding</TableHead>
                <TableHead className="hidden md:table-cell">Offices</TableHead>
                <TableHead className="hidden md:table-cell">Service areas</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Done</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/admin/partners/${p.id}`} className="font-medium hover:text-primary hover:underline">
                      {p.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground">{PARTNER_TYPE_LABELS[p.type]}</span>
                  </TableCell>
                  <TableCell>
                    <TierBadge tier={p.tier} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <OnboardingBadge stage={p.onboardingStage} />
                  </TableCell>
                  <TableCell className="hidden max-w-56 text-xs whitespace-normal md:table-cell">{splitList(p.departments).join(", ") || "-"}</TableCell>
                  <TableCell className="hidden max-w-56 text-xs whitespace-normal md:table-cell">
                    {splitList(p.serviceAreas).map((c, i) => (
                      <span key={c}>
                        {i ? ", " : ""}
                        <Link href={`/admin/network/providers?city=${encodeURIComponent(c)}`} className="hover:underline">
                          {c}
                        </Link>
                      </span>
                    ))}
                    {!p.serviceAreas ? "-" : null}
                  </TableCell>
                  <TableCell className="text-right font-mono">{p.avgRating ?? p.rating ?? "-"}</TableCell>
                  <TableCell className="text-right font-mono">{p.casesCompleted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
