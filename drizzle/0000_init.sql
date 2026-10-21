CREATE TYPE "public"."case_category" AS ENUM('property', 'inheritance', 'police_fir', 'tax_fbr', 'nadra', 'attestation', 'company_secp', 'court', 'errand', 'other');--> statement-breakpoint
CREATE TYPE "public"."case_stage" AS ENUM('intake', 'triage', 'memo_drafting', 'memo_delivered', 'managed', 'errand_in_progress', 'closed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."channel_platform" AS ENUM('whatsapp', 'facebook', 'association', 'community_centre', 'linkedin', 'youtube', 'other');--> statement-breakpoint
CREATE TYPE "public"."channel_status" AS ENUM('identified', 'contacted', 'joined', 'posted', 'paused');--> statement-breakpoint
CREATE TYPE "public"."content_format" AS ENUM('post', 'script', 'guide', 'video', 'email');--> statement-breakpoint
CREATE TYPE "public"."content_language" AS ENUM('en', 'ur', 'both');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('idea', 'drafted', 'approved', 'posted');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'converted', 'lost');--> statement-breakpoint
CREATE TYPE "public"."lead_urgency" AS ENUM('low', 'normal', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."partner_type" AS ENUM('advocate', 'errand_runner', 'adviser', 'accountant');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('stripe', 'wise', 'payoneer', 'bank', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product" AS ENUM('question', 'call', 'assessment', 'managed', 'errand', 'retainer');--> statement-breakpoint
CREATE TYPE "public"."retainer_status" AS ENUM('active', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."retainer_tier" AS ENUM('watch', 'plus', 'family_office');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM('founder', 'case_manager', 'ops');--> statement-breakpoint
CREATE TABLE "ambassadors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"city" text,
	"whatsapp" text,
	"referral_code" text NOT NULL,
	"commission_pct" integer DEFAULT 10 NOT NULL,
	"total_paid_usd" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" text NOT NULL,
	"client_id" uuid NOT NULL,
	"category" "case_category" NOT NULL,
	"product" "product" NOT NULL,
	"stage" "case_stage" DEFAULT 'intake' NOT NULL,
	"price_usd" integer DEFAULT 0 NOT NULL,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"payment_link" text,
	"case_manager_id" uuid,
	"partner_id" uuid,
	"drive_folder_url" text,
	"memo_doc_url" text,
	"memo_delivered_at" timestamp with time zone,
	"summary" text NOT NULL,
	"next_action" text,
	"next_action_due" timestamp with time zone,
	"nps" integer,
	"would_recommend" boolean,
	"ambassador_id" uuid,
	"referred_by_case_id" uuid,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"platform" "channel_platform" NOT NULL,
	"country" text,
	"member_count" integer,
	"admin_contact" text,
	"status" "channel_status" DEFAULT 'identified' NOT NULL,
	"last_posted_at" timestamp with time zone,
	"cadence_days" integer,
	"ambassador_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text,
	"email" text,
	"country" text,
	"city" text,
	"ambassador_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"format" "content_format" NOT NULL,
	"language" "content_language" DEFAULT 'en' NOT NULL,
	"target_platform" text,
	"status" "content_status" DEFAULT 'idea' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"posted_at" timestamp with time zone,
	"url" text,
	"body" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"email" text,
	"country" text NOT NULL,
	"category" "case_category" NOT NULL,
	"urgency" "lead_urgency" DEFAULT 'normal' NOT NULL,
	"description" text NOT NULL,
	"referral_code" text,
	"source" text DEFAULT 'website' NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"converted_case_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "partner_type" NOT NULL,
	"city" text,
	"whatsapp" text,
	"email" text,
	"own_letterhead" boolean DEFAULT false NOT NULL,
	"fee_terms" text,
	"sla_days" integer,
	"rating" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid,
	"retainer_id" uuid,
	"amount_usd" integer NOT NULL,
	"method" "payment_method" DEFAULT 'stripe' NOT NULL,
	"status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"reference" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retainers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"tier" "retainer_tier" NOT NULL,
	"monthly_usd" integer NOT NULL,
	"status" "retainer_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" "team_role" DEFAULT 'case_manager' NOT NULL,
	"email" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_case_manager_id_team_members_id_fk" FOREIGN KEY ("case_manager_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_ambassador_id_ambassadors_id_fk" FOREIGN KEY ("ambassador_id") REFERENCES "public"."ambassadors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_referred_by_case_id_cases_id_fk" FOREIGN KEY ("referred_by_case_id") REFERENCES "public"."cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_ambassador_id_ambassadors_id_fk" FOREIGN KEY ("ambassador_id") REFERENCES "public"."ambassadors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_ambassador_id_ambassadors_id_fk" FOREIGN KEY ("ambassador_id") REFERENCES "public"."ambassadors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_case_id_cases_id_fk" FOREIGN KEY ("converted_case_id") REFERENCES "public"."cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_retainer_id_retainers_id_fk" FOREIGN KEY ("retainer_id") REFERENCES "public"."retainers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retainers" ADD CONSTRAINT "retainers_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ambassadors_referral_code_idx" ON "ambassadors" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "case_notes_case_id_idx" ON "case_notes" USING btree ("case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cases_case_number_idx" ON "cases" USING btree ("case_number");--> statement-breakpoint
CREATE INDEX "cases_client_id_idx" ON "cases" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "cases_case_manager_id_idx" ON "cases" USING btree ("case_manager_id");--> statement-breakpoint
CREATE INDEX "cases_partner_id_idx" ON "cases" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "cases_ambassador_id_idx" ON "cases" USING btree ("ambassador_id");--> statement-breakpoint
CREATE INDEX "cases_referred_by_case_id_idx" ON "cases" USING btree ("referred_by_case_id");--> statement-breakpoint
CREATE INDEX "cases_stage_idx" ON "cases" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "channels_ambassador_id_idx" ON "channels" USING btree ("ambassador_id");--> statement-breakpoint
CREATE INDEX "clients_ambassador_id_idx" ON "clients" USING btree ("ambassador_id");--> statement-breakpoint
CREATE INDEX "leads_converted_case_id_idx" ON "leads" USING btree ("converted_case_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_case_id_idx" ON "payments" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "payments_retainer_id_idx" ON "payments" USING btree ("retainer_id");--> statement-breakpoint
CREATE INDEX "retainers_client_id_idx" ON "retainers" USING btree ("client_id");