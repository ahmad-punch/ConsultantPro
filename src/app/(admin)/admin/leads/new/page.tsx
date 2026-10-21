import { LeadForm } from "@/components/admin/forms/lead-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "New lead" };

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New lead"
        description="Log an enquiry that came in by WhatsApp, phone or in person. Website enquiries are added automatically."
      />
      <Card>
        <CardContent>
          <LeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
