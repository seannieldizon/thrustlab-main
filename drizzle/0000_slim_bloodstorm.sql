CREATE TABLE "modules" (
	"module_no" serial PRIMARY KEY NOT NULL,
	"module_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"question_id" serial PRIMARY KEY NOT NULL,
	"module_no" integer,
	"question_text" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_answer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"test_id" integer,
	"question_text" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_answer" text NOT NULL,
	"user_answer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"test_id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"test_date" timestamp DEFAULT now() NOT NULL,
	"module_no" integer NOT NULL,
	"module_name" text NOT NULL,
	"total_questions" integer NOT NULL,
	"questions_correct" integer NOT NULL,
	"questions_incorrect" integer NOT NULL,
	"marks" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text,
	"full_name" text
);
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_module_no_modules_module_no_fk" FOREIGN KEY ("module_no") REFERENCES "public"."modules"("module_no") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_test_id_tests_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("test_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;