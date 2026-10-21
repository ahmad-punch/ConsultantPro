import { ArrowRightIcon, BadgeCheckIcon, ClipboardListIcon, HandshakeIcon, MapPinIcon, ShieldCheckIcon, StarIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, Section, SectionHeading } from "@/components/marketing/primitives";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Work with us",
  description:
    "Independent advocates, errand runners and accountants in Pakistan: take well-prepared cases for overseas clients, with clear fees, written briefs and fair rules.",
  alternates: { canonical: "/partners" },
};

const why = [
  { icon: ClipboardListIcon, title: "Prepared cases", body: "Every case arrives with a written brief, the client's documents organised in one folder, and a named case manager. Less chasing, more work." },
  { icon: MapPinIcon, title: "Work grouped by office", body: "We pool errands by city and office, so one visit to NADRA or the land record centre can cover several clients." },
  { icon: StarIcon, title: "Grow with your record", body: "Reliable delivery and good ratings move you up the tiers, and higher tiers are offered work first." },
];

const steps = [
  { title: "Apply", body: "Send the short form. Advocates add their Bar Council enrolment number." },
  { title: "Short interview", body: "A 20-minute call about the work you do, the offices you know and how you keep clients informed." },
  { title: "Sign the partner agreement", body: "It sets out fees, timelines, confidentiality and the no-poaching rule in plain words." },
  { title: "Trial case", body: "One paid engagement, reviewed closely. Then you join the active network on probation." },
  { title: "Grow", body: "After three good engagements you move to Bronze, then Silver and Gold as your record builds." },
];

const rules = [
  "We introduce the client. You do not approach them directly, for this matter or another, for 12 months after your last engagement with them. If they come back to you on their own, tell us.",
  "You receive the client's contact details only after you accept an engagement.",
  "No fees from the client outside the agreed engagement. Advocates bill their professional fee to the client directly, on their own letterhead, exactly as disclosed in the engagement.",
  "Client documents stay in the client's own folder. Do not keep copies or forward them.",
  "Updates go through the case so the client always has a written record.",
  "Only the official process. No payments to speed things up, and no claims of influence with any office.",
  "Breaking these rules means suspension from the network.",
];

export default function PartnersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Work with us"
        title="Good work for overseas clients, with clear rules."
        lede="Rasta helps overseas Pakistanis with property, inheritance, tax and paperwork at home. We need independent advocates, errand runners and accountants who do careful, honest work."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/partners/apply">
              Apply as a provider <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/partners/ambassadors">Become a community ambassador</Link>
          </Button>
        </div>
      </PageHeader>

      <Section>
        <SectionHeading eyebrow="Why work with us" title="We do the intake. You do the work you are good at." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {why.map((w) => (
            <div key={w.title} className="rounded-2xl border bg-card p-6">
              <w.icon className="size-6 text-highlight" aria-hidden />
              <h3 className="mt-4 font-medium">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="How it works" title="From application to active partner" />
        <ol className="mt-10 grid gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border bg-card p-5">
              <span className="font-mono text-sm text-highlight">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHeading eyebrow="Fees" title="How money flows" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <HandshakeIcon className="size-6 text-primary" aria-hidden />
            <h3 className="mt-4 font-medium">Advocates</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You bill the client directly, on your own letterhead, for your professional fee. We do not share in it and you pay us nothing. Our fee to the client covers intake, coordination and tracking only. The engagement records your fee so the client sees it in writing before work starts.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <BadgeCheckIcon className="size-6 text-primary" aria-hidden />
            <h3 className="mt-4 font-medium">Errand runners and accountants</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We agree a fixed fee per engagement before you start and pay it when the work is delivered and checked. Government fees are paid at cost, with receipts. Grouped errands are paid per item.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="muted" id="rules">
        <SectionHeading eyebrow="The rules" title="In plain words" lede="These are also in the partner agreement you sign before your first case." />
        <ul className="mt-8 grid max-w-3xl gap-3">
          {rules.map((r) => (
            <li key={r} className="flex gap-3 text-sm leading-relaxed">
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-4 rounded-2xl border bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-primary">Ready to apply?</h2>
            <p className="mt-1 text-muted-foreground">It takes about five minutes. We reply on WhatsApp.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/partners/apply">Apply as a provider</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/partners/ambassadors">Ambassador programme</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
