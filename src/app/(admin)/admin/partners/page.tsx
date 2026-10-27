import { PencilIcon, StarIcon } from "lucide-react";
import { Suspense } from "react";

import { ArchiveButton, ArchivedBadge, ShowArchivedToggle } from "@/components/admin/archive-controls";
import { ActiveBadge, ToneBadge } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { enumOptions } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { PartnerForm } from "@/components/admin/forms/partner-form";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { archivePartnerAction, unarchivePartnerAction } from "@/lib/actions/partners";
import { requirePermission } from "@/lib/rbac";
import { PARTNER_TYPES, PARTNER_TYPE_LABELS } from "@/lib/db/enums";
import { listPartners, readPartnerFilters } from "@/lib/queries/partners";

export const metadata = { title: "Partners" };

export default function PartnersPage({ searchParams }: PageProps<"/admin/partners">) {
  return (
    <>
      <PageHeader
        helpTopic="partners"
        title="Partners"
        description="Independent advocates, errand runners, advisers and accountants. Advocates bill clients directly, on their own letterhead."
        actions={
          <FormDialog triggerLabel="New partner" title="New partner" wide>
            <PartnerForm />
          </FormDialog>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <Partners searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Partners({ searchParams }: { searchParams: PageProps<"/admin/partners">["searchParams"] }) {
  await requirePermission("partners.view");
  const f = readPartnerFilters(await searchParams);
  const rows = await listPartners(f);
  const values = { q: f.q, type: f.type, active: f.active, archived: f.archived ? "1" : undefined };
  return (
    <>
      <div className="mb-3">
        <ShowArchivedToggle basePath="/admin/partners" params={values} on={f.archived} />
      </div>
      <FilterBar
        basePath="/admin/partners"
        values={values}
        searchPlaceholder="Name or city"
        filters={[
          { name: "type", label: "Types", options: enumOptions(PARTNER_TYPES, PARTNER_TYPE_LABELS) },
          { name: "active", label: "Partners", options: [{ value: "yes", label: "Active" }, { value: "no", label: "Inactive" }] },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState title="No partners" description="Add the advocates and errand runners you have signed fixed fees and SLAs with." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Fee terms</TableHead>
                <TableHead className="hidden sm:table-cell text-right">SLA</TableHead>
                <TableHead className="hidden sm:table-cell">Rating</TableHead>
                <TableHead className="text-right">Cases</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ partner: p, openCases, totalCases }) => (
                <TableRow key={p.id} className={p.active ? undefined : "opacity-60"}>
                  <TableCell>
                    <span className="font-medium">{p.name}</span>
                    <ArchivedBadge archivedAt={p.archivedAt} />
                    <span className="block text-xs text-muted-foreground">
                      {p.city ?? "-"}
                      {p.ownLetterhead ? " · own letterhead" : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <ToneBadge tone="primary">{PARTNER_TYPE_LABELS[p.type]}</ToneBadge>
                      {!p.active ? <ActiveBadge active={false} /> : null}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="block">{p.whatsapp ?? "-"}</span>
                    {p.email ? <span className="block text-xs text-muted-foreground">{p.email}</span> : null}
                  </TableCell>
                  <TableCell className="hidden max-w-64 lg:table-cell">
                    <span className="line-clamp-2 text-xs text-muted-foreground whitespace-normal">{p.feeTerms ?? "-"}</span>
                  </TableCell>
                  <TableCell className="hidden text-right font-mono sm:table-cell">{p.slaDays ? `${p.slaDays}d` : "-"}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {p.rating ? (
                      <span className="inline-flex items-center gap-0.5" aria-label={`${p.rating} out of 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} className={i < p.rating! ? "size-3.5 fill-highlight text-highlight" : "size-3.5 text-border"} aria-hidden />
                        ))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {openCases}
                    <span className="text-muted-foreground">/{totalCases}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <FormDialog triggerLabel={<span className="sr-only">Edit {p.name}</span>} triggerIcon={<PencilIcon />} triggerVariant="ghost" triggerSize="icon-sm" title={`Edit ${p.name}`} wide>
                      <PartnerForm partner={p} />
                    </FormDialog>
                    <ArchiveButton
                      id={p.id}
                      archivedAt={p.archivedAt}
                      archive={archivePartnerAction}
                      unarchive={unarchivePartnerAction}
                      noun="partner"
                      size="icon-sm"
                      iconOnly
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Cases column: open / total.</p>
    </>
  );
}
