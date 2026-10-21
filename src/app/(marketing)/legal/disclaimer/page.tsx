import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/marketing/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `${site.name} is not a law firm. What our information is, what it is not, and how legal advice is given.`,
  alternates: { canonical: "/legal/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      lede="What our information is, what it is not, and who gives legal advice."
      updated="21 October 2026"
    >
      <p className="rounded-xl bg-secondary p-5 font-medium text-secondary-foreground">{site.disclaimer}</p>

      <h2>We are not a law firm</h2>
      <p>
        {site.name} is a navigation and case-management service. We are not advocates, solicitors or
        attorneys, and we do not give legal opinions in our own name. Nothing on this website, in our
        guides, in a Pathway Memo, on a call or in a message creates an advocate-client relationship with{" "}
        {site.name}.
      </p>

      <h2>General information, not legal advice</h2>
      <p>
        Our guides, answers and memos explain processes, offices, documents, typical timelines and typical
        costs in general terms. They are not a substitute for advice from a qualified advocate on your
        specific facts. Laws, fees and procedures in Pakistan change, sometimes without notice, and differ
        between provinces and offices.
      </p>

      <h2>Independent advocates</h2>
      <p>
        When you need legal advice, drafting of a legal document or representation in court, we introduce you
        to an independent advocate. You retain the advocate directly, under an engagement letter between you
        and them. The advocate is responsible for their advice and bills you directly. We do not share in
        advocate fees.
      </p>

      <h2>No promises about outcomes</h2>
      <p>
        Courts, government offices and other parties decide outcomes and timelines. We do not and cannot
        promise a result, a date or a shortcut. We follow the official process only and do not offer
        influence of any kind.
      </p>

      <h2>Links to other websites</h2>
      <p>
        We link to official portals and to news and research sources so you can check facts yourself. We do
        not control those websites and are not responsible for their content.
      </p>

      <h2>Questions</h2>
      <p>
        If anything here is unclear, <Link href={site.cta.href}>contact us through the intake form</Link>{" "}
        before you rely on our information.
      </p>
    </LegalPage>
  );
}
