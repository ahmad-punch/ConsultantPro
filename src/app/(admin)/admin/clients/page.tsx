import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { formatUsd } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { ClientForm } from "@/components/admin/forms/client-form";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { listClients } from "@/lib/queries/clients";
import { getAmbassadorOptions } from "@/lib/queries/options";
import { param } from "@/lib/queries/params";

export const metadata = { title: "Clients" };

export default function ClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Clients" />
          <TableSkeleton />
        </>
      }
    >
      <Clients searchParams={searchParams} />
    </Suspense>
  );
}

async function Clients({ searchParams }: { searchParams: PageProps<"/admin/clients">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = param(sp, "q");
  const [rows, ambassadors] = await Promise.all([listClients(q), getAmbassadorOptions()]);
  return (
    <>
      <PageHeader
        helpTopic="clients"
        title="Clients"
        description="People we have opened at least one case or retainer for."
        actions={
          <FormDialog triggerLabel="New client" title="New client" wide>
            <ClientForm ambassadors={ambassadors} />
          </FormDialog>
        }
      />
      <FilterBar basePath="/admin/clients" values={{ q }} filters={[]} searchPlaceholder="Name, phone, email, place" />
      {rows.length === 0 ? (
        <EmptyState title={q ? "No clients match" : "No clients yet"} description="Clients are created when you convert a lead or open a case." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden sm:table-cell">Location</TableHead>
                <TableHead className="text-right">Cases</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Paid</TableHead>
                <TableHead className="hidden lg:table-cell">Retainer</TableHead>
                <TableHead className="hidden lg:table-cell">Ambassador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/admin/clients/${c.id}`} className="font-medium hover:text-primary hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="block">{c.whatsapp ?? "-"}</span>
                    {c.email ? <span className="block text-xs text-muted-foreground">{c.email}</span> : null}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{[c.city, c.country].filter(Boolean).join(", ") || "-"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{c.caseCount}</TableCell>
                  <TableCell className="hidden text-right font-mono tabular-nums sm:table-cell">{formatUsd(c.paidUsd)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{c.activeRetainers ? "Active" : "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{c.ambassadorName ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">{rows.length} clients</p>
    </>
  );
}
