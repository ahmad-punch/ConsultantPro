import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { formatDate, formatDateTime } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { FormActions, TextareaField } from "@/components/admin/form-fields";
import { ApplicationStatusBadge } from "@/components/admin/network/network-badges";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  approveApplicationAction,
  rejectApplicationAction,
  saveApplicationNotesAction,
  setApplicationStatusAction,
} from "@/lib/actions/applications";
import { requireAdmin } from "@/lib/auth";
import { APPLICATION_TYPE_LABELS } from "@/lib/db/enums";
import { getApplication } from "@/lib/queries/applications";
import { isUuid } from "@/lib/queries/params";

export const metadata = { title: "Application" };

export default function ApplicationPage({ params }: PageProps<"/admin/network/applications/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ApplicationView params={params} />
    </Suspense>
  );
}

async function ApplicationView({ params }: { params: PageProps<"/admin/network/applications/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const a = await getApplication(id);
  if (!a) notFound();
  const open = a.status !== "approved" && a.status !== "rejected";
  const rows: [string, React.ReactNode][] = [
    ["Type", APPLICATION_TYPE_LABELS[a.type]],
    ["WhatsApp", a.whatsapp],
    ["Email", a.email ?? "-"],
    ["Location", `${a.city ?? "-"}, ${a.country}`],
    ["Bar Council no.", a.barCouncilNumber ?? "-"],
    ["Experience", a.yearsExperience != null ? `${a.yearsExperience} years` : "-"],
    ["Specialties", a.specialties ?? "-"],
    ["Languages", a.languages ?? "-"],
    ["Community", a.channelOrNetwork ?? "-"],
    ["Terms accepted", formatDateTime(a.acceptedTermsAt)],
    ["Source", a.source],
  ];

  return (
    <>
      <PageHeader
        helpTopic="network"
        eyebrow={
          <Link href="/admin/network" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeftIcon className="size-3" /> Applications
          </Link>
        }
        title={a.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <ApplicationStatusBadge status={a.status} /> received {formatDate(a.createdAt)}
          </span>
        }
        actions={
          open ? (
            <>
              {a.status === "new" ? (
                <ActionButton action={setApplicationStatusAction} fields={{ id: a.id, status: "reviewing" }}>
                  Start review
                </ActionButton>
              ) : null}
              {a.status !== "interview" ? (
                <ActionButton action={setApplicationStatusAction} fields={{ id: a.id, status: "interview" }}>
                  Move to interview
                </ActionButton>
              ) : null}
              <ActionButton action={approveApplicationAction} fields={{ id: a.id }} variant="default" icon={<CheckIcon />} confirm="Approve and create the record?">
                {a.type === "ambassador" ? "Approve and create ambassador" : "Approve and create provider"}
              </ActionButton>
              <FormDialog triggerLabel="Reject" triggerVariant="ghost" triggerSize="sm" title={`Reject ${a.name}`}>
                <ActionForm action={rejectApplicationAction} className="grid gap-4">
                  <input type="hidden" name="id" value={a.id} />
                  <TextareaField name="reason" label="Reason (kept in notes)" required rows={3} />
                  <FormActions>
                    <SubmitButton variant="destructive">Reject application</SubmitButton>
                  </FormActions>
                </ActionForm>
              </FormDialog>
            </>
          ) : a.convertedPartnerId ? (
            <Link href={`/admin/partners/${a.convertedPartnerId}`} className="text-sm text-primary underline">
              Open provider
            </Link>
          ) : a.convertedAmbassadorId ? (
            <Link href="/admin/ambassadors" className="text-sm text-primary underline">
              Open ambassadors
            </Link>
          ) : null
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <dl className="grid gap-2 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 break-words">{v}</dd>
                </div>
              ))}
            </dl>
            {a.bio ? <p className="text-sm whitespace-pre-line">{a.bio}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={saveApplicationNotesAction} className="grid gap-3">
              <input type="hidden" name="id" value={a.id} />
              <TextareaField
                name="notes"
                label="Screening and interview notes"
                defaultValue={a.notes ?? ""}
                rows={8}
                description='Keep the "Departments:" and "Service areas:" lines; approval copies them to the provider.'
              />
              <FormActions>
                <SubmitButton size="sm">Save notes</SubmitButton>
              </FormActions>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
