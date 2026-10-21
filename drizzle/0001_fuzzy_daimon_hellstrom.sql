CREATE TYPE "public"."document_type" AS ENUM('invoice', 'receipt', 'quote', 'engagement_letter', 'case_summary');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'void');--> statement-breakpoint
CREATE TABLE "branding_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legal_name" text DEFAULT '' NOT NULL,
	"trading_name" text DEFAULT '' NOT NULL,
	"address_lines" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"logo_url" text,
	"primary_color" text DEFAULT '#0F3D2E' NOT NULL,
	"accent_color" text DEFAULT '#B5542D' NOT NULL,
	"show_logo" boolean DEFAULT true NOT NULL,
	"footer_text" text DEFAULT '' NOT NULL,
	"tax_label" text DEFAULT '' NOT NULL,
	"tax_number" text DEFAULT '' NOT NULL,
	"bank_details" text DEFAULT '' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "document_type" NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"intro" text DEFAULT '' NOT NULL,
	"terms" text DEFAULT '' NOT NULL,
	"footer" text DEFAULT '' NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "document_type" NOT NULL,
	"document_number" text NOT NULL,
	"case_id" uuid,
	"client_id" uuid,
	"invoice_id" uuid,
	"template_id" uuid,
	"title" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_usd" integer DEFAULT 0 NOT NULL,
	"amount_usd" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"type" "document_type" DEFAULT 'invoice' NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"client_id" uuid,
	"case_id" uuid,
	"retainer_id" uuid,
	"template_id" uuid,
	"issue_date" timestamp with time zone DEFAULT now() NOT NULL,
	"due_date" timestamp with time zone,
	"currency" text DEFAULT 'USD' NOT NULL,
	"subtotal_usd" integer DEFAULT 0 NOT NULL,
	"tax_usd" integer DEFAULT 0 NOT NULL,
	"total_usd" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"payment_id" uuid,
	"sent_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metrics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taken_at" timestamp with time zone DEFAULT now() NOT NULL,
	"range_from" timestamp with time zone,
	"range_to" timestamp with time zone,
	"values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"note" text
);
--> statement-breakpoint
ALTER TABLE "ambassadors" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "public_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "details" jsonb;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_template_id_document_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."document_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_retainer_id_retainers_id_fk" FOREIGN KEY ("retainer_id") REFERENCES "public"."retainers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_template_id_document_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."document_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_templates_type_idx" ON "document_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "generated_documents_case_id_idx" ON "generated_documents" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_idx" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_client_id_idx" ON "invoices" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "invoices_case_id_idx" ON "invoices" USING btree ("case_id");