import { LockIcon, MessageCircleIcon, ReceiptTextIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import {
  cleanReferralCode,
  cleanSource,
  isCaseCategory,
} from "@/components/marketing/intake/schema";
import { IntakeForm } from "@/components/marketing/intake/intake-form";
import { Container, Eyebrow } from "@/components/marketing/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/pricing";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start a case",
  description:
    "Tell us what is happening with your property, inheritance, tax or paperwork in Pakistan. Free to send. We reply on WhatsApp with the smallest step that answers your question, and its price.",
  alternates: { canonical: "/start" },
};

const reassurance = [
  {
    icon: ReceiptTextIcon,
    title: "Free to send",
    body: `Nothing to pay until you choose a step. The smallest step is ${formatPrice("question")}.`,
  },
  {
    icon: MessageCircleIcon,
    title: "We reply on WhatsApp",
    body: "A case manager reads your message and replies, usually the same working day.",
  },
  {
    icon: LockIcon,
    title: "Private",
    body: "We talk only to you about your case. Do not send documents yet; we will ask for what we need.",
  },
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function IntakeFormWithParams({ searchParams }: { searchParams: PageProps<"/start">["searchParams"] }) {
  const params = await searchParams;
  const category = first(params.category);
  const referral = cleanReferralCode(first(params.ref));
  return (
    <IntakeForm
      defaultCategory={isCaseCategory(category) ? category : undefined}
      defaultReferral={referral || undefined}
      source={cleanSource(first(params.src))}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function StartPage({ searchParams }: PageProps<"/start">) {
  return (
    <div className="bg-card">
      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:py-20">
        <div className="min-w-0">
          <Eyebrow>Start a case</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-balance text-primary sm:text-5xl">
            Tell us what is happening.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            About five minutes. Plain words are fine, in English or Urdu. We will tell you which office
            owns the problem and the smallest step that helps.
          </p>
          <div className="mt-10">
            <Suspense fallback={<FormSkeleton />}>
              <IntakeFormWithParams searchParams={searchParams} />
            </Suspense>
          </div>
        </div>

        <aside aria-label="About this form" className="lg:pt-24">
          <div className="space-y-6 lg:sticky lg:top-24">
            <ul className="space-y-5 rounded-2xl border bg-background p-6">
              {reassurance.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="rounded-2xl border border-dashed p-6 text-xs leading-relaxed text-muted-foreground">
              {site.disclaimer}
            </p>
          </div>
        </aside>
      </Container>
    </div>
  );
}
