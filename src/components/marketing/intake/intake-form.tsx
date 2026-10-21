"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, Loader2Icon, MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch, type Control, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitPublicIntake } from "@/lib/actions/leads-public";
import {
  CASE_CATEGORIES,
  CASE_CATEGORY_LABELS,
  LEAD_URGENCIES,
  LEAD_URGENCY_LABELS,
  type CaseCategory,
} from "@/lib/db/enums";
import { hasWhatsapp, site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

import { detailQuestionsFor, DETAIL_YES_NO, type DetailQuestion } from "./details-questions";
import {
  INTAKE_COUNTRIES,
  intakeSchema,
  URGENCY_DESCRIPTIONS,
  type IntakeInput,
  type IntakeValues,
} from "./schema";

type Submitted = { category: CaseCategory; reference: string; name: string };

const triggerClass = "h-11 w-full bg-card px-3 text-base md:text-sm";
const inputClass = "h-11 bg-card px-3 text-base md:text-sm";

export function IntakeForm({
  defaultCategory,
  defaultReferral,
  source,
}: {
  defaultCategory?: CaseCategory;
  defaultReferral?: string;
  source?: string;
}) {
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<IntakeInput, unknown, IntakeValues>({
    resolver: zodResolver(intakeSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      whatsapp: "",
      email: "",
      category: defaultCategory,
      urgency: "normal",
      description: "",
      referralCode: defaultReferral ?? "",
      consent: false,
      website: "",
      source: source ?? "website",
    },
  });

  const onSubmit = (values: IntakeValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitPublicIntake(values);
      if (result.ok) {
        setSubmitted({
          category: values.category,
          reference: result.data?.reference ?? "",
          name: values.name.split(" ")[0] ?? values.name,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setServerError(result.error);
      for (const [key, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages?.[0]) form.setError(key as keyof IntakeInput, { message: messages[0] });
      }
    });
  };

  if (submitted) return <Confirmation {...submitted} />;

  return <IntakeFields form={form} onSubmit={onSubmit} pending={pending} serverError={serverError} />;
}

function DescriptionCount({ control }: { control: Control<IntakeInput, unknown, IntakeValues> }) {
  const value = useWatch({ control, name: "description" });
  return (
    <span className="shrink-0 tabular-nums" aria-hidden="true">
      {value?.length ?? 0}/4000
    </span>
  );
}

function DetailsFields({ control }: { control: Control<IntakeInput, unknown, IntakeValues> }) {
  const category = useWatch({ control, name: "category" });
  const questions = detailQuestionsFor(category);
  if (!questions.length) return null;
  return (
    <FieldSet>
      <FieldLegend variant="label" className="text-sm">
        A few quick questions <span className="font-normal text-muted-foreground">(all optional)</span>
      </FieldLegend>
      <FieldGroup className="gap-5 sm:grid sm:grid-cols-2">
        {questions.map((q) => (
          <DetailField key={`${category}-${q.key}`} control={control} question={q} />
        ))}
      </FieldGroup>
    </FieldSet>
  );
}

function DetailField({
  control,
  question,
}: {
  control: Control<IntakeInput, unknown, IntakeValues>;
  question: DetailQuestion;
}) {
  const id = `intake-details-${question.key}`;
  const options = question.type === "yesno" ? DETAIL_YES_NO : question.options;
  return (
    <Controller
      name={`details.${question.key}`}
      control={control}
      render={({ field }) => (
        <Field>
          <FieldLabel htmlFor={id}>{question.label}</FieldLabel>
          {options ? (
            <Select name={field.name} value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id={id} onBlur={field.onBlur} className={triggerClass}>
                <SelectValue placeholder="Choose">{field.value || undefined}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              {...field}
              value={field.value ?? ""}
              id={id}
              type={question.type === "date" ? "date" : "text"}
              maxLength={500}
              placeholder={question.placeholder}
              className={inputClass}
            />
          )}
        </Field>
      )}
    />
  );
}

function IntakeFields({
  form,
  onSubmit,
  pending,
  serverError,
}: {
  form: UseFormReturn<IntakeInput, unknown, IntakeValues>;
  onSubmit: (values: IntakeValues) => void;
  pending: boolean;
  serverError: string | null;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-describedby="intake-intro">
      <p id="intake-intro" className="sr-only">
        All fields are required unless marked optional.
      </p>
      <FieldGroup className="gap-7">
        <FieldSet>
          <FieldLegend className="font-display text-xl font-medium text-primary">About you</FieldLegend>
          <FieldGroup className="gap-5">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="intake-name">Your name</FieldLabel>
                  <Input
                    {...field}
                    id="intake-name"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    className={inputClass}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="whatsapp"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="intake-whatsapp">WhatsApp number</FieldLabel>
                    <Input
                      {...field}
                      id="intake-whatsapp"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+44 7700 900000"
                      aria-invalid={fieldState.invalid}
                      aria-describedby="intake-whatsapp-help"
                      className={inputClass}
                    />
                    <FieldDescription id="intake-whatsapp-help">Include your country code.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="intake-email">
                      Email <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="intake-email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      className={inputClass}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
            <Controller
              name="country"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="intake-country">Country you live in</FieldLabel>
                  <Select name={field.name} value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="intake-country"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className={triggerClass}
                    >
                      <SelectValue placeholder="Choose a country">{field.value || undefined}</SelectValue>
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-72">
                      {INTAKE_COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend className="font-display text-xl font-medium text-primary">Your case</FieldLegend>
          <FieldGroup className="gap-5">
            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="intake-category">What is it about?</FieldLabel>
                  <Select name={field.name} value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="intake-category"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className={triggerClass}
                    >
                      <SelectValue placeholder="Choose a category">
                        {field.value ? CASE_CATEGORY_LABELS[field.value] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {CASE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {CASE_CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <DetailsFields control={form.control} />

            <Controller
              name="urgency"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label" className="text-sm">
                    How urgent is it?
                  </FieldLegend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {LEAD_URGENCIES.map((urgency) => {
                      const checked = field.value === urgency;
                      return (
                        <label
                          key={urgency}
                          className={cn(
                            "flex cursor-pointer flex-col gap-1 rounded-lg border bg-card p-4 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                            checked ? "border-primary bg-secondary" : "hover:border-primary/40",
                          )}
                        >
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <input
                              type="radio"
                              name={field.name}
                              value={urgency}
                              checked={checked}
                              onChange={() => field.onChange(urgency)}
                              onBlur={field.onBlur}
                              className="size-4 accent-[var(--primary)]"
                            />
                            {LEAD_URGENCY_LABELS[urgency]}
                          </span>
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {URGENCY_DESCRIPTIONS[urgency]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </FieldSet>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="intake-description">What is happening?</FieldLabel>
                  <Textarea
                    {...field}
                    id="intake-description"
                    rows={7}
                    aria-invalid={fieldState.invalid}
                    aria-describedby="intake-description-help"
                    className="min-h-40 bg-card px-3 py-2.5 text-base md:text-sm"
                    placeholder="For example: my father died in 2020 and left a house in Lahore. My brother lives there and will not discuss the shares. I live in Manchester."
                  />
                  <FieldDescription id="intake-description-help" className="flex justify-between gap-4">
                    <span>Who, what, where, and which documents you have. Please do not send documents yet.</span>
                    <DescriptionCount control={form.control} />
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="referralCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="sm:max-w-xs">
                  <FieldLabel htmlFor="intake-referral">
                    Referral code <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="intake-referral"
                    autoComplete="off"
                    className={cn(inputClass, "uppercase")}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        {/* Honeypot: hidden from people and assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="intake-website">Website</label>
          <input id="intake-website" tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </div>

        <Controller
          name="consent"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="rounded-xl border bg-muted/50 p-5">
              <div className="flex items-start gap-3">
                <input
                  id="intake-consent"
                  type="checkbox"
                  name={field.name}
                  ref={field.ref}
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  aria-describedby="intake-consent-text"
                  className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                />
                <FieldLabel htmlFor="intake-consent" className="block font-normal leading-relaxed">
                  <span id="intake-consent-text">
                    I understand that {site.name} is not a law firm and that this is general information,
                    not legal advice. I have read the{" "}
                    <Link href="/legal/disclaimer" className="font-medium text-primary underline underline-offset-4" target="_blank">
                      disclaimer
                    </Link>{" "}
                    and the{" "}
                    <Link href="/legal/privacy" className="font-medium text-primary underline underline-offset-4" target="_blank">
                      privacy notice
                    </Link>
                    .
                  </span>
                </FieldLabel>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {serverError ? (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {serverError}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button type="submit" disabled={pending} className="h-12 px-7 text-base">
            {pending ? (
              <>
                <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden="true" />
                Sending
              </>
            ) : (
              "Send my case"
            )}
          </Button>
          <p className="text-sm text-muted-foreground">Free. Nothing to pay until you choose a step.</p>
        </div>
      </FieldGroup>
    </form>
  );
}

function Confirmation({ category, reference, name }: Submitted) {
  const label = CASE_CATEGORY_LABELS[category];
  const message = `Hi, I just submitted a case about ${label}`;
  return (
    <div role="status" aria-live="polite" className="rounded-2xl border bg-card p-7 sm:p-10">
      <CheckCircle2Icon className="size-10 text-success" aria-hidden="true" />
      <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-primary">
        Thank you, {name}. We have your case.
      </h2>
      {reference && reference !== "received" ? (
        <p className="mt-3 text-muted-foreground">
          Your reference is <span className="font-mono font-medium text-foreground">{reference}</span>.
        </p>
      ) : null}
      <h3 className="mt-8 text-xs font-semibold tracking-[0.18em] text-highlight uppercase">What happens next</h3>
      <ol className="mt-4 space-y-4">
        {[
          "A case manager reads what you sent and works out which office or court owns the problem.",
          "We contact you on WhatsApp, usually the same working day, with the smallest step that answers your question and its price.",
          "You decide. Nothing is charged until you agree to a step, and you only ever pay for the next one.",
        ].map((step, i) => (
          <li key={step} className="flex gap-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs text-primary">
              {i + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {hasWhatsapp ? (
          <Button asChild className="h-12 px-6 text-base">
            <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">
              <MessageCircleIcon data-icon="inline-start" />
              Message us on WhatsApp
            </a>
          </Button>
        ) : null}
        <Button asChild variant="outline" className="h-12 px-6 text-base">
          <Link href="/guides">Read the guides while you wait</Link>
        </Button>
      </div>
      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">{site.disclaimer}</p>
    </div>
  );
}
