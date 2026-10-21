import { InfoIcon, LandmarkIcon, ScaleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/cta-band";
import { paymentFaqs } from "@/components/marketing/data/faqs";
import { FaqList } from "@/components/marketing/faq-list";
import { OfferingCard } from "@/components/marketing/offering-card";
import { PageHeader, Section, SectionHeading } from "@/components/marketing/primitives";
import { PayButton } from "@/components/marketing/pay-button";
import { formatPrice, products, retainerTiers } from "@/lib/pricing";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Published, fixed prices for overseas Pakistanis. Written answers from ${formatPrice("question")}, a full Pathway Memo for ${formatPrice("assessment")}, managed cases, errands and monthly Family Affairs plans.`,
  alternates: { canonical: "/pricing" },
};

const notes = [
  {
    icon: ScaleIcon,
    title: "Advocate fees are billed directly",
    body: "When you need legal advice or a court appearance, you retain an independent advocate. You agree the fee with them and pay them yourself. We take no share of it.",
  },
  {
    icon: LandmarkIcon,
    title: "Government fees at cost",
    body: "Government, court and stamp fees are passed on at cost with the official receipt. We add nothing on top.",
  },
  {
    icon: InfoIcon,
    title: "One stage at a time",
    body: "You never prepay more than the next stage. Ranged prices are quoted in writing before work starts.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Fixed prices, published before you ask."
        lede="Start with one written answer, or hand us the whole case. Every price on this page is our full fee for that step."
      />

      <Section aria-labelledby="one-off-title">
        <SectionHeading
          id="one-off-title"
          eyebrow="One-off help"
          title="Pay for the step you need."
          lede="Most people start with a Pathway Question or a Pathway Call. If the case needs a full plan, the Case Assessment gives you a written Pathway Memo."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {products.map((product, i) => (
            <div key={product.id} className={i < 3 ? "lg:col-span-2" : i === 4 ? "md:col-span-2 lg:col-span-3" : "lg:col-span-3"}>
              <OfferingCard
                offering={product}
                featured={product.id === "assessment"}
                badge={product.id === "assessment" ? "Includes the Pathway Memo" : undefined}
              />
            </div>
          ))}
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {notes.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-xl border border-dashed p-6">
              <Icon className="size-5 text-highlight" aria-hidden="true" />
              <h3 className="mt-4 font-medium text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted" id="retainers" className="scroll-mt-16" aria-labelledby="retainer-title">
        <SectionHeading
          id="retainer-title"
          eyebrow="Family Affairs retainer"
          title="Ongoing cover for your family's affairs in Pakistan."
          lede="A monthly plan for families who want someone keeping an eye on property and paperwork."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {retainerTiers.map((tier) => (
            <OfferingCard
              key={tier.id}
              offering={tier}
              featured={tier.id === "plus"}
              badge={tier.id === "plus" ? "Adds a call and an errand" : undefined}
            />
          ))}
        </div>

        <div className="mt-16">
          <h3 className="font-display text-2xl font-medium text-primary">Compare the plans</h3>
          <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Family Affairs retainer plans compared</caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="w-40 p-5 font-medium text-muted-foreground">
                    Plan
                  </th>
                  {retainerTiers.map((tier) => (
                    <th key={tier.id} scope="col" className="p-5 align-bottom">
                      <span className="block font-display text-xl font-medium text-primary">{tier.name}</span>
                      <span className="mt-1 block font-display text-lg font-medium text-foreground">
                        {formatPrice(tier)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y align-top">
                <tr>
                  <th scope="row" className="p-5 font-medium text-muted-foreground">
                    Best for
                  </th>
                  {retainerTiers.map((tier) => (
                    <td key={tier.id} className="p-5 leading-relaxed">
                      {tier.summary}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-5 font-medium text-muted-foreground">
                    Response
                  </th>
                  {retainerTiers.map((tier) => (
                    <td key={tier.id} className="p-5 leading-relaxed">
                      {tier.turnaround}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-5 font-medium text-muted-foreground">
                    Included
                  </th>
                  {retainerTiers.map((tier) => (
                    <td key={tier.id} className="p-5">
                      <ul className="list-disc space-y-1.5 pl-4 marker:text-success">
                        {tier.includes.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-5 font-medium text-muted-foreground">
                    Not included
                  </th>
                  {retainerTiers.map((tier) => (
                    <td key={tier.id} className="p-5 text-muted-foreground">
                      {tier.excludes.join(", ")}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5">
                    <span className="sr-only">Sign up</span>
                  </td>
                  {retainerTiers.map((tier) => (
                    <td key={tier.id} className="p-5">
                      <PayButton id={tier.id} name={tier.name} featured={tier.id === "plus"} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section aria-labelledby="payment-faq-title">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionHeading
              id="payment-faq-title"
              eyebrow="Paying from abroad"
              title="Card, Wise or Payoneer. Never cash."
              lede="We never ask for cash or for payment to a personal account. You get a receipt every time."
            />
            <p className="mt-6 text-sm text-muted-foreground">
              More questions?{" "}
              <Link href="/faq" className="font-medium text-primary underline underline-offset-4">
                Read the full FAQ
              </Link>{" "}
              or{" "}
              <Link href={site.cta.href} className="font-medium text-primary underline underline-offset-4">
                ask us through the intake form
              </Link>
              .
            </p>
          </div>
          <FaqList items={paymentFaqs} />
        </div>
      </Section>

      <CtaBand title="Not sure which step you need?" lede="Tell us what is happening. We will recommend the smallest step that answers your question, with its price, before you pay anything." />
    </>
  );
}
