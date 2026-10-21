import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  FileCheckIcon,
  MessageCircleIcon,
  StepForwardIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActionButton } from "@/components/admin/action-form";
import { PaymentBadge, StageBadge, ToneBadge } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { dueLabel, formatDate, formatDateTime, formatUsd } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { HelpButton } from "@/components/admin/help-button";
import { CaseEditForm } from "@/components/admin/forms/case-edit-form";
import { AddNoteForm, CloseCaseForm, SetStageForm } from "@/components/admin/forms/case-stage-forms";
import { PaymentForm } from "@/components/admin/forms/payment-form";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { advanceStageAction, markMemoDeliveredAction } from "@/lib/actions/cases";
import { requireAdmin } from "@/lib/auth";
import {
  CASE_CATEGORY_LABELS,
  CASE_STAGE_LABELS,
  PAYMENT_METHOD_LABELS,
  PRODUCT_LABELS,
  type CaseStage,
} from "@/lib/db/enums";
import { getCase, type CaseDetail } from "@/lib/queries/cases";
import {
  getAmbassadorOptions,
  getCaseOptions,
  getPartnerOptions,
  getTeamOptions,
} from "@/lib/queries/options";
import { isUuid } from "@/lib/queries/params";
import { workingDaysBetween } from "@/lib/queries/time";
import { cn } from "@/lib/utils";
import { nextStage, stagePath } from "@/lib/validation/cases";

export const metadata = { title: "Case" };

export default function CasePage({ params }: PageProps<"/admin/cases/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CaseView params={params} />
    </Suspense>
  );
}

