import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/marketing/legal-page";
import { Todo } from "@/components/marketing/primitives";
import { isPlaceholder, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `The plain terms for using ${site.name}: what we provide, prices and payment, refunds, advocates, and limits.`,
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      lede="The plain terms that apply when you use this website or buy a service from us."
      updated="21 October 2026"
    >
      <h2>Who you are dealing with</h2>
      <p>
        These terms are between you and{" "}
        {isPlaceholder(site.legalEntity) ? <Todo>{site.legalEntity}</Todo> : site.legalEntity}
      </p>

      <h2>What we provide</h2>
      <p>
        We provide general information, case management, written Pathway Memos and errands for people dealing
        with matters in Pakistan. We are not a law firm and do not give legal advice. See our{" "}
        <Link href="/legal/disclaimer">disclaimer</Link>.
      </p>

      <h2>Prices and payment</h2>
      <ul>
        <li>Our prices are published on the <Link href="/pricing">pricing page</Link>. Ranged prices are quoted in writing before work starts.</li>
        <li>You pay for one stage at a time. You never prepay more than the next stage.</li>
        <li>Advocate fees are agreed between you and the advocate and paid to them directly.</li>
        <li>Government, court and stamp fees are charged at cost, with the official receipt.</li>
        <li>We never ask for cash or for payment to a personal account.</li>
      </ul>

      <h2>Advocates and other partners</h2>
      <p>
        Advocates are independent. You retain them directly and they are responsible for their own advice and
        work. Errand runners act on our instructions for the errand you have paid for.
      </p>

      <h2>Your part</h2>
      <ul>
        <li>Give us accurate information and tell us when something changes.</li>
        <li>Share the documents we need, and only documents you have the right to share.</li>
        <li>Do not ask us to do anything outside the official process.</li>
      </ul>

      <h2>Refunds</h2>
      <p>
        If we do not deliver your Pathway Memo within the stated time, you get a full refund of the Case
        Assessment fee. If you cancel before we start a stage, we refund that stage. We do not refund based on
        what a court, office or another party decides. Government fees already paid to an office usually cannot
        be recovered. <Todo>TODO: confirm refund wording with counsel</Todo>
      </p>

      <h2>Limits</h2>
      <p>
        We do our work with reasonable care and skill. We are not responsible for decisions or delays of
        courts, government offices or other parties, or for the advice of independent advocates. Nothing in
        these terms limits rights you have by law that cannot be limited.{" "}
        <Todo>TODO: liability cap and governing law, per the chosen entity</Todo>
      </p>

      <h2>Ending the service</h2>
      <p>
        You can stop at the end of any stage. A monthly plan can be cancelled before the next billing date. We
        may decline or stop a case if we are asked to act outside the official process or if continuing would
        be unlawful.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The version that applies is the one in force when you buy a stage.
      </p>
    </LegalPage>
  );
}
