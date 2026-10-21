"use client";

import { updateCaseAction } from "@/lib/actions/cases";
import { CASE_CATEGORIES, CASE_CATEGORY_LABELS } from "@/lib/db/enums";
import type { Case } from "@/lib/db/schema";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, toDateInput, type Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";
import { ProductPriceFields } from "./product-price-fields";

export function CaseEditForm({
  c,
  team,
  partners,
  ambassadors,
  cases,
}: {
  c: Case;
  team: Opt[];
  partners: Opt[];
  ambassadors: Opt[];
  cases: Opt[];
}) {
  return (
    <ActionForm action={updateCaseAction} className="space-y-4">
      <input type="hidden" name="id" value={c.id} />
      <TextareaField name="summary" label="Summary" required rows={3} defaultValue={c.summary} />
      <FormGrid>
        <TextField name="nextAction" label="Next action" defaultValue={c.nextAction ?? ""} />
        <TextField name="nextActionDue" label="Next action due" type="date" defaultValue={toDateInput(c.nextActionDue)} />
        <SelectField name="caseManagerId" label="Case manager" options={team} noneLabel="Unassigned" defaultValue={c.caseManagerId} />
        <SelectField name="partnerId" label="Partner" options={partners} noneLabel="None" defaultValue={c.partnerId} />
        <TextField name="driveFolderUrl" label="Drive folder" type="url" placeholder="https://" defaultValue={c.driveFolderUrl ?? ""} />
        <TextField name="memoDocUrl" label="Memo document" type="url" placeholder="https://" defaultValue={c.memoDocUrl ?? ""} />
        <TextField name="paymentLink" label="Payment link" type="url" placeholder="https://" defaultValue={c.paymentLink ?? ""} />
        <SelectField
          name="category"
          label="Category"
          required
          options={enumOptions(CASE_CATEGORIES, CASE_CATEGORY_LABELS)}
          defaultValue={c.category}
        />
        <ProductPriceFields defaultProduct={c.product} defaultPrice={c.priceUsd} />
        <SelectField name="ambassadorId" label="Referred by ambassador" options={ambassadors} noneLabel="None" defaultValue={c.ambassadorId} />
        <SelectField
          name="referredByCaseId"
          label="Referred by earlier case"
          options={cases.filter((o) => o.value !== c.id)}
          noneLabel="None"
          defaultValue={c.referredByCaseId}
        />
      </FormGrid>
      <FormActions>
        <SubmitButton>Save changes</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
