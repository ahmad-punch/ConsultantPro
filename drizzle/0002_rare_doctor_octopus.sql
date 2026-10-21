CREATE TYPE "public"."application_status" AS ENUM('new', 'reviewing', 'interview', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."application_type" AS ENUM('advocate', 'errand_runner', 'accountant', 'ambassador');--> statement-breakpoint
CREATE TYPE "public"."engagement_status" AS ENUM('proposed', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."onboarding_stage" AS ENUM('applied', 'agreement_sent', 'agreement_signed', 'trial_case', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."partner_tier" AS ENUM('probation', 'bronze', 'silver', 'gold');--> statement-breakpoint
CREATE TABLE "partner_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "application_type" NOT NULL,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"whatsapp" text NOT NULL,
	"country" text DEFAULT 'Pakistan' NOT NULL,
	"city" text,
	"bar_council_number" text,
	"years_experience" integer,
	"specialties" text,
	"languages" text,
	"bio" text,
	"channel_or_network" text,
	"source" text DEFAULT 'website' NOT NULL,
	"accepted_terms_at" timestamp with time zone,
	"notes" text,
	"reviewed_at" timestamp with time zone,
	"converted_partner_id" uuid,
	"converted_ambassador_id" uuid,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_engagements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"case_id" uuid NOT NULL,
	"role" text DEFAULT 'advocate' NOT NULL,
	"status" "engagement_status" DEFAULT 'proposed' NOT NULL,
	"agreed_fee_usd" integer DEFAULT 0 NOT NULL,
	"fee_billed_by" text DEFAULT 'partner' NOT NULL,
	"sla_days" integer,
	"due_at" timestamp with time zone,
	"no_poaching_acknowledged_at" timestamp with time zone,
	"rating" integer,
	"rating_note" text,
	"started_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "tier" "partner_tier" DEFAULT 'probation' NOT NULL;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "onboarding_stage" "onboarding_stage" DEFAULT 'applied' NOT NULL;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "bar_council_number" text;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "specialties" text;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "languages" text;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "agreement_version" text;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "agreement_signed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "no_poaching_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "cases_completed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "avg_rating" integer;--> statement-breakpoint
ALTER TABLE "partner_applications" ADD CONSTRAINT "partner_applications_converted_partner_id_partners_id_fk" FOREIGN KEY ("converted_partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_applications" ADD CONSTRAINT "partner_applications_converted_ambassador_id_ambassadors_id_fk" FOREIGN KEY ("converted_ambassador_id") REFERENCES "public"."ambassadors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_engagements" ADD CONSTRAINT "partner_engagements_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_engagements" ADD CONSTRAINT "partner_engagements_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_applications_status_idx" ON "partner_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "partner_engagements_partner_id_idx" ON "partner_engagements" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_engagements_case_id_idx" ON "partner_engagements" USING btree ("case_id");