import {
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleDotIcon,
  HomeIcon,
  PlaneIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CitedStats } from "@/components/marketing/cited-stats";
import { CtaBand } from "@/components/marketing/cta-band";
import { homeFaqs } from "@/components/marketing/data/faqs";
import { processSteps } from "@/components/marketing/data/process";
import { FaqList } from "@/components/marketing/faq-list";
import { GuideCard } from "@/components/marketing/guide-card";
import { MemoMock } from "@/components/marketing/memo-mock";
import { Container, Eyebrow, PathMotif, Section, SectionHeading } from "@/components/marketing/primitives";
import { TrustStack } from "@/components/marketing/trust-stack";
import { Button } from "@/components/ui/button";
import { getAllGuides } from "@/lib/guides";
import { formatPrice, products, retainerTiers } from "@/lib/pricing";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name}: ${site.tagline}` },
  description: site.description,
  alternates: { canonical: "/" },
};

const segments = [
  {
    icon: HomeIcon,
    title: "Families in the UK with land back home",
    body: "Inherited land, a plot someone has occupied, a relative holding a power of attorney, heirs who cannot agree.",
    lead: "Start with a Case Assessment and a written plan.",
    guide: { label: "Succession and inheritance", href: "/guides/succession-certificate-inheritance-from-abroad" },
  },
  {
    icon: PlaneIcon,
    title: "Workers in the Gulf",
    body: "Inheritance and land at home, NICOP renewals, document attestation, agents who took money and stopped replying.",
    lead: `Start small: a written answer is ${formatPrice("question")}, errands ${formatPrice("errand")}.`,
    guide: { label: "NICOP and NADRA from abroad", href: "/guides/nicop-poc-and-nadra-from-abroad" },
  },
  {
    icon: BriefcaseBusinessIcon,
    title: "Professionals in North America and Australia",
    body: "FBR filer status, buying property safely, registering a company with SECP, degree attestation. More paperwork than dispute.",
    lead: "Fixed-price errands, or a call to map the route.",
    guide: { label: "FBR non-resident filer status", href: "/guides/fbr-non-resident-filer-status" },
  },
];

const exampleUpdate = [
  { icon: CheckCircle2Icon, tone: "text-success", label: "Done", text: "Certified copy of the land record collected from the revenue office." },
  { icon: CircleDotIcon, tone: "text-highlight", label: "In progress", text: "Your advocate is preparing the mutation application." },
  { icon: CircleDashedIcon, tone: "text-muted-foreground", label: "Next", text: "Filing, once you approve the draft we sent on WhatsApp." },
];

export default function HomePage() {
  const latestGuides = getAllGuides().slice(0, 3);
  const lowestRetainer = retainerTiers[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-card">
        <PathMotif className="pointer-events-none absolute top-0 -right-24 hidden h-full text-primary/[0.05] lg:block" />
        <Container className="relative grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <Eyebrow>For overseas Pakistanis</Eyebrow>
            <h1 className="mt-4 font-display text-[2.6rem] leading-[1.05] font-medium tracking-tight text-balance text-primary sm:text-6xl lg:text-[4.25rem]">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-foreground/75 sm:text-xl">
              Property, inheritance, tax, NADRA and paperwork problems in Pakistan, explained in a
              written plan, priced up front, and tracked to closure with independent advocates.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 px-6 text-base">
                <Link href={site.cta.href}>
                  {site.cta.label}
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 bg-card px-6 text-base">
                <Link href="/pricing">See prices</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              From {formatPrice("question")} for a written answer. Not a law firm.{" "}
              <Link href="/legal/disclaimer" className="underline underline-offset-4 hover:text-primary">
                Read the disclaimer
              </Link>
              .
            </p>
          </div>

          <figure className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl border bg-background p-6 shadow-[0_30px_60px_-30px_rgb(15_61_46/0.35)] sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-highlight uppercase">Written update</p>
                <span className="rounded-full border border-dashed px-2.5 py-0.5 text-[0.7rem] text-muted-foreground">
                  Illustration
                </span>
              </div>
              <p className="mt-3 font-display text-xl font-medium text-primary">Inherited plot, mutation</p>
              <ul className="mt-5 space-y-4">
                {exampleUpdate.map(({ icon: Icon, tone, label, text }) => (
                  <li key={label} className="flex gap-3">
                    <Icon className={`mt-0.5 size-5 shrink-0 ${tone}`} aria-hidden="true" />
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">{label}.</span>{" "}
                      <span className="text-foreground/75">{text}</span>
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
                Next update within 14 days, even if nothing has moved.
              </p>
            </div>
            <figcaption className="mt-4 text-center text-xs text-muted-foreground">
              What a case update looks like. Not a real case.
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* Who this is for */}
      <Section aria-labelledby="who-title">
        <SectionHeading
          id="who-title"
          eyebrow="Who this is for"
          title="For families who live abroad and still carry responsibilities at home."
          lede="Government help exists, but it is split across offices. Nobody tracks one person's case across revenue, NADRA, FBR, police and courts. That is the job we do."
        />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {segments.map(({ icon: Icon, title, body, lead, guide }) => (
            <li key={title} className="flex flex-col rounded-2xl border bg-card p-7">
              <Icon className="size-6 text-highlight" aria-hidden="true" />
              <h3 className="mt-5 font-display text-2xl leading-snug font-medium text-primary">{title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{body}</p>
              <p className="mt-5 text-sm font-medium text-foreground">{lead}</p>
              <Link
                href={guide.href}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Guide: {guide.label}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* How it works */}
      <Section tone="muted" aria-labelledby="how-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="how-title"
            eyebrow="How it works"
            title="Five steps, each one written down."
            lede="You always know what stage your case is at, who is handling it, and what the next step costs."
          />
          <Link
            href="/how-it-works"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            The full process
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((step, i) => (
            <li key={step.id} className="flex flex-col bg-card p-6">
              <span className="font-mono text-sm text-highlight">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-display text-xl font-medium text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.summary}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* What you get */}
      <Section aria-labelledby="memo-title">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              id="memo-title"
              eyebrow="What you get"
              title="A Pathway Memo: your problem, on paper, in plain English."
              lede={`The core of a Case Assessment (${formatPrice("assessment")}). We read your documents and write the plan. An independent advocate reviews the legal content. Then we walk you through it on a call.`}
            />
            <ul className="mt-8 space-y-3">
              {[
                "Which office or court owns the problem, and why",
                "Every lawful option, with realistic timelines",
                "All the costs, with our fee, advocate fees and government fees kept apart",
                "The traps that cost families the most",
                "Next steps, in order, with who does what",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-muted-foreground">
              {products.find((p) => p.id === "assessment")?.turnaround}. Urdu on request.
            </p>
          </div>
          <MemoMock className="mx-auto w-full max-w-lg lg:ml-auto" />
        </div>
      </Section>

      {/* Pricing teaser */}
      <Section tone="card" className="border-y" aria-labelledby="prices-title">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              id="prices-title"
              eyebrow="Prices"
              title="Published prices. Pay one step at a time."
              lede="Our fee is the price on this page. Advocate fees are billed to you directly by the advocate. Government fees are charged at cost, with receipts."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button asChild className="h-11 px-5">
                <Link href="/pricing">
                  Full price list
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 px-5">
                <Link href={site.cta.href}>{site.cta.label}</Link>
              </Button>
            </div>
          </div>
          <div>
            <ul className="divide-y border-y">
              {products.map((product) => (
                <li key={product.id} className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5">
                  <h3 className="font-display text-xl font-medium text-primary">{product.name}</h3>
                  <p className="text-right font-display text-xl font-medium whitespace-nowrap">
                    {formatPrice(product)}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{product.summary}</p>
                  <p className="text-right text-xs text-muted-foreground">{product.unit}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-xl bg-secondary px-5 py-4 text-sm leading-relaxed text-secondary-foreground">
              <span className="font-semibold">Family Affairs retainer.</span> Ongoing cover for your
              property and paperwork, from {formatPrice(lowestRetainer)}.{" "}
              <Link href="/pricing#retainers" className="font-medium underline underline-offset-4">
                Compare plans
              </Link>
            </p>
          </div>
        </div>
      </Section>

      {/* Why this exists */}
      <Section aria-labelledby="why-title">
        <SectionHeading
          id="why-title"
          eyebrow="Why this exists"
          title="Millions of families abroad, problems at home, and no one tracking the whole case."
          lede="Pakistan has legislated special courts for overseas property twice in two years. Provinces and the FIA have opened overseas complaint cells. The help is real, but it is scattered."
        />
        <div className="mt-14">
          <CitedStats />
        </div>
      </Section>

      {/* Trust stack */}
      <Section tone="muted" aria-labelledby="trust-title">
        <SectionHeading
          id="trust-title"
          eyebrow="Why you can trust the process"
          title="We limit what you risk, and we put everything in writing."
          lede="We are new, so we will not show you reviews we do not have. Here is what we do instead."
        />
        <div className="mt-12">
          <TrustStack />
        </div>
      </Section>

      {/* Guides */}
      <Section aria-labelledby="guides-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="guides-title"
            eyebrow="Free pathway guides"
            title="Read the route before you spend anything."
            lede="Plain-English guides to the problems we see most, with an Urdu summary on each."
          />
          <Link
            href="/guides"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            All guides
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {latestGuides.map((guide) => (
            <li key={guide.slug}>
              <GuideCard guide={guide} />
            </li>
          ))}
        </ul>
      </Section>

      {/* FAQ */}
      <Section tone="card" className="border-t" aria-labelledby="faq-title">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionHeading
              id="faq-title"
              eyebrow="Questions"
              title="The questions people ask first."
            />
            <Link
              href="/faq"
              className="mt-6 inline-flex items-center gap-1.5 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              All questions
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <FaqList items={homeFaqs} />
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
