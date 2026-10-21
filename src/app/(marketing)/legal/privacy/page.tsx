import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/marketing/legal-page";
import { Todo } from "@/components/marketing/primitives";
import { isPlaceholder, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: `How ${site.name} collects, uses, stores and shares your information, and how documents stay in your own Google Drive.`,
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy notice"
      lede="What we collect, why, where it is kept, who sees it, and your choices."
      updated="21 October 2026"
    >
      <h2>Who we are</h2>
      <p>
        {site.name} is the data controller for information you give us through this website and our
        messaging channels. Legal entity:{" "}
        {isPlaceholder(site.legalEntity) ? <Todo>{site.legalEntity}</Todo> : site.legalEntity}
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>What you send in the intake form: your name, WhatsApp number, email (optional), country, the kind of problem, how urgent it is, your description, and any referral code.</li>
        <li>Messages you send us on WhatsApp or by email, and notes of our calls with you.</li>
        <li>Links to documents you choose to share with us in Google Drive.</li>
        <li>Payment records: amount, date, method and reference. Card details are handled by the payment provider, not by us.</li>
        <li>Basic, privacy-friendly website analytics (pages viewed, approximate country). No advertising cookies.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To understand your case, reply to you and recommend a next step.</li>
        <li>To deliver what you buy: answers, memos, managed cases and errands.</li>
        <li>To keep accounts and meet legal obligations.</li>
        <li>To pay a referral fee to a community ambassador if you used their code.</li>
      </ul>
      <p>We do not sell your information and we do not use it for advertising.</p>

      <h2>Your documents</h2>
      <p>
        Documents stay in a Google Drive folder that you own, or one we create and share with you. Our case
        tracker stores the link to that folder, not the files. We share a document with an advocate or errand
        runner only when you agree. We do not keep your originals.
      </p>

      <h2>Who we share it with</h2>
      <ul>
        <li>The independent advocate, errand runner or tax practitioner working on your case, with your agreement, and only what they need.</li>
        <li>Service providers who run our systems (hosting, database, payments, messaging), under their own security terms.</li>
        <li>Authorities, only where the law requires it.</li>
      </ul>
      <p>We never discuss your case in groups or with your relatives unless you ask us to.</p>

      <h2>How long we keep it</h2>
      <p>
        We keep case records for as long as needed to deliver the service and meet accounting and legal
        obligations, then delete or anonymise them. <Todo>TODO: confirm retention periods with counsel</Todo>
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask for a copy of your information, ask us to correct it, or ask us to delete it where we are
        not required to keep it. You can stop sharing a Drive folder with us at any time.{" "}
        <Link href={site.cta.href}>Contact us</Link> to make a request.
      </p>

      <h2>Security</h2>
      <p>
        Pakistan does not yet have a comprehensive data protection law, so we set our own standard: access
        limited to the people working on your case, and documents kept in your own storage rather than ours.
      </p>
    </LegalPage>
  );
}
