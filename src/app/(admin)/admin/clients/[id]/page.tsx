import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActionButton } from "@/components/admin/action-form";
import { PaymentBadge, RetainerStatusBadge, StageBadge } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDate, formatUsd } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { ClientForm } from "@/components/admin/forms/client-form";
import { RetainerForm } from "@/components/admin/forms/retainer-form";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cancelRetainerAction } from "@/lib/actions/retainers";
import { requireAdmin } from "@/lib/auth";
import { CASE_CATEGORY_LABELS, PRODUCT_LABELS, RETAINER_TIER_LABELS } from "@/lib/db/enums";
import { getClient } from "@/lib/queries/clients";
import { getAmbassadorOptions } from "@/lib/queries/options";
import { isUuid } from "@/lib/queries/params";

export const metadata = { title: "Client" };

export default function ClientPage({ params }: PageProps<"/admin/clients/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ClientView params={params} />
    </Suspense>
  );
}

async function ClientView({ params }: { params: PageProps<"/admin/clients/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [client, ambassadors] = await Promise.all([getClient(id), getAmbassadorOptions(true)]);
  if (!client) notFound();
  const paid = client.cases.filter((c) => c.paymentStatus === "paid").reduce((s, c) => s + c.priceUsd, 0);

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/admin/clients" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeftIcon className="size-3" /> Clients
          </Link>
        }
        title={client.name}
        description={`${[client.city, client.country].filter(Boolean).join(", ") || "Location not set"} · client since ${formatDate(client.createdAt)} · ${formatUsd(paid)} paid`}
        actions={
          <Button asChild size="sm">
            <Link href={`/admin/cases/new?clientId=${client.id}`}>New case for this client</Link>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cases</CardTitle>
            </CardHeader>
            <CardContent>
              {client.cases.length === 0 ? (
                <EmptyState title="No cases yet" />
              ) : (
                <ul className="divide-y">
                  {client.cases.map((c) => (
                    <li key={c.id}>
                      <Link href={`/admin/cases/${c.id}`} className="-mx-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2.5 hover:bg-muted/60">
                        <span className="font-mono text-sm font-medium text-primary">{c.caseNumber}</span>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {PRODUCT_LABELS[c.product]} · {CASE_CATEGORY_LABELS[c.category]}
                        </span>
                        <span className="font-mono text-sm">{formatUsd(c.priceUsd)}</span>
                        <PaymentBadge status={c.paymentStatus} />
                        <StageBadge stage={c.stage} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Retainers</CardTitle>
              <CardAction>
                <FormDialog triggerLabel="Start retainer" triggerVariant="outline" triggerSize="sm" title="Start a retainer">
                  <RetainerForm clients={[{ value: client.id, label: client.name }]} defaultClientId={client.id} />
                </FormDialog>
              </CardAction>
            </CardHeader>
            <CardContent>
              {client.retainers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No retainer. Offer one to every Case Assessment client.</p>
              ) : (
                <ul className="divide-y">
                  {client.retainers.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                      <span className="font-medium">{RETAINER_TIER_LABELS[r.tier]}</span>
                      <span className="font-mono">{formatUsd(r.monthlyUsd)} / month</span>
                      <span className="text-muted-foreground">
                        since {formatDate(r.startedAt)}
                        {r.cancelledAt ? `, cancelled ${formatDate(r.cancelledAt)}` : ""}
                      </span>
                      <span className="ml-auto flex items-center gap-2">
                        <RetainerStatusBadge status={r.status} />
                        {r.status === "active" ? (
                          <ActionButton action={cancelRetainerAction} fields={{ id: r.id }} variant="ghost" confirm="Cancel this retainer?">
                            Cancel
                          </ActionButton>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientForm client={client} ambassadors={ambassadors} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ambassador</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {client.ambassador ? (
                <Link href={`/admin/ambassadors/${client.ambassador.id}`} className="text-primary hover:underline">
                  {client.ambassador.name} ({client.ambassador.referralCode})
                </Link>
              ) : (
                <span className="text-muted-foreground">Not referred by an ambassador.</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
