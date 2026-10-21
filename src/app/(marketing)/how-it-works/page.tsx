import { CheckIcon, MinusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/cta-band";
import { processSteps } from "@/components/marketing/data/process";
import { MemoMock, memoSections } from "@/components/marketing/memo-mock";
import { PageHeader, Section, SectionHeading, Todo } from "@/components/marketing/primitives";
import { formatPrice, formatPriceRange, getProduct } from "@/lib/pricing";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The case lifecycle in detail: intake, triage, the written Pathway Memo, managed execution with an independent advocate, tracked updates, errands and our refund policy.",
  alternates: { canonical: "/how-it-works" },
};

const included = [
  "A named case manager for your case",
  "Plain-English explanations, in writing",
  "Document checklists and organising your papers",
  "Scheduling, chasing and errands at government offices",
  "Written updates at every milestone and on a fixed schedule",
  "Introductions to independent advocates, errand runners and tax practitioners",
];

const notIncluded = [
  "Legal advice or legal opinions in our name",
  "Appearing in court or signing filings for you",
  "Any promise of an outcome or a date",
  "Shortcuts, influence or speed-ups outside the official process",
  "Holding your money, your property or your original documents",
  "Advocate fees and government fees (billed separately, at cost)",
];

export default function HowItWorksPage() {
  const managed = getProduct("managed");
  const errand = getProduct("errand");

  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="A clear process, written down at every step."
        lede="We diagnose the problem, write the plan, and stay accountable while it moves. Here is exactly what happens, what it costs, and what we do not do."
      >
        <nav aria-label="On this page" className="flex flex-wrap gap-2 text-sm">
          {[
            ["#lifecycle", "The lifecycle"],
            ["#memo", "The memo"],
            ["#managed", "Managed cases"],
            ["#errands", "Errands"],
            ["#scope", "What is included"],
            ["#refunds", "Refunds"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-full border bg-background px-3.5 py-1.5 font-medium text-foreground/80 transition-colors outline-none hover:border-primary/40 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {label}
            </a>
          ))}
        </nav>
      </PageHeader>

      <Section id="lifecycle" className="scroll-mt-16" aria-labelledby="lifecycle-title">
        <SectionHeading
          id="lifecycle-title"
          eyebrow="The case lifecycle"
          title="From first message to closing summary."
        />
        <ol className="relative mt-14 space-y-12 before:absolute before:top-2 before:bottom-2 before:left-[1.1rem] before:w-px before:bg-border sm:before:left-[1.35rem]">
          {processSteps.map((step, i) => (
            <li key={step.id} className="relative grid grid-cols-[2.25rem_1fr] gap-x-5 sm:grid-cols-[2.75rem_1fr] sm:gap-x-8">
              <span className="relative z-10 grid size-9 place-items-center rounded-full border-2 border-primary bg-background font-mono text-sm font-medium text-primary sm:size-11">
                {i + 1}
              </span>
              <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
                <div>
                  <h3 className="font-display text-2xl font-medium text-primary sm:text-3xl">{step.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-foreground/80">{step.summary}</p>
                  <ul className="mt-4 space-y-2 text-muted-foreground">
                    {step.detail.map((d) => (
                      <li key={d} className="flex gap-2.5">
                        <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-highlight" />
                        <span className="leading-relaxed">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <dl className="h-fit space-y-4 rounded-xl border bg-card p-5 text-sm">
                  <div>
                    <dt className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">You get</dt>
                    <dd className="mt-1 leading-relaxed">{step.output}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Timing</dt>
                    <dd className="mt-1 leading-relaxed">{step.timing}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Who</dt>
                    <dd className="mt-1 leading-relaxed">{step.who}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-12 max-w-3xl rounded-xl bg-secondary p-5 text-sm leading-relaxed text-secondary-foreground">
          <span className="font-semibold">FIR and police matters</span> follow the same lifecycle with
          one rule: an independent advocate handles everything of substance, on the advocate&apos;s own
          letterhead. We handle intake, documents, tracking and general public information only.
        </p>
      </Section>

      <Section tone="muted" id="memo" className="scroll-mt-16" aria-labelledby="memo-title">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              id="memo-title"
              eyebrow="The Pathway Memo"
              title="Seven sections, the same every time."
              lede={`Part of the Case Assessment (${formatPrice("assessment")}). ${getProduct("assessment").turnaround}.`}
            />
            <ol className="mt-8 space-y-5">
              {memoSections.map((section, i) => (
                <li key={section.title} className="grid grid-cols-[2rem_1fr] gap-x-3">
                  <span className="font-mono text-sm leading-6 text-highlight">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-medium text-foreground">{section.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <MemoMock className="mx-auto w-full max-w-lg lg:sticky lg:top-24" />
        </div>
      </Section>

      <Section id="managed" className="scroll-mt-16" aria-labelledby="managed-title">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              id="managed-title"
              eyebrow="Managed cases"
              title="We run the case. Your advocate gives the legal advice."
              lede={`A Managed Case costs ${formatPriceRange(managed)} for the project, quoted in writing before work starts. ${managed.extraCosts}.`}
            />
            <ol className="mt-8 space-y-4">
              {[
                "You retain an independent partner advocate directly, with an engagement letter in your name.",
                "We agree a milestone plan with you and the advocate before anything starts.",
                "We handle documents, scheduling, errands and chasing, and report in writing.",
                "You pay our project fee in stages. You never prepay more than the next stage.",
                "At closure you get a closing summary and every document handed back.",
              ].map((item, i) => (
                <li key={item} className="flex gap-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          </div>
          <div id="errands" className="scroll-mt-24 rounded-2xl border bg-card p-7 sm:p-9">
            <p className="text-xs font-semibold tracking-[0.18em] text-highlight uppercase">Errands</p>
            <h3 className="mt-3 font-display text-2xl font-medium text-primary">
              One task, one fixed fee, receipts for everything.
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {errand.summary} Our fee is {formatPriceRange(errand)} per errand, agreed before we start.{" "}
              {errand.extraCosts}, with the official receipt.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {errand.includes.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">{errand.turnaround}.</p>
          </div>
        </div>
      </Section>

      <Section tone="card" id="scope" className="scroll-mt-16 border-y" aria-labelledby="scope-title">
        <SectionHeading
          id="scope-title"
          eyebrow="Scope"
          title="What we do, and what we will never do."
          lede="We are a navigation and case-management service. We are not a law firm and not a fixer."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-background p-7">
            <h3 className="font-display text-xl font-medium text-primary">Included</h3>
            <ul className="mt-5 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border bg-background p-7">
            <h3 className="font-display text-xl font-medium text-primary">Not included</h3>
            <ul className="mt-5 space-y-3 text-muted-foreground">
              {notIncluded.map((item) => (
                <li key={item} className="flex gap-3">
                  <MinusIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="refunds" className="scroll-mt-16" aria-labelledby="refunds-title">
        <div className="max-w-3xl">
          <SectionHeading id="refunds-title" eyebrow="Refunds" title="Our refund policy, in plain words." />
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/85">
            <p>
              If we do not deliver your Pathway Memo within the stated time, you get a full refund of
              the Case Assessment fee.
            </p>
            <p>
              If you cancel before we start work on a stage, we refund that stage in full.
            </p>
            <p>
              We do not refund based on what a court, office or the other side decides. Nobody
              controls that, and anyone who says they do is not telling you the truth.
            </p>
            <p>
              Advocate fees are between you and the advocate. Government fees, once paid to the
              office, usually cannot be recovered.
            </p>
            <p>
              <Todo>TODO: confirm refund wording with counsel before launch</Todo>
            </p>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Questions about a payment?{" "}
            <Link href={site.cta.href} className="font-medium text-primary underline underline-offset-4">
              Contact us
            </Link>
            . The full terms are in our{" "}
            <Link href="/legal/terms" className="font-medium text-primary underline underline-offset-4">
              terms of service
            </Link>
            .
          </p>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
