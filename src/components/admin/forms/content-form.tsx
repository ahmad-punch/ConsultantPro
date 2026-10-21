"use client";

import { createContentAction, markContentPostedAction, updateContentAction } from "@/lib/actions/content";
import {
  CONTENT_FORMATS,
  CONTENT_FORMAT_LABELS,
  CONTENT_LANGUAGES,
  CONTENT_LANGUAGE_LABELS,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
} from "@/lib/db/enums";
import type { ContentItem } from "@/lib/db/schema";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, toDateInput } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";

export function ContentForm({ item }: { item?: ContentItem }) {
  return (
    <ActionForm action={item ? updateContentAction : createContentAction} className="space-y-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <TextField name="title" label="Title" required defaultValue={item?.title} autoComplete="off" />
      <FormGrid>
        <SelectField name="format" label="Format" required options={enumOptions(CONTENT_FORMATS, CONTENT_FORMAT_LABELS)} defaultValue={item?.format ?? "post"} />
        <SelectField name="language" label="Language" required options={enumOptions(CONTENT_LANGUAGES, CONTENT_LANGUAGE_LABELS)} defaultValue={item?.language ?? "en"} />
        <SelectField name="status" label="Status" required options={enumOptions(CONTENT_STATUSES, CONTENT_STATUS_LABELS)} defaultValue={item?.status ?? "idea"} />
        <TextField name="targetPlatform" label="Platform" defaultValue={item?.targetPlatform ?? ""} placeholder="whatsapp, facebook, youtube..." />
        <TextField name="scheduledFor" label="Scheduled for" type="date" defaultValue={toDateInput(item?.scheduledFor)} />
        <TextField name="url" label="Link (once posted)" type="url" placeholder="https://" defaultValue={item?.url ?? ""} />
      </FormGrid>
      <TextareaField name="body" label="Draft" rows={6} defaultValue={item?.body ?? ""} />
      <TextareaField name="notes" label="Notes" rows={2} defaultValue={item?.notes ?? ""} />
      <FormActions>
        <SubmitButton>{item ? "Save" : "Add item"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}

export function MarkPostedForm({ id, url }: { id: string; url: string | null }) {
  return (
    <ActionForm action={markContentPostedAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <TextField name="url" label="Link to the post" type="url" placeholder="https://" defaultValue={url ?? ""} />
      <TextField name="postedAt" label="Posted on" type="date" defaultValue={toDateInput(new Date())} />
      <FormActions>
        <SubmitButton>Mark posted</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
