-- Migration: Add activity_scores table
-- Created: 2025-12-01

CREATE TABLE IF NOT EXISTS "activity_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"activity_type" text NOT NULL,
	"score" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'activity_scores_user_id_user_id_fk'
    ) THEN
        ALTER TABLE "activity_scores" 
        ADD CONSTRAINT "activity_scores_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") 
        ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_scores_user_id ON activity_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_scores_activity_type ON activity_scores(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_scores_user_activity ON activity_scores(user_id, activity_type);
