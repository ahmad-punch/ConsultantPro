import {
  BadgeCheckIcon,
  BanIcon,
  FolderLockIcon,
  HandshakeIcon,
  ScaleIcon,
  UserRoundCogIcon,
  UsersRoundIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/cta-band";
import { PageHeader, Section, SectionHeading, Todo } from "@/components/marketing/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `How ${site.name} works: a navigation and case-management service for overseas Pakistanis. Not a law firm, not a fixer, no outcome promises. Independent advocates, written plans, your documents in your own Drive.`,
  alternates: { canonical: "/about" },
};

const principles = [
  {
    icon: ScaleIcon,
    title: "Not a law firm",
    body: "We give general information and run the case. Legal advice comes from independent advocates who you retain and who bill you directly.",
  },
  {
    icon: BanIcon,
    title: "Not a fixer",
    body: "We sell process and information, never access. We follow the official process and decline any request to make a problem disappear by other means.",
  },
  {
    icon: BadgeCheckIcon,
    title: "No outcome promises",
    body: "Offices and courts decide outcomes. We promise a clear written plan, honest timelines, published prices and regular updates.",
  },
];

const roles = [
  {
    icon: UserRoundCogIcon,
    title: "Case managers",
    body: "Run intake and triage, draft your Pathway Memo, keep the milestone plan and write every update. One named case manager per case.",
  },
  {
    icon: ScaleIcon,
    title: "Partner advocates",
    body: "Independent advocates in Pakistan. They review the legal content of memos, advise you, and act in court on their own letterhead. You retain and pay them directly.",
  },
  {
    icon: HandshakeIcon,
    title: "Errand runners",
    body: "Collect and submit documents at NADRA, revenue offices, HEC, FBR and courts, for a fixed fee, with receipts for every government fee.",
  },
  {
    icon: UsersRoundIcon,
    title: "Advisers",
    body: "Practising professionals and retired specialists who review our process and guides. Named only with their written agreement.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={`About ${site.name}`}
        title="We tell you plainly what your problem is, and then we stay on the case."
        lede={`${site.name} (${site.urduName}, "the way") is a navigation and case-management service for overseas Pakistanis with property, inheritance, tax, NADRA and paperwork problems back home.`}
      />

      <Section aria-labelledby="model-title">
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            id="model-title"
            eyebrow="The model"
            title="Credible diagnosis, then accountability."
          />
          <div className="space-y-5 text-lg leading-relaxed text-foreground/85">
            <p>
              Information about Pakistani law and offices is everywhere. What families abroad cannot easily
              get is someone who reads their documents, tells them plainly which office owns the problem and
              what it will cost, and then stays accountable while it moves.
            </p>
            <p>
              So we sell four things at published prices: written answers and calls, a written Pathway Memo,
              managed cases run with an independent advocate, and fixed-fee errands. Families who want ongoing
              cover can take a monthly Family Affairs plan.
            </p>
            <p>
              <Link href="/how-it-works" className="font-medium text-primary underline underline-offset-4">
                See how a case works
              </Link>{" "}
              or{" "}
              <Link href="/pricing" className="font-medium text-primary underline underline-offset-4">
                read the prices
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section tone="primary" aria-labelledby="principles-title">
        <SectionHeading id="principles-title" eyebrow="Principles" title="Three lines we do not cross." invert />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-primary-foreground/15 p-7">
              <Icon className="size-6 text-highlight-soft" aria-hidden="true" />
              <h3 className="mt-5 font-display text-2xl font-medium">{title}</h3>
              <p className="mt-3 leading-relaxed text-primary-foreground/80">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="roles-title">
        <SectionHeading
          id="roles-title"
          eyebrow="Who runs delivery"
          title="Clear roles, each one accountable."
          lede="Every case has a named case manager. You will see their name and face on your first call."
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {roles.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-5 rounded-2xl border bg-card p-7">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-xl font-medium text-primary">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted" aria-labelledby="advisers-title">
        <SectionHeading
          id="advisers-title"
          eyebrow="Advisers"
          title="Our advisers"
          lede="We will list our advisers here once each one has agreed in writing to be named. We will not show names, photos or titles until then."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex min-h-44 flex-col justify-between rounded-2xl border-2 border-dashed border-warning/40 bg-background/60 p-6"
            >
              <Todo className="self-start">TODO: adviser {n}</Todo>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Name, field and short biography, added only with written consent.
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section aria-labelledby="documents-title">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
              <FolderLockIcon className="size-6" aria-hidden="true" />
            </span>
            <SectionHeading
              id="documents-title"
              className="mt-6"
              eyebrow="Your documents"
              title="How we handle your documents."
            />
          </div>
          <ul className="space-y-6 text-lg leading-relaxed text-foreground/85">
            <li>
              <span className="font-semibold text-foreground">Your own Google Drive.</span> Case files live in a
              Google Drive folder you own, or one we create and share with you. You can see everything in it.
            </li>
            <li>
              <span className="font-semibold text-foreground">We store links, not files.</span> Our case
              tracker keeps the link to your folder and your memo. We do not upload your documents into our own
              systems.
            </li>
            <li>
              <span className="font-semibold text-foreground">Shared only with your agreement.</span> We share
              a document with the advocate or errand runner who needs it, and only after you say yes.
            </li>
            <li>
              <span className="font-semibold text-foreground">No originals.</span> We work from copies. Your
              originals stay with you, or with your advocate when a filing needs them.
            </li>
            <li className="text-base text-muted-foreground">
              Read the full{" "}
              <Link href="/legal/privacy" className="font-medium text-primary underline underline-offset-4">
                privacy notice
              </Link>
              .
            </li>
          </ul>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