async function CaseView({ params }: { params: PageProps<"/admin/cases/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [c, team, partners, ambassadors, cases] = await Promise.all([
    getCase(id),
    getTeamOptions(true),
    getPartnerOptions(true),
    getAmbassadorOptions(true),
    getCaseOptions(),
  ]);
  if (!c) notFound();
  const now = new Date();
  const next = nextStage(c.product, c.stage);
  const isClosed = c.stage === "closed" || c.stage === "declined";
  const hasMemo = c.product !== "errand";
  const due = c.nextActionDue && !isClosed ? dueLabel(c.nextActionDue, now) : null;

  return (
    <>
      <PageHeader
        helpTopic="cases"
        eyebrow={
          <Link href="/admin/cases" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeftIcon className="size-3" /> Cases
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono">{c.caseNumber}</span>
            <Link href={`/admin/clients/${c.client.id}`} className="hover:text-primary hover:underline">
              {c.client.name}
            </Link>
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StageBadge stage={c.stage} />
            <PaymentBadge status={c.paymentStatus} />
            <span>
              {PRODUCT_LABELS[c.product]} · {CASE_CATEGORY_LABELS[c.category]} ·{" "}
              <span className="font-mono">{formatUsd(c.priceUsd)}</span> · opened {formatDate(c.createdAt)}
            </span>
          </span>
        }
        actions={
          <>
            {next ? (
              <div className="inline-flex items-center gap-0.5">
                <ActionButton
                  action={advanceStageAction}
                  fields={{ id: c.id }}
                  variant="default"
                  icon={<StepForwardIcon />}
                >
                  Move to {CASE_STAGE_LABELS[next]}
                </ActionButton>
                <HelpButton topic="cases" section="advance-stage" />
              </div>
            ) : null}
            {hasMemo && !c.memoDeliveredAt && !isClosed ? (
              <div className="inline-flex items-center gap-0.5">
                <ActionButton action={markMemoDeliveredAction} fields={{ id: c.id }} icon={<FileCheckIcon />}>
                  Mark memo delivered
                </ActionButton>
                <HelpButton topic="cases" section="mark-memo-delivered" />
              </div>
            ) : null}
            <div className="inline-flex items-center gap-0.5">
              <FormDialog triggerLabel="Record payment" triggerVariant="outline" triggerSize="sm" title={`Record payment for ${c.caseNumber}`}>
                <PaymentForm caseId={c.id} defaultAmount={c.priceUsd} />
              </FormDialog>
              <HelpButton topic="cases" section="record-payment" />
            </div>
            <div className="inline-flex items-center gap-0.5">
              <FormDialog triggerLabel="Set stage" triggerVariant="outline" triggerSize="sm" title="Set stage" description="Use this to skip, go back, or decline. The change is logged.">
                <SetStageForm id={c.id} stage={c.stage} />
              </FormDialog>
              <HelpButton topic="cases" section="set-stage" />
            </div>
            <div className="inline-flex items-center gap-0.5">
              <FormDialog
                triggerLabel={c.stage === "closed" ? "Edit close-out" : "Close out"}
                triggerVariant="outline"
                triggerSize="sm"
                title="Close out the case"
                description="Ask the client the two feedback questions before closing."
              >
                <CloseCaseForm id={c.id} nps={c.nps} wouldRecommend={c.wouldRecommend} closedAt={c.closedAt} />
              </FormDialog>
              <HelpButton topic="cases" section="close-out" />
            </div>
          </>
        }
      />

      <StageStepper c={c} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                Next action
                {due ? <ToneBadge tone={due.tone}>{due.label}</ToneBadge> : null}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {c.nextAction ?? <span className="text-muted-foreground">None set. Add one below so this case shows on the dashboard.</span>}
                {c.nextActionDue ? <span className="text-muted-foreground"> · due {formatDate(c.nextActionDue)}</span> : null}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Case details</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseEditForm c={c} team={team} partners={partners} ambassadors={ambassadors} cases={cases} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <AddNoteForm caseId={c.id} />
              {c.notes.length === 0 ? (
                <EmptyState title="No activity yet" />
              ) : (
                <ol className="relative space-y-4 border-l pl-5">
                  {c.notes.map((n) => (
                    <li key={n.id} className="relative">
                      <span className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full border-2 border-background bg-primary/60" aria-hidden />
                      <p className="text-sm whitespace-pre-wrap">{n.body}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {n.authorName} · {formatDateTime(n.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link href={`/admin/clients/${c.client.id}`} className="font-medium text-primary hover:underline">
                {c.client.name}
              </Link>
              {c.client.whatsapp ? (
                <p>
                  <a
                    href={`https://wa.me/${c.client.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    <MessageCircleIcon className="size-3.5" />
                    {c.client.whatsapp}
                  </a>
                </p>
              ) : null}
              {c.client.email ? <p className="text-muted-foreground">{c.client.email}</p> : null}
              <p className="text-muted-foreground">{[c.client.city, c.client.country].filter(Boolean).join(", ") || "-"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>People and links</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm">
                <Row label="Case manager">{c.caseManager?.name ?? "Unassigned"}</Row>
                <Row label="Partner">
                  {c.partner ? (
                    <Link href="/admin/partners" className="hover:text-primary">
                      {c.partner.name}
                      {c.partner.slaDays ? <span className="text-muted-foreground"> · SLA {c.partner.slaDays}d</span> : null}
                    </Link>
                  ) : (
                    "None"
                  )}
                </Row>
                <Row label="Drive folder"><ExtLink href={c.driveFolderUrl} /></Row>
                <Row label="Memo">
                  <ExtLink href={c.memoDocUrl} />
                  {c.memoDeliveredAt ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Delivered {formatDate(c.memoDeliveredAt)} ({workingDaysBetween(c.createdAt, c.memoDeliveredAt)} working days)
                    </span>
                  ) : null}
                </Row>
                <Row label="Payment link"><ExtLink href={c.paymentLink} /></Row>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {c.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {c.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                      <div>
                        <span className="font-mono">{formatUsd(p.amountUsd)}</span>
                        <span className="text-muted-foreground"> · {PAYMENT_METHOD_LABELS[p.method]}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatDate(p.paidAt ?? p.createdAt)}
                          {p.reference ? ` · ${p.reference}` : ""}
                        </span>
                      </div>
                      <PaymentBadge status={p.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referral and feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm">
                <Row label="Ambassador">
                  {c.ambassador ? (
                    <Link href={`/admin/ambassadors/${c.ambassador.id}`} className="text-primary hover:underline">
                      {c.ambassador.name} ({c.ambassador.referralCode})
                    </Link>
                  ) : (
                    "None"
                  )}
                </Row>
                <Row label="Referred by case">
                  {c.referredByCase ? (
                    <Link href={`/admin/cases/${c.referredByCase.id}`} className="font-mono text-primary hover:underline">
                      {c.referredByCase.caseNumber}
                    </Link>
                  ) : (
                    "None"
                  )}
                </Row>
                {c.referredCases.length ? (
                  <Row label="Referred others">
                    {c.referredCases.map((r) => (
                      <Link key={r.id} href={`/admin/cases/${r.id}`} className="mr-2 font-mono text-primary hover:underline">
                        {r.caseNumber}
                      </Link>
                    ))}
                  </Row>
                ) : null}
                {c.leads.length ? (
                  <Row label="From lead">
                    {c.leads.map((l) => (
                      <Link key={l.id} href={`/admin/leads/${l.id}`} className="text-primary hover:underline">
                        {l.name} ({l.source})
                      </Link>
                    ))}
                  </Row>
                ) : null}
                <Row label="NPS">{c.nps ?? "-"}</Row>
                <Row label="Would recommend">
                  {c.wouldRecommend === null ? "-" : c.wouldRecommend ? "Yes" : "No"}
                </Row>
                <Row label="Closed">{formatDate(c.closedAt)}</Row>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function StageStepper({ c }: { c: CaseDetail }) {
  const path = stagePath(c.product);
  const declined = c.stage === "declined";
  const offPath = !path.includes(c.stage) && !declined;
  const current = path.indexOf(c.stage);
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card p-3">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <ol className="flex min-w-max items-center gap-1" aria-label="Case stages">
          {path.map((s: CaseStage, i) => {
            const done = !declined && current > i;
            const here = current === i;
            return (
              <li key={s} className="flex items-center gap-1">
                <span
                  aria-current={here ? "step" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                    here && "bg-primary text-primary-foreground",
                    done && "bg-secondary text-secondary-foreground",
                    !here && !done && "text-muted-foreground",
                  )}
                >
                  {done ? <CheckIcon className="size-3" aria-hidden /> : <span className="font-mono">{i + 1}</span>}
                  {CASE_STAGE_LABELS[s]}
                </span>
                {i < path.length - 1 ? <span className="h-px w-4 bg-border" aria-hidden /> : null}
              </li>
            );
          })}
          {declined || offPath ? (
            <li className="ml-3">
              <StageBadge stage={c.stage} />
              <span className="ml-2 text-xs text-muted-foreground">
                {declined ? "Declined" : "Off the usual path for this product"}
              </span>
            </li>
          ) : null}
        </ol>
      </div>
      <HelpButton topic="cases" section="advance-stage" label="Case stages" />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function ExtLink({ href }: { href: string | null }) {
  if (!href) return <span className="text-muted-foreground">Not set</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
      Open <ExternalLinkIcon className="size-3" />
    </a>
  );
}
