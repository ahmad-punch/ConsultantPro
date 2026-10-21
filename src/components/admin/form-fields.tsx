"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { NONE } from "@/lib/validation/fields";

import { useActionFormState } from "./action-form";
import type { Opt } from "./format";

function useFieldError(name: string) {
  const { errors } = useActionFormState();
  return errors[name]?.[0];
}

type BaseProps = {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  required?: boolean;
};

function FieldShell({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={error ? true : undefined} className={cn("gap-1.5", className)}>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? <span className="text-destructive" aria-hidden>*</span> : null}
      </FieldLabel>
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

export function TextField({
  name,
  label,
  description,
  className,
  required,
  ...input
}: BaseProps & Omit<ComponentProps<typeof Input>, "name" | "id">) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <FieldShell id={id} label={label} description={description} error={error} required={required} className={className}>
      <Input id={id} name={name} required={required} aria-invalid={error ? true : undefined} {...input} />
    </FieldShell>
  );
}

export function TextareaField({
  name,
  label,
  description,
  className,
  required,
  ...input
}: BaseProps & Omit<ComponentProps<typeof Textarea>, "name" | "id">) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <FieldShell id={id} label={label} description={description} error={error} required={required} className={className}>
      <Textarea id={id} name={name} required={required} aria-invalid={error ? true : undefined} {...input} />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  description,
  className,
  required,
  options,
  defaultValue,
  value,
  onValueChange,
  placeholder = "Choose...",
  noneLabel,
}: BaseProps & {
  options: Opt[];
  defaultValue?: string | null;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Adds a "None" choice that submits as null. */
  noneLabel?: string;
}) {
  const id = useId();
  const error = useFieldError(name);
  const initial = defaultValue ?? (noneLabel ? NONE : undefined);
  return (
    <FieldShell id={id} label={label} description={description} error={error} required={required} className={className}>
      <Select
        name={name}
        required={required}
        defaultValue={value === undefined ? initial : undefined}
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={error ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {noneLabel ? <SelectItem value={NONE}>{noneLabel}</SelectItem> : null}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  description,
  defaultChecked,
  className,
}: Omit<BaseProps, "required"> & { defaultChecked?: boolean }) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
      />
      <div className="grid gap-0.5">
        <label htmlFor={id} className="text-sm leading-snug font-medium">
          {label}
        </label>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

/**
 * Two-column grid for form fields, driven by the container width (not the
 * viewport) so the same form works in a dialog, a page or a narrow side card.
 * Children span both columns with `@md:col-span-2`.
 */
export function FormGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("@container", className)}>
      <div className="grid gap-4 @md:grid-cols-2">{children}</div>
    </div>
  );
}

export function FormActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center justify-end gap-2 pt-2", className)}>{children}</div>;
}
