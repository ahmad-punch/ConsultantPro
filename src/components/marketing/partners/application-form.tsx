"use client";

import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPartnerApplication, type ApplicationFormState } from "@/lib/actions/partner-applications-public";
import { APPLICATION_TYPE_LABELS, type ApplicationType } from "@/lib/db/enums";
import { DEPARTMENTS } from "@/lib/validation/applications";

const PROVIDER_TYPES: ApplicationType[] = ["advocate", "errand_runner", "accountant"];

function Err({ errors, name }: { errors?: Record<string, string[] | undefined>; name: string }) {
  const msg = errors?.[name]?.[0];
  return msg ? (
    <p id={`${name}-error`} className="text-sm text-destructive">
      {msg}
    </p>
  ) : null;
}

function Row({ label, htmlFor, required, children, hint }: { label: string; htmlFor: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive" aria-hidden> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** One form for providers and ambassadors. `mode="ambassador"` fixes the type. */
export function PartnerApplicationForm({ mode = "provider" }: { mode?: "provider" | "ambassador" }) {
  const [state, action, pending] = useActionState<ApplicationFormState, FormData>(submitPartnerApplication, null);
  const [type, setType] = useState<ApplicationType>(mode === "ambassador" ? "ambassador" : "advocate");
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  if (state?.ok) {
    return (
      <div role="status" className="rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2Icon className="mx-auto size-10 text-success" aria-hidden />
        <h2 className="mt-4 font-display text-2xl text-primary">Application received</h2>
        <p className="mt-2 text-muted-foreground">{state.message === "received" ? "Thank you." : state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="relative grid gap-5 rounded-2xl border bg-card p-6 sm:p-8" noValidate>
      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {mode === "ambassador" ? (
        <input type="hidden" name="type" value="ambassador" />
      ) : (
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">What kind of work do you do? <span className="text-destructive" aria-hidden>*</span></legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {PROVIDER_TYPES.map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary">
                <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="accent-primary" />
                {APPLICATION_TYPE_LABELS[t]}
              </label>
            ))}
          </div>
          <Err errors={errors} name="type" />
        </fieldset>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Row label="Full name" htmlFor="name" required>
          <Input id="name" name="name" autoComplete="name" required aria-invalid={!!errors?.name} />
          <Err errors={errors} name="name" />
        </Row>
        <Row label="WhatsApp number" htmlFor="whatsapp" required hint="With country code, e.g. +92 300 0000000">
          <Input id="whatsapp" name="whatsapp" type="tel" autoComplete="tel" required aria-invalid={!!errors?.whatsapp} />
          <Err errors={errors} name="whatsapp" />
        </Row>
        <Row label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors?.email} />
          <Err errors={errors} name="email" />
        </Row>
        <Row label="Country" htmlFor="country" required>
          <Input id="country" name="country" defaultValue={mode === "ambassador" ? "" : "Pakistan"} autoComplete="country-name" required />
          <Err errors={errors} name="country" />
        </Row>
        <Row label="City" htmlFor="city">
          <Input id="city" name="city" autoComplete="address-level2" />
        </Row>
        <Row label="Years of experience" htmlFor="yearsExperience">
          <Input id="yearsExperience" name="yearsExperience" type="number" min={0} max={70} inputMode="numeric" />
          <Err errors={errors} name="yearsExperience" />
        </Row>
        {type === "advocate" ? (
          <Row label="Bar Council enrolment number" htmlFor="barCouncilNumber" required>
            <Input id="barCouncilNumber" name="barCouncilNumber" aria-invalid={!!errors?.barCouncilNumber} />
            <Err errors={errors} name="barCouncilNumber" />
          </Row>
        ) : null}
        <Row label="Languages" htmlFor="languages" hint="e.g. Urdu, English, Punjabi">
          <Input id="languages" name="languages" />
        </Row>
      </div>

      {mode === "ambassador" ? (
        <Row label="Your community, group or channel" htmlFor="channelOrNetwork" required hint="Association, mosque committee, WhatsApp group, YouTube channel; roughly how many people.">
          <Textarea id="channelOrNetwork" name="channelOrNetwork" rows={3} aria-invalid={!!errors?.channelOrNetwork} />
          <Err errors={errors} name="channelOrNetwork" />
        </Row>
      ) : (
        <>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Offices you work with</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DEPARTMENTS.map((d) => (
                <label key={d} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="departments" value={d} className="size-4 accent-primary" />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>
          <Row label="Cities or districts you cover" htmlFor="serviceAreas" hint="Comma separated, e.g. Lahore, Sheikhupura, Kasur">
            <Input id="serviceAreas" name="serviceAreas" />
          </Row>
          <Row label="Specialties" htmlFor="specialties" hint="e.g. succession certificates, mutation, NICOP, sales tax registration">
            <Input id="specialties" name="specialties" />
          </Row>
        </>
      )}

      <Row label="A few lines about you" htmlFor="bio">
        <Textarea id="bio" name="bio" rows={4} />
      </Row>

      <div className="flex items-start gap-2.5">
        <input id="acceptTerms" name="acceptTerms" type="checkbox" className="mt-1 size-4 accent-primary" aria-invalid={!!errors?.acceptTerms} />
        <div className="grid gap-1">
          <label htmlFor="acceptTerms" className="text-sm leading-snug">
            I have read <Link href="/partners#rules" className="underline">the rules</Link>: no direct approaches to clients Rasta introduces, no fees outside the agreed engagement, client documents stay in the client&apos;s folder, and no claims of influence with any office.
          </label>
          <Err errors={errors} name="acceptTerms" />
        </div>
      </div>

      {state && !state.ok ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
          Send application
        </Button>
      </div>
    </form>
  );
}
