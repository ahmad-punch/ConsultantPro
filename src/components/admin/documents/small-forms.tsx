"use client";

import { generateDocumentAction } from "@/lib/actions/documents";
import { markInvoicePaidAction } from "@/lib/actions/invoices";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/db/enums";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, toDateInput, type Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";

export function MarkPaidForm({ id, invoiceNumber }: { id: string; invoiceNumber: string }) {
  return (
    <ActionForm action={markInvoicePaidAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <FormGrid>
        <SelectField name="method" label="Method" required options={enumOptions(PAYMENT_METHODS, PAYMENT_METHOD_LABELS)} defaultValue="bank" />
        <TextField name="paidAt" label="Paid on" type="date" defaultValue={toDateInput(new Date())} />
        <TextField name="reference" label="Reference" placeholder={invoiceNumber} className="@md:col-span-2" />
      </FormGrid>
      <FormActions>
        <SubmitButton>Mark paid</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}

export function GenerateDocumentForm({ cases, templates }: { cases: Opt[]; templates: Opt[] }) {
  return (
    <ActionForm action={generateDocumentAction} className="space-y-4">
      <FormGrid>
        <SelectField name="caseId" label="Case" required options={cases} />
        <SelectField name="templateId" label="Template" required options={templates} />
        <TextareaField name="note" label="Note (optional)" rows={2} className="@md:col-span-2" />
      </FormGrid>
      <FormActions>
        <SubmitButton>Generate document</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
