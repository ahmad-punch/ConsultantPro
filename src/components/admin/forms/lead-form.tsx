"use client";

import { createLeadAction, updateLeadAction } from "@/lib/actions/leads";
import {
  CASE_CATEGORIES,
  CASE_CATEGORY_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_URGENCIES,
  LEAD_URGENCY_LABELS,
} from "@/lib/db/enums";
import type { Lead } from "@/lib/db/schema";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";

const SOURCES = ["whatsapp", "website", "referral", "ambassador", "facebook", "linkedin", "event", "other"];

export function LeadForm({ lead }: { lead?: Lead }) {
  const editing = !!lead;
  const sources = lead && !SOURCES.includes(lead.source) ? [lead.source, ...SOURCES] : SOURCES;
  return (
    <ActionForm
      action={editing ? updateLeadAction : createLeadAction}
      redirectTo={editing ? undefined : "/admin/leads/{id}"}
      className="space-y-4"
    >
      {lead ? <input type="hidden" name="id" value={lead.id} /> : null}
      <FormGrid>
        <TextField name="name" label="Name" required defaultValue={lead?.name} autoComplete="off" />
        <TextField
          name="whatsapp"
          label="WhatsApp"
          required
          defaultValue={lead?.whatsapp}
          placeholder="+44 7700 900000"
          inputMode="tel"
        />
        <TextField name="email" label="Email" type="email" defaultValue={lead?.email ?? ""} />
        <TextField name="country" label="Country they live in" required defaultValue={lead?.country} />
        <SelectField
          name="category"
          label="Category"
          required
          options={enumOptions(CASE_CATEGORIES, CASE_CATEGORY_LABELS)}
          defaultValue={lead?.category ?? "property"}
        />
        <SelectField
          name="urgency"
          label="Urgency"
          required
          options={enumOptions(LEAD_URGENCIES, LEAD_URGENCY_LABELS)}
          defaultValue={lead?.urgency ?? "normal"}
        />
        <SelectField
          name="source"
          label="Source"
          required
          options={sources.map((s) => ({ value: s, label: s }))}
          defaultValue={lead?.source ?? "whatsapp"}
        />
        <TextField
          name="referralCode"
          label="Referral code"
          defaultValue={lead?.referralCode ?? ""}
          description="Ambassador code, if they gave one."
        />
        {lead ? (
          <SelectField
            name="status"
            label="Status"
            required
            options={enumOptions(LEAD_STATUSES, LEAD_STATUS_LABELS)}
            defaultValue={lead.status}
          />
        ) : null}
      </FormGrid>
      <TextareaField
        name="description"
        label="What is the problem?"
        required
        rows={5}
        defaultValue={lead?.description}
      />
      <FormActions>
        <SubmitButton>{editing ? "Save lead" : "Add lead"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
