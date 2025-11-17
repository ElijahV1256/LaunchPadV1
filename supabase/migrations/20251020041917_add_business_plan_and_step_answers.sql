/*
  # Add Business Plan and Step Answers Support

  1. New Tables
    - `business_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `idea_id` (text, links to business idea)
      - `plan_name` (text, AI-generated business plan name)
      - `plan_data` (jsonb, stores complete business plan based on Donald Miller's framework)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to existing tables
    - Add `step_answers` column to `roadmaps` table to store user responses for each step
    - `step_answers` (jsonb, maps step IDs to user answers)

  3. Security
    - Enable RLS on `business_plans` table
    - Add policies for authenticated users to manage their own business plans
*/

-- Add step_answers column to roadmaps table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roadmaps' AND column_name = 'step_answers'
  ) THEN
    ALTER TABLE roadmaps ADD COLUMN step_answers jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create business_plans table
CREATE TABLE IF NOT EXISTS business_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id text NOT NULL,
  plan_name text DEFAULT '',
  plan_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_plans ENABLE ROW LEVEL SECURITY;

-- Policies for business_plans
CREATE POLICY "Users can view own business plans"
  ON business_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business plans"
  ON business_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business plans"
  ON business_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own business plans"
  ON business_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_plans_user_id ON business_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_business_plans_idea_id ON business_plans(idea_id);