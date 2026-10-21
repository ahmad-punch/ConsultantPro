"use client";

import { useState } from "react";

import { createPaymentAction } from "@/lib/actions/payments";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from "@/lib/db/enums";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, toDateInput, type Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextField } from "../form-fields";

/**
 * Record a payment. With `caseId` it is fixed to that case (case detail page);
 * otherwise the user links it to a case or a retainer.
 */
export function PaymentForm({
  caseId,
  defaultAmount,
  cases = [],
  retainers = [],
}: {
  caseId?: string;
  defaultAmount?: number;
  cases?: Opt[];
  retainers?: Opt[];
}) {
  const [link, setLink] = useState<"case" | "retainer">("case");
  return (
    <ActionForm action={createPaymentAction} className="space-y-4">
      {caseId ? <input type="hidden" name="caseId" value={caseId} /> : null}
      {!caseId ? (
        <FormGrid>
          <SelectField
            name="_link"
            label="Payment for"
            options={[
              { value: "case", label: "A case" },
              { value: "retainer", label: "A retainer" },
            ]}
            value={link}
            onValueChange={(v) => setLink(v as "case" | "retainer")}
          />
          {link === "case" ? (
            <SelectField name="caseId" label="Case" required options={cases} />
          ) : (
            <SelectField name="retainerId" label="Retainer" required options={retainers} />
          )}
        </FormGrid>
      ) : null}
      <FormGrid>
        <TextField
          name="amountUsd"
          label="Amount (USD)"
          type="number"
          min={0}
          step={1}
          required
          defaultValue={defaultAmount ?? ""}
        />
        <SelectField
          name="method"
          label="Method"
          required
          options={enumOptions(PAYMENT_METHODS, PAYMENT_METHOD_LABELS)}
          defaultValue="stripe"
        />
        <SelectField
          name="status"
          label="Status"
          required
          options={enumOptions(PAYMENT_STATUSES, PAYMENT_STATUS_LABELS)}
          defaultValue="paid"
        />
        <TextField name="paidAt" label="Paid on" type="date" defaultValue={toDateInput(new Date())} />
        <TextField name="reference" label="Reference" placeholder="Stripe or Wise reference" className="@md:col-span-2" />
      </FormGrid>
      <FormActions>
        <SubmitButton>Record payment</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
