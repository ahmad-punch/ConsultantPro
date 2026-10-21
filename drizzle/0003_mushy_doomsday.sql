ALTER TABLE "cases" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "location_city" text;--> statement-breakpoint
ALTER TABLE "partner_engagements" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "partner_engagements" ADD COLUMN "location_city" text;--> statement-breakpoint
ALTER TABLE "partner_engagements" ADD COLUMN "batch_key" text;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "departments" text;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "service_areas" text;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "availability_note" text;