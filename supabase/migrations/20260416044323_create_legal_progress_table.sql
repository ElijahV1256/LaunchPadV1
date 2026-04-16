/*
  # Create Legal Foundation Progress Table

  1. New Tables
    - `legal_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `completed_steps` (text array, tracks which steps the user has completed)
      - `current_step` (text, the step the user is currently on)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `legal_progress` table
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Index on `user_id` for fast lookups
*/

CREATE TABLE IF NOT EXISTS legal_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_steps text[] DEFAULT '{}',
  current_step text DEFAULT 'structure',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT legal_progress_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_legal_progress_user_id ON legal_progress(user_id);

ALTER TABLE legal_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own legal progress"
  ON legal_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legal progress"
  ON legal_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own legal progress"
  ON legal_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
