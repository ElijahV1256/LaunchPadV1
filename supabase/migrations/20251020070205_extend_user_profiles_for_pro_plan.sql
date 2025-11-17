/*
  # Extend User Profiles for Pro Plan

  1. Schema Changes
    - Add `plan` column to existing user_profiles table (text, default 'free')
    - Add `trial_end` column (timestamptz, nullable)
    - Add `credits` column (int, default 0)

  2. New Table
    - Create `local_analyses` table for storing local opportunity analyses

  3. Security
    - Policies already exist for user_profiles
    - Add RLS policies for local_analyses table
*/

-- Add new columns to existing user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'plan'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN plan text NOT NULL DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'trial_end'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN trial_end timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'credits'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN credits int NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create local_analyses table
CREATE TABLE IF NOT EXISTS local_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zip text,
  lat double precision,
  lng double precision,
  radius_miles int NOT NULL,
  result_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE local_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for local_analyses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'local_analyses' AND policyname = 'Users can read own analyses'
  ) THEN
    CREATE POLICY "Users can read own analyses"
      ON local_analyses FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'local_analyses' AND policyname = 'Users can insert own analyses'
  ) THEN
    CREATE POLICY "Users can insert own analyses"
      ON local_analyses FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_local_analyses_user_id ON local_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_local_analyses_created_at ON local_analyses(created_at DESC);
