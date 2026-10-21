"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInvoiceAction } from "@/lib/actions/invoices";
import { DOCUMENT_TYPE_LABELS } from "@/lib/db/enums";
import { formatUsd } from "@/lib/pricing";
import { NONE } from "@/lib/validation/fields";
import { INVOICE_DOC_TYPES, computeTotals, type LineItemInput } from "@/lib/validation/invoices";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, toDateInput, type Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";

export type CaseOpt = Opt & { clientId: string; description: string; priceUsd: number };
export type TemplateOpt = Opt & { type: string; isDefault: boolean };

const blank = (): LineItemInput => ({ description: "", quantity: 1, unitUsd: 0 });

export function InvoiceForm({
  clients,
  cases,
  templates,
  initialCaseId,
}: {
  clients: Opt[];
  cases: CaseOpt[];
  templates: TemplateOpt[];
  initialCaseId?: string;
}) {
  const initialCase = cases.find((c) => c.value === initialCaseId);
  const [type, setType] = useState<(typeof INVOICE_DOC_TYPES)[number]>("invoice");
  const [caseId, setCaseId] = useState(initialCase?.value ?? NONE);
  const [clientId, setClientId] = useState(initialCase?.clientId ?? "");
  const [items, setItems] = useState<LineItemInput[]>(
    initialCase ? [{ description: initialCase.description, quantity: 1, unitUsd: initialCase.priceUsd }] : [blank()],
  );
  const [tax, setTax] = useState(0);
  const [dates] = useState(() => {
    const now = new Date();
    return { issue: toDateInput(now), due: toDateInput(new Date(now.getTime() + 7 * 864e5)) };
  });
  const typeTemplates = templates.filter((t) => t.type === type);
  const [templateId, setTemplateId] = useState(typeTemplates.find((t) => t.isDefault)?.value ?? typeTemplates[0]?.value ?? NONE);
  const totals = computeTotals(items, tax);

  function pickCase(id: string) {
    setCaseId(id);
    const c = cases.find((x) => x.value === id);
    if (!c) return;
    setClientId(c.clientId);
    setItems((rows) => {
      const line = { description: c.description, quantity: 1, unitUsd: c.priceUsd };
      const empty = rows.length === 1 && !rows[0].description;
      return empty ? [line] : [line, ...rows];
    });
  }
  function pickType(t: string) {
    const next = t as (typeof INVOICE_DOC_TYPES)[number];
    setType(next);
    const list = templates.filter((x) => x.type === next);
    setTemplateId(list.find((x) => x.isDefault)?.value ?? list[0]?.value ?? NONE);
  }
  const setItem = (n: number, patch: Partial<LineItemInput>) =>
    setItems((rows) => rows.map((r, i) => (i === n ? { ...r, ...patch } : r)));

  return (
    <ActionForm action={createInvoiceAction} className="space-y-5" redirectTo="/admin/invoices/{id}">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <FormGrid>
        <SelectField
          name="type"
          label="Document"
          required
          options={enumOptions(INVOICE_DOC_TYPES, DOCUMENT_TYPE_LABELS)}
          value={type}
          onValueChange={pickType}
        />
        <SelectField name="caseId" label="Case (optional)" options={cases} noneLabel="No case" value={caseId} onValueChange={pickCase} />
        <SelectField name="clientId" label="Client" required options={clients} value={clientId} onValueChange={setClientId} />
        <SelectField
          name="templateId"
          label="Template"
          options={typeTemplates}
          noneLabel="Default"
          value={templateId}
          onValueChange={setTemplateId}
        />
        <TextField name="issueDate" label="Issue date" type="date" required defaultValue={dates.issue} />
        <TextField name="dueDate" label="Due date" type="date" defaultValue={dates.due} />
      </FormGrid>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Line items</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setItems((r) => [...r, blank()])}>
            <PlusIcon /> Add line
          </Button>
        </div>
        <div className="grid grid-cols-[1fr_4.5rem_6.5rem_5.5rem_2.25rem] gap-2 text-xs text-muted-foreground">
          <span>Description</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Unit (USD)</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
        {items.map((it, n) => (
          <div key={n} className="grid grid-cols-[1fr_4.5rem_6.5rem_5.5rem_2.25rem] items-center gap-2">
            <Input aria-label={`Line ${n + 1} description`} value={it.description} onChange={(e) => setItem(n, { description: e.target.value })} required />
            <Input aria-label={`Line ${n + 1} quantity`} type="number" min={1} step={1} className="text-right" value={it.quantity} onChange={(e) => setItem(n, { quantity: Math.max(1, Math.trunc(Number(e.target.value) || 1)) })} />
            <Input aria-label={`Line ${n + 1} unit price`} type="number" min={0} step={1} className="text-right" value={it.unitUsd} onChange={(e) => setItem(n, { unitUsd: Math.max(0, Math.trunc(Number(e.target.value) || 0)) })} />
            <span className="text-right font-mono text-sm tabular-nums">{formatUsd(it.quantity * it.unitUsd)}</span>
            <Button type="button" variant="ghost" size="icon" aria-label="Remove line" disabled={items.length === 1} onClick={() => setItems((r) => r.filter((_, i) => i !== n))}>
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>

      <FormGrid>
        <TextField name="taxUsd" label="Tax (USD)" type="number" min={0} step={1} value={tax} onChange={(e) => setTax(Math.max(0, Math.trunc(Number(e.target.value) || 0)))} />
        <div className="self-end text-right text-sm">
          <div className="text-muted-foreground">Subtotal {formatUsd(totals.subtotalUsd)}</div>
          <div className="text-lg font-semibold">Total {formatUsd(totals.totalUsd)}</div>
        </div>
        <TextareaField name="notes" label="Notes" rows={2} className="@md:col-span-2" />
      </FormGrid>
      <FormActions>
        <SubmitButton>Create {DOCUMENT_TYPE_LABELS[type].toLowerCase()}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
