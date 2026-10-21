"use client";

import { createPartnerAction, updatePartnerAction } from "@/lib/actions/partners";
import { PARTNER_TYPES, PARTNER_TYPE_LABELS } from "@/lib/db/enums";
import type { Partner } from "@/lib/db/schema";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions } from "../format";
import { CheckboxField, FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";

export function PartnerForm({ partner }: { partner?: Partner }) {
  return (
    <ActionForm action={partner ? updatePartnerAction : createPartnerAction} className="space-y-4">
      {partner ? <input type="hidden" name="id" value={partner.id} /> : null}
      <FormGrid>
        <TextField name="name" label="Name" required defaultValue={partner?.name} autoComplete="off" />
        <SelectField
          name="type"
          label="Type"
          required
          options={enumOptions(PARTNER_TYPES, PARTNER_TYPE_LABELS)}
          defaultValue={partner?.type ?? "advocate"}
        />
        <TextField name="city" label="City" defaultValue={partner?.city ?? ""} />
        <TextField name="whatsapp" label="WhatsApp" defaultValue={partner?.whatsapp ?? ""} inputMode="tel" />
        <TextField name="email" label="Email" type="email" defaultValue={partner?.email ?? ""} />
        <TextField
          name="slaDays"
          label="SLA (days)"
          type="number"
          min={0}
          max={365}
          defaultValue={partner?.slaDays ?? ""}
          description="Agreed turnaround."
        />
        <SelectField
          name="rating"
          label="Rating"
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} / 5` }))}
          noneLabel="Not rated"
          defaultValue={partner?.rating ? String(partner.rating) : null}
        />
      </FormGrid>
      <TextareaField
        name="feeTerms"
        label="Fee terms"
        rows={3}
        defaultValue={partner?.feeTerms ?? ""}
        description="Advocates bill clients directly. Record the fixed fees agreed."
      />
      <div className="flex flex-wrap gap-6">
        <CheckboxField name="ownLetterhead" label="Works on own letterhead" defaultChecked={partner?.ownLetterhead ?? false} />
        <CheckboxField name="active" label="Active" defaultChecked={partner?.active ?? true} />
      </div>
      <FormActions>
        <SubmitButton>{partner ? "Save partner" : "Add partner"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
