import { ArrowLeftIcon, MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActionButton } from "@/components/admin/action-form";
import { LeadStatusBadge, StageBadge, UrgencyBadge } from "@/components/admin/badges";
import { formatDateTime } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { ConvertLeadForm } from "@/components/admin/forms/convert-lead-form";
import { LeadForm } from "@/components/admin/forms/lead-form";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setLeadStatusAction } from "@/lib/actions/leads";
import { requireAdmin } from "@/lib/auth";
import { CASE_CATEGORY_LABELS } from "@/lib/db/enums";
import { getLead } from "@/lib/queries/leads";
import { getTeamOptions } from "@/lib/queries/options";
import { isUuid } from "@/lib/queries/params";

export const metadata = { title: "Lead" };

export default function LeadPage({ params }: PageProps<"/admin/leads/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <LeadDetail params={params} />
    </Suspense>
  );
}

async function LeadDetail({ params }: { params: PageProps<"/admin/leads/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [lead, team] = await Promise.all([getLead(id), getTeamOptions()]);
  if (!lead) notFound();
  const waDigits = lead.whatsapp.replace(/\D/g, "");
  const open = lead.status === "new" || lead.status === "contacted";

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/admin/leads" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeftIcon className="size-3" /> Leads
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-2">
            {lead.name}
            <LeadStatusBadge status={lead.status} />
            <UrgencyBadge urgency={lead.urgency} />
          </span>
        }
        description={`${CASE_CATEGORY_LABELS[lead.category]} · ${lead.country} · received ${formatDateTime(lead.createdAt)}`}
        actions={
          <>
            {lead.status === "new" ? (
              <ActionButton action={setLeadStatusAction} fields={{ id: lead.id, status: "contacted" }} variant="default">
                Mark contacted
              </ActionButton>
            ) : null}
            {open ? (
              <ActionButton
                action={setLeadStatusAction}
                fields={{ id: lead.id, status: "lost" }}
                confirm="Mark this lead as lost?"
              >
                Mark lost
              </ActionButton>
            ) : null}
            {lead.status === "lost" ? (
              <ActionButton action={setLeadStatusAction} fields={{ id: lead.id, status: "new" }}>
                Reopen
              </ActionButton>
            ) : null}
            <FormDialog triggerLabel="Edit" triggerVariant="outline" triggerSize="sm" title="Edit lead" wide>
              <LeadForm lead={lead} />
            </FormDialog>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>What they asked</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm whitespace-pre-wrap">{lead.description}</p>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Info label="WhatsApp">
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <MessageCircleIcon className="size-3.5" />
                  {lead.whatsapp}
                </a>
              </Info>
              <Info label="Email">{lead.email ?? "-"}</Info>
              <Info label="Country">{lead.country}</Info>
              <Info label="Source">{lead.source}</Info>
              <Info label="Referral code">
                {lead.referralCode ? (
                  <>
                    <span className="font-mono">{lead.referralCode}</span>
                    {lead.ambassador ? (
                      <>
                        {" "}
                        ·{" "}
                        <Link href={`/admin/ambassadors/${lead.ambassador.id}`} className="text-primary hover:underline">
                          {lead.ambassador.name}
                        </Link>
                      </>
                    ) : (
                      <span className="text-muted-foreground"> (no ambassador with this code)</span>
                    )}
                  </>
                ) : (
                  "-"
                )}
              </Info>
              <Info label="Last updated">{formatDateTime(lead.updatedAt)}</Info>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lead.convertedCase ? "Converted" : "Convert to case"}</CardTitle>
            <CardDescription>
              {lead.convertedCase
                ? "This lead has a case."
                : lead.matchingClients.length
                  ? `Will be added to existing client ${lead.matchingClients[0].name} (same WhatsApp or email).`
                  : "Creates a new client from this lead, then opens a case."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lead.convertedCase ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <span className="font-mono text-sm">{lead.convertedCase.caseNumber}</span>
                <StageBadge stage={lead.convertedCase.stage} />
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/cases/${lead.convertedCase.id}`}>Open case</Link>
                </Button>
              </div>
            ) : lead.status === "lost" ? (
              <p className="text-sm text-muted-foreground">Reopen the lead to convert it.</p>
            ) : (
              <ConvertLeadForm
                leadId={lead.id}
                description={lead.description}
                category={lead.category}
                team={team}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
