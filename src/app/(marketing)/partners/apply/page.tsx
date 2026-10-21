import type { Metadata } from "next";

import { PartnerApplicationForm } from "@/components/marketing/partners/application-form";
import { Container, PageHeader } from "@/components/marketing/primitives";

export const metadata: Metadata = {
  title: "Apply as a provider",
  description: "Apply to join Rasta's network of independent advocates, errand runners and accountants in Pakistan.",
  alternates: { canonical: "/partners/apply" },
};

export default function ApplyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Work with us"
        title="Apply as a provider"
        lede="Tell us what you do, which offices you know and where you work. We review every application and reply on WhatsApp."
      />
      <Container className="max-w-3xl py-12 sm:py-16">
        <PartnerApplicationForm />
      </Container>
    </>
  );
}
