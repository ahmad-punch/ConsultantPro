import { StarIcon } from "lucide-react";

import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { CopyButton } from "@/components/admin/copy-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { FormActions, TextField, TextareaField } from "@/components/admin/form-fields";
import { rateEngagementAction, setEngagementStatusAction } from "@/lib/actions/engagements";
import { ENGAGEMENT_STATUS_LABELS, type EngagementStatus } from "@/lib/db/enums";
import type { PartnerEngagement } from "@/lib/db/schema";
import { CONTACT_VISIBLE, ENGAGEMENT_NEXT, NO_POACHING_POLICY } from "@/lib/validation/engagements";

const VERB: Partial<Record<EngagementStatus, string>> = {
  accepted: "Accept",
  in_progress: "Start",
  delivered: "Deliver",
  completed: "Complete",
  cancelled: "Cancel",
  disputed: "Dispute",
};

/** Status buttons for one engagement, the provider brief, and the rating dialog. */
export function EngagementActions({
  e,
  caseNumber,
  caseSummary,
  client,
}: {
  e: PartnerEngagement;
  caseNumber: string;
  caseSummary: string;
  client: { name: string; whatsapp: string | null; email: string | null };
}) {
  const contactVisible = (CONTACT_VISIBLE as readonly string[]).includes(e.status);
  const brief = [
    `Rasta engagement ${caseNumber}`,
    `Office: ${e.department ?? "-"}, ${e.locationCity ?? "-"}`,
    `Work: ${caseSummary}`,
    `Fee: $${e.agreedFeeUsd} (${e.feeBilledBy === "partner" ? "you bill the client on your own letterhead" : "paid by Rasta"})`,
    e.dueAt ? `Due: ${e.dueAt.toISOString().slice(0, 10)}` : null,
    contactVisible
      ? `Client: ${client.name}${client.whatsapp ? `, WhatsApp ${client.whatsapp}` : ""}${client.email ? `, ${client.email}` : ""}`
      : "Client contact: shared after you accept.",
    "",
    NO_POACHING_POLICY,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ENGAGEMENT_NEXT[e.status].map((s) => (
        <ActionButton
          key={s}
          action={setEngagementStatusAction}
          fields={{ id: e.id, status: s }}
          size="xs"
          variant={s === "cancelled" || s === "disputed" ? "ghost" : "outline"}
          confirm={s === "accepted" ? "Confirm the provider accepted in writing and acknowledged the no-poaching policy." : s === "cancelled" ? "Cancel this engagement?" : undefined}
        >
          {VERB[s] ?? ENGAGEMENT_STATUS_LABELS[s]}
        </ActionButton>
      ))}
      <CopyButton value={brief} label="Copy brief" />
      {e.status === "completed" ? (
        <FormDialog
          triggerLabel={e.rating ? `${e.rating}/5` : "Rate"}
          triggerIcon={<StarIcon />}
          triggerVariant="outline"
          triggerSize="sm"
          title={`Rate engagement on ${caseNumber}`}
        >
          <ActionForm action={rateEngagementAction} className="grid gap-4">
            <input type="hidden" name="id" value={e.id} />
            <TextField name="rating" label="Rating (1 to 5)" type="number" min={1} max={5} defaultValue={e.rating ?? 5} required />
            <TextareaField name="ratingNote" label="Note" defaultValue={e.ratingNote ?? ""} rows={3} />
            <FormActions>
              <SubmitButton>Save rating</SubmitButton>
            </FormActions>
          </ActionForm>
        </FormDialog>
      ) : null}
    </div>
  );
}
