"use client";

import { useState } from "react";

import { saveBrandingAction } from "@/lib/actions/branding";
import type { BrandingData, DocModel } from "@/lib/pdf/model";

import { ActionForm, SubmitButton } from "../action-form";
import { CheckboxField, FormActions, FormGrid, TextareaField, TextField } from "../form-fields";
import { DocumentPreview } from "./document-preview";

type Live = Pick<BrandingData, "legalName" | "tradingName" | "primaryColor" | "accentColor" | "logoUrl" | "addressLines" | "email" | "phone" | "website">;

export function BrandingForm({ branding }: { branding: BrandingData }) {
  const [live, setLive] = useState<Live>(branding);
  const set = (k: keyof Live) => (e: { target: { value: string } }) => setLive((p) => ({ ...p, [k]: e.target.value }));
  const preview: DocModel = {
    type: "invoice",
    number: "INV-0000",
    issueDate: "2026-01-01T12:00:00Z",
    branding: { ...branding, ...live },
    template: { title: "Invoice", intro: "", terms: "", footer: branding.footerText, sections: [], options: { showTaxLine: true, showBankDetails: true } },
    billTo: { name: "Sample client", city: "Manchester", country: "UK" },
    items: [{ description: "Pathway Memo", quantity: 1, unitUsd: 100, amountUsd: 100 }],
    subtotalUsd: 100,
    taxUsd: 0,
    totalUsd: 100,
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ActionForm action={saveBrandingAction} className="space-y-4 rounded-xl border bg-card p-4">
        <FormGrid>
          <TextField name="legalName" label="Legal name" defaultValue={branding.legalName} onChange={set("legalName")} />
          <TextField name="tradingName" label="Trading name" defaultValue={branding.tradingName} onChange={set("tradingName")} />
          <TextareaField name="addressLines" label="Address" rows={3} defaultValue={branding.addressLines} onChange={set("addressLines")} className="@md:col-span-2" />
          <TextField name="email" label="Email" defaultValue={branding.email} onChange={set("email")} />
          <TextField name="phone" label="Phone" defaultValue={branding.phone} onChange={set("phone")} />
          <TextField name="website" label="Website" defaultValue={branding.website} onChange={set("website")} />
          <TextField name="logoUrl" label="Logo URL" placeholder="https://..." defaultValue={branding.logoUrl ?? ""} onChange={set("logoUrl")} description="PNG or JPG. SVG does not render in PDFs." />
          <TextField name="primaryColor" label="Primary colour" type="color" defaultValue={branding.primaryColor} onChange={set("primaryColor")} />
          <TextField name="accentColor" label="Accent colour" type="color" defaultValue={branding.accentColor} onChange={set("accentColor")} />
          <CheckboxField name="showLogo" label="Show logo on documents" defaultChecked={branding.showLogo} className="@md:col-span-2" />
          <TextField name="taxLabel" label="Tax label" placeholder="NTN" defaultValue={branding.taxLabel} />
          <TextField name="taxNumber" label="Tax number" defaultValue={branding.taxNumber} />
          <TextField name="currency" label="Currency" defaultValue={branding.currency} maxLength={3} description="Amounts are whole units. USD unless you have a reason." />
          <TextareaField name="bankDetails" label="Bank details" rows={4} defaultValue={branding.bankDetails} className="@md:col-span-2" />
          <TextareaField name="footerText" label="Footer text" rows={2} defaultValue={branding.footerText} className="@md:col-span-2" />
        </FormGrid>
        <FormActions>
          <SubmitButton>Save branding</SubmitButton>
        </FormActions>
      </ActionForm>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Live preview (sample data)</p>
        <div className="origin-top-left overflow-hidden">
          <DocumentPreview model={preview} />
        </div>
      </div>
    </div>
  );
}
