"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveTemplateAction } from "@/lib/actions/documents";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, type DocumentType } from "@/lib/db/enums";
import { TEMPLATE_OPTIONS, TEMPLATE_OPTION_LABELS } from "@/lib/validation/documents";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions } from "../format";
import { CheckboxField, FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";

export type TemplateFormValue = {
  id?: string;
  type: DocumentType;
  name: string;
  isDefault: boolean;
  title: string;
  intro: string;
  terms: string;
  footer: string;
  sections: Array<{ heading: string; body: string }>;
  options: Record<string, boolean | string>;
};

export function TemplateForm({ template }: { template?: TemplateFormValue }) {
  const [sections, setSections] = useState(template?.sections ?? []);
  const update = (n: number, key: "heading" | "body", value: string) =>
    setSections((rows) => rows.map((r, i) => (i === n ? { ...r, [key]: value } : r)));
  return (
    <ActionForm action={saveTemplateAction} className="space-y-4" resetOnSuccess={!template}>
      {template?.id ? <input type="hidden" name="id" value={template.id} /> : null}
      <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      <FormGrid>
        <TextField name="name" label="Template name" required defaultValue={template?.name} />
        <SelectField
          name="type"
          label="Document type"
          required
          options={enumOptions(DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS)}
          defaultValue={template?.type ?? "invoice"}
        />
        <TextField name="title" label="Title on the document" defaultValue={template?.title} className="@md:col-span-2" />
        <TextareaField
          name="intro"
          label="Intro"
          rows={3}
          defaultValue={template?.intro}
          description="Placeholders: {client}, {case}, {number}."
          className="@md:col-span-2"
        />
        <TextareaField name="terms" label="Terms" rows={3} defaultValue={template?.terms} className="@md:col-span-2" />
        <TextareaField name="footer" label="Footer" rows={2} defaultValue={template?.footer} className="@md:col-span-2" />
      </FormGrid>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sections</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setSections((r) => [...r, { heading: "", body: "" }])}>
            <PlusIcon /> Add section
          </Button>
        </div>
        {sections.length === 0 ? <p className="text-sm text-muted-foreground">No extra sections.</p> : null}
        {sections.map((sec, n) => (
          <div key={n} className="space-y-2 rounded-lg border p-3">
            <div className="flex gap-2">
              <Input aria-label={`Section ${n + 1} heading`} placeholder="Heading" value={sec.heading} onChange={(e) => update(n, "heading", e.target.value)} />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove section" onClick={() => setSections((r) => r.filter((_, i) => i !== n))}>
                <Trash2Icon />
              </Button>
            </div>
            <Textarea aria-label={`Section ${n + 1} body`} rows={3} placeholder="Body" value={sec.body} onChange={(e) => update(n, "body", e.target.value)} />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TEMPLATE_OPTIONS.map((o) => (
          <CheckboxField key={o} name={o} label={TEMPLATE_OPTION_LABELS[o]} defaultChecked={template?.options[o] === true} />
        ))}
        <CheckboxField name="isDefault" label="Default for this type" defaultChecked={template?.isDefault} />
      </div>
      <FormActions>
        <SubmitButton>{template?.id ? "Save template" : "Create template"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
