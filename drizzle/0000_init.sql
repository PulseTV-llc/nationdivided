CREATE TYPE "public"."admin_role" AS ENUM('admin', 'reviewer');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('new', 'under_review', 'contacted', 'interview_scheduled', 'selected', 'not_selected');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "admin_role" DEFAULT 'reviewer' NOT NULL,
	"password_hash" text NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"target_id" text,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "casting_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"full_name" text NOT NULL,
	"preferred_name" text,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"is_adult" boolean NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"voted_trump_2024" text NOT NULL,
	"feeling" text NOT NULL,
	"feeling_detail" text,
	"issues" jsonb NOT NULL,
	"issues_other" text,
	"hoped_change" text NOT NULL,
	"views_evolved" text,
	"about_you" text NOT NULL,
	"normal_day" text NOT NULL,
	"why_document" text NOT NULL,
	"life_changes" text,
	"comfortable_on_camera" text NOT NULL,
	"open_to_introductions" text NOT NULL,
	"video_key" text,
	"video_content_type" text,
	"video_size" bigint,
	"video_file_name" text,
	"consented_at" timestamp with time zone NOT NULL,
	"consent_version" text NOT NULL,
	"confirmation_email_sent" boolean DEFAULT false NOT NULL,
	CONSTRAINT "casting_applications_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "casting_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"author_id" uuid,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "press_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"outlet" text NOT NULL,
	"email" text NOT NULL,
	"kind" text NOT NULL,
	"deadline" text,
	"message" text NOT NULL,
	"handled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text NOT NULL,
	"window_start" bigint NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_admin_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting_notes" ADD CONSTRAINT "casting_notes_application_id_casting_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."casting_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting_notes" ADD CONSTRAINT "casting_notes_author_id_admin_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_sessions_user_idx" ON "admin_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "casting_status_idx" ON "casting_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "casting_created_idx" ON "casting_applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "casting_email_idx" ON "casting_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "casting_notes_app_idx" ON "casting_notes" USING btree ("application_id");