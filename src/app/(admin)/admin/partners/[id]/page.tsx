import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDate, toDateInput } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { CheckboxField, FormActions, TextField, TextareaField } from "@/components/admin/form-fields";
import { EngagementStatusBadge, OnboardingBadge, TierBadge } from "@/components/admin/network/network-badges";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  activateProviderAction,
  applyTierAction,
  markAgreementSentAction,
  recordAgreementSignedAction,
  startTrialAction,
  suspendProviderAction,
} from "@/lib/actions/network";
import { requirePermission } from "@/lib/rbac";
import { ONBOARDING_STAGES, ONBOARDING_STAGE_LABELS, PARTNER_TIER_LABELS, PARTNER_TYPE_LABELS } from "@/lib/db/enums";
import { getProvider } from "@/lib/queries/network";
import { isUuid } from "@/lib/queries/params";
import { cn } from "@/lib/utils";
import { splitList } from "@/lib/validation/applications";

export const metadata = { title: "Provider" };

const STEPS = ONBOARDING_STAGES.filter((s) => s !== "suspended");

export default function ProviderPage({ params }: PageProps<"/admin/partners/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ProviderView params={params} />
    </Suspense>
  );
}

async function ProviderView({ params }: { params: PageProps<"/admin/partners/[id]">["params"] }) {
  await requirePermission("partners.view");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const data = await getProvider(id);
  if (!data) notFound();
  const { partner: p, stats, suggestedTier, engagements, watch } = data;
  const stageIndex = STEPS.indexOf(p.onboardingStage as (typeof STEPS)[number]);
  const onTimePct = stats.completed ? Math.round((stats.onTime / stats.completed) * 100) : null;
  const signed = !!p.agreementSignedAt && !!p.noPoachingAcceptedAt;

  return (
    <>
      <PageHeader
        helpTopic="partners"
        eyebrow={
          <Link href="/admin/network/providers" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeftIcon className="size-3" /> Providers
          </Link>
        }
        title={p.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <TierBadge tier={p.tier} />
            <OnboardingBadge stage={p.onboardingStage} />
            <span>
              {PARTNER_TYPE_LABELS[p.type]} · {p.city ?? "-"}
              {p.barCouncilNumber ? ` · Bar Council ${p.barCouncilNumber}` : ""}
            </span>
          </span>
        }
        actions={
          <>
            {p.onboardingStage === "applied" ? (
              <ActionButton action={markAgreementSentAction} fields={{ id: p.id }} variant="default">
                Mark agreement sent
              </ActionButton>
            ) : null}
            {p.onboardingStage === "applied" || p.onboardingStage === "agreement_sent" ? (
              <FormDialog triggerLabel="Record agreement signed" triggerVariant="outline" triggerSize="sm" title="Record signed agreement">
                <ActionForm action={recordAgreementSignedAction} className="grid gap-4">
                  <input type="hidden" name="id" value={p.id} />
                  <TextField name="agreementVersion" label="Agreement version" defaultValue={p.agreementVersion ?? "v0.1-draft"} required />
                  <TextField name="signedOn" label="Signed on" type="date" defaultValue={toDateInput(new Date())} required />
                  <CheckboxField name="noPoaching" label="Provider accepted the no-poaching clause (12 months after the last engagement)" />
                  <FormActions>
                    <SubmitButton>Save</SubmitButton>
                  </FormActions>
                </ActionForm>
              </FormDialog>
            ) : null}
            {p.onboardingStage === "agreement_signed" ? (
              <ActionButton action={startTrialAction} fields={{ id: p.id }} variant="default">
                Start trial
              </ActionButton>
            ) : null}
            {(p.onboardingStage === "trial_case" || p.onboardingStage === "suspended") && signed ? (
              <ActionButton action={activateProviderAction} fields={{ id: p.id }} variant="default" confirm={p.onboardingStage === "suspended" ? "Lift the suspension and activate?" : undefined}>
                Activate
              </ActionButton>
            ) : null}
            {p.onboardingStage !== "suspended" ? (
              <FormDialog triggerLabel="Suspend" triggerVariant="ghost" triggerSize="sm" title={`Suspend ${p.name}`} description="For breaches: poaching, side fees, document misuse, conduct. Suspended providers are hidden from dispatch.">
                <ActionForm action={suspendProviderAction} className="grid gap-4">
                  <input type="hidden" name="id" value={p.id} />
                  <TextareaField name="reason" label="Reason" required rows={3} />
                  <FormActions>
                    <SubmitButton variant="destructive">Suspend provider</SubmitButton>
                  </FormActions>
                </ActionForm>
              </FormDialog>
            ) : null}
          </>
        }
      />

      <ol className="mb-6 grid gap-2 sm:grid-cols-5" aria-label="Onboarding">
        {STEPS.map((s, i) => {
          const doneStep = stageIndex >= i;
          return (
            <li key={s} className={cn("rounded-lg border p-2 text-xs", doneStep ? "border-primary/30 bg-secondary" : "text-muted-foreground", p.onboardingStage === s && "ring-2 ring-primary/30")}>
              <span className="font-mono">{i + 1}.</span> {ONBOARDING_STAGE_LABELS[s]}
              {s === "agreement_signed" && p.agreementSignedAt ? <span className="block">{formatDate(p.agreementSignedAt)} · {p.agreementVersion}</span> : null}
            </li>
          );
        })}
      </ol>
      {p.onboardingStage === "suspended" ? (
        <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{p.availabilityNote ?? "Suspended."}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tier</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <dl className="grid grid-cols-[8rem_1fr] gap-2">
              <dt className="text-muted-foreground">Completed</dt>
              <dd className="font-mono">{stats.completed}</dd>
              <dt className="text-muted-foreground">On time</dt>
              <dd className="font-mono">{onTimePct == null ? "-" : `${onTimePct}%`}</dd>
              <dt className="text-muted-foreground">Avg rating</dt>
              <dd className="font-mono">{stats.avgRating ?? "-"}</dd>
              <dt className="text-muted-foreground">Disputes</dt>
              <dd className="font-mono">{stats.disputed}</dd>
              <dt className="text-muted-foreground">Suggested tier</dt>
              <dd>
                <TierBadge tier={suggestedTier} />
              </dd>
            </dl>
            {suggestedTier !== p.tier ? (
              <ActionButton action={applyTierAction} fields={{ id: p.id, tier: suggestedTier }} icon={<CheckIcon />}>
                Apply {PARTNER_TIER_LABELS[suggestedTier]}
              </ActionButton>
            ) : (
              <p className="text-xs text-muted-foreground">Current tier matches the record.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coverage</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">Offices: </span>
              {splitList(p.departments).join(", ") || "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Service areas: </span>
              {splitList(p.serviceAreas).join(", ") || "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Languages: </span>
              {p.languages ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Specialties: </span>
              {p.specialties ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Contact: </span>
              {p.whatsapp ?? "-"} {p.email ? `· ${p.email}` : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Non-solicitation watch</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {watch.length === 0 ? (
              <p className="text-muted-foreground">No clients introduced yet.</p>
            ) : (
              watch.map((w) => (
                <p key={w.clientId}>
                  <Link href={`/admin/clients/${w.clientId}`} className="hover:underline">
                    {w.clientName}
                  </Link>{" "}
                  <span className="text-xs text-muted-foreground">
                    · {w.engagements} engagement{w.engagements === 1 ? "" : "s"} · protected until {formatDate(w.until)}
                    {w.repeat ? " · repeat client" : ""}
                  </span>
                </p>
              ))
            )}
            <p className="text-xs text-muted-foreground">If one of these clients returns to this provider directly, note it on the client and consider Suspend. Reported, not enforced.</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold">Engagement history</h2>
      {engagements.length === 0 ? (
        <EmptyState title="No engagements yet" description="Engage this provider from a case page." />
      ) : (
        <ul className="grid gap-2">
          {engagements.map(({ e, caseNumber }) => (
            <li key={e.id} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 text-sm">
              <Link href={`/admin/cases/${e.caseId}`} className="font-mono text-xs hover:underline">
                {caseNumber}
              </Link>
              <EngagementStatusBadge status={e.status} />
              <span className="text-muted-foreground">
                {e.department ?? "-"} / {e.locationCity ?? "-"} · ${e.agreedFeeUsd} · due {formatDate(e.dueAt)}
                {e.rating ? ` · rated ${e.rating}/5` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
