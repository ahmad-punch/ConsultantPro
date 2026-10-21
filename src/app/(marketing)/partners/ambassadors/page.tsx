import type { Metadata } from "next";

import { PartnerApplicationForm } from "@/components/marketing/partners/application-form";
import { Container, PageHeader, Section, SectionHeading, Todo } from "@/components/marketing/primitives";

export const metadata: Metadata = {
  title: "Community ambassadors",
  description: "Overseas community organisers: help people you know find honest help with paperwork in Pakistan, and earn a referral share.",
  alternates: { canonical: "/partners/ambassadors" },
};

const how = [
  { title: "You get a personal link and code", body: "Share it in your association, WhatsApp group or channel when someone asks for help with property, inheritance, tax or documents back home." },
  { title: "They talk to us directly", body: "We handle the case from intake onward. You never handle documents, money or private details." },
  { title: "You earn on the first purchase", body: "A share of the client's first purchase, paid after it clears." },
];

const rules = [
  "Share honestly: we sell process and information, not shortcuts or influence.",
  "No promises of outcomes or dates on our behalf.",
  "No spam. Post where you are a member and where the admins allow it.",
  "We pay referrals only for new clients who use your code or link.",
];

export default function AmbassadorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ambassador programme"
        title="Point your community to honest help."
        lede="If people in your community ask you who can help with a land record, a NADRA card or an inheritance back home, you can send them to us, and share in the first fee."
      />
      <Section>
        <SectionHeading title="How it works" />
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {how.map((s, i) => (
            <li key={s.title} className="rounded-2xl border bg-card p-6">
              <span className="font-mono text-sm text-highlight">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">
          Referral share: 10 to 15% of the client&apos;s first purchase. <Todo>TODO: assumption, rate to be confirmed before launch</Todo>
        </p>
        <ul className="mt-6 grid gap-2 text-sm text-muted-foreground">
          {rules.map((r) => (
            <li key={r}>- {r}</li>
          ))}
        </ul>
      </Section>
      <Container className="max-w-3xl pb-16">
        <h2 className="mb-6 font-display text-2xl text-primary">Apply</h2>
        <PartnerApplicationForm mode="ambassador" />
      </Container>
    </>
  );
}
