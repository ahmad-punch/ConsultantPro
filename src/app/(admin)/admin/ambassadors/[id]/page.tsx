import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActiveBadge, ChannelStatusBadge, PaymentBadge, StageBadge } from "@/components/admin/badges";
import { CopyButton } from "@/components/admin/copy-button";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDate, formatUsd } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { HelpButton } from "@/components/admin/help-button";
import { AmbassadorForm, PayoutForm } from "@/components/admin/forms/ambassador-form";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { CHANNEL_PLATFORM_LABELS, PRODUCT_LABELS } from "@/lib/db/enums";
import { getAmbassador } from "@/lib/queries/ambassadors";
import { isUuid } from "@/lib/queries/params";
import { site } from "@/lib/site";

export const metadata = { title: "Ambassador" };

export default function AmbassadorPage({ params }: PageProps<"/admin/ambassadors/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <AmbassadorView params={params} />
    </Suspense>
  );
}

async function AmbassadorView({ params }: { params: PageProps<"/admin/ambassadors/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const a = await getAmbassador(id);
  if (!a) notFound();
  const link = `${site.url.replace(/\/$/, "")}/start?ref=${encodeURIComponent(a.referralCode)}`;

  return (
    <>
      <PageHeader
        helpTopic="ambassadors"
        eyebrow={
          <Link href="/admin/ambassadors" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeftIcon className="size-3" /> Ambassadors
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-2">
            {a.name} <ActiveBadge active={a.active} />
          </span>
        }
        description={`${[a.city, a.country].filter(Boolean).join(", ")} · ${a.commissionPct}% of paid case revenue${a.whatsapp ? ` · ${a.whatsapp}` : ""}`}
        actions={
          <>
            <div className="inline-flex items-center gap-0.5">
              <FormDialog triggerLabel="Record payout" triggerSize="sm" title="Record a commission payout" description={`Commission due now: ${formatUsd(a.due)}.`}>
                <PayoutForm id={a.id} due={a.due} />
              </FormDialog>
              <HelpButton topic="ambassadors" section="record-payout" />
            </div>
            <FormDialog triggerLabel="Edit" triggerVariant="outline" triggerSize="sm" title={`Edit ${a.name}`} wide>
              <AmbassadorForm ambassador={a} />
            </FormDialog>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 text-sm">
        <span className="text-muted-foreground">Referral link</span>
        <code className="min-w-0 flex-1 truncate font-mono text-xs">{link}</code>
        <CopyButton value={link} label="Copy link" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Referred cases" value={a.referred.length} />
        <StatCard label="Paid revenue referred" value={formatUsd(a.revenueUsd)} />
        <StatCard label="Commission earned" value={formatUsd(a.earned)} hint={`Paid out ${formatUsd(a.totalPaidUsd)}`} />
        <StatCard label="Commission due" value={formatUsd(a.due)} tone={a.due > 0 ? "highlight" : "success"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Referred cases</CardTitle>
          </CardHeader>
          <CardContent>
            {a.referred.length === 0 ? (
              <EmptyState title="No referred cases yet" description="Cases are linked when a lead uses this code, or set on the case." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="hidden sm:table-cell">Stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {a.referred.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link href={`/admin/cases/${c.id}`} className="font-mono text-primary hover:underline">
                          {c.caseNumber}
                        </Link>
                        <span className="block text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                      </TableCell>
                      <TableCell>{c.clientName}</TableCell>
                      <TableCell className="hidden md:table-cell">{PRODUCT_LABELS[c.product]}</TableCell>
                      <TableCell className="text-right font-mono">{formatUsd(c.priceUsd)}</TableCell>
                      <TableCell>
                        <PaymentBadge status={c.paymentStatus} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StageBadge stage={c.stage} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Channels they cover</CardTitle>
            </CardHeader>
            <CardContent>
              {a.channels.length === 0 ? (
                <p className="text-sm text-muted-foreground">None linked.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {a.channels.map((ch) => (
                    <li key={ch.id} className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate">
                        {ch.name}
                        <span className="block text-xs text-muted-foreground">{CHANNEL_PLATFORM_LABELS[ch.platform]}</span>
                      </span>
                      <ChannelStatusBadge status={ch.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
            </CardHeader>
            <CardContent>
              {a.clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">None linked.</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {a.clients.map((cl) => (
                    <li key={cl.id}>
                      <Link href={`/admin/clients/${cl.id}`} className="hover:text-primary hover:underline">
                        {cl.name}
                      </Link>
                      {cl.country ? <span className="text-muted-foreground"> · {cl.country}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          {a.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{a.notes}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
