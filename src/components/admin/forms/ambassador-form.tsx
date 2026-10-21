"use client";

import { createAmbassadorAction, recordPayoutAction, updateAmbassadorAction } from "@/lib/actions/ambassadors";
import type { Ambassador } from "@/lib/db/schema";

import { ActionForm, SubmitButton } from "../action-form";
import { CheckboxField, FormActions, FormGrid, TextareaField, TextField } from "../form-fields";

export function AmbassadorForm({ ambassador }: { ambassador?: Ambassador }) {
  return (
    <ActionForm
      action={ambassador ? updateAmbassadorAction : createAmbassadorAction}
      redirectTo={ambassador ? undefined : "/admin/ambassadors/{id}"}
      className="space-y-4"
    >
      {ambassador ? <input type="hidden" name="id" value={ambassador.id} /> : null}
      <FormGrid>
        <TextField name="name" label="Name" required defaultValue={ambassador?.name} autoComplete="off" />
        <TextField
          name="referralCode"
          label="Referral code"
          required
          defaultValue={ambassador?.referralCode}
          className="[&_input]:font-mono [&_input]:uppercase"
          description="Used in their link: /start?ref=CODE"
        />
        <TextField name="country" label="Country" required defaultValue={ambassador?.country} />
        <TextField name="city" label="City" defaultValue={ambassador?.city ?? ""} />
        <TextField name="whatsapp" label="WhatsApp" defaultValue={ambassador?.whatsapp ?? ""} inputMode="tel" />
        <TextField
          name="commissionPct"
          label="Commission (%)"
          type="number"
          min={0}
          max={100}
          required
          defaultValue={ambassador?.commissionPct ?? 10}
          description="Share of paid case revenue they referred."
        />
      </FormGrid>
      <TextareaField name="notes" label="Notes" rows={3} defaultValue={ambassador?.notes ?? ""} />
      <CheckboxField name="active" label="Active" defaultChecked={ambassador?.active ?? true} />
      <FormActions>
        <SubmitButton>{ambassador ? "Save ambassador" : "Add ambassador"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}

export function PayoutForm({ id, due }: { id: string; due: number }) {
  return (
    <ActionForm action={recordPayoutAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <TextField
        name="amountUsd"
        label="Amount paid (USD)"
        type="number"
        min={1}
        required
        defaultValue={due > 0 ? due : ""}
        description="Adds to the total paid. Send the money by Wise or bank first."
      />
      <FormActions>
        <SubmitButton>Record payout</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
