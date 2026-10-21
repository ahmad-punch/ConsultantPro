"use client";

import { convertLeadAction } from "@/lib/actions/leads";
import type { CaseCategory } from "@/lib/db/enums";

import { ActionForm, SubmitButton } from "../action-form";
import type { Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField } from "../form-fields";
import { ProductPriceFields } from "./product-price-fields";

export function ConvertLeadForm({
  leadId,
  description,
  category,
  team,
}: {
  leadId: string;
  description: string;
  category: CaseCategory;
  team: Opt[];
}) {
  return (
    <ActionForm action={convertLeadAction} redirectTo="/admin/cases/{id}" className="space-y-4">
      <input type="hidden" name="id" value={leadId} />
      <FormGrid>
        <ProductPriceFields defaultProduct={category === "errand" || category === "nadra" || category === "attestation" ? "errand" : "assessment"} />
        <SelectField name="caseManagerId" label="Case manager" options={team} noneLabel="Unassigned" />
      </FormGrid>
      <TextareaField
        name="summary"
        label="Case summary"
        rows={4}
        defaultValue={description}
        description="Starts as the lead's description. Edit it into a one-paragraph case summary."
      />
      <FormActions>
        <SubmitButton>Convert to case</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
