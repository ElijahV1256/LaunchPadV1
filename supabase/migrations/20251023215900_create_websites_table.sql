/*
  # Create Websites Table

  1. New Tables
    - `websites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `idea_key` (text) - Links to business idea
      - `copy` (jsonb) - Website copy content
      - `theme` (jsonb) - Theme and colors
      - `design_preferences` (jsonb) - User's design preferences
      - `subdomain` (text) - Subdomain for the website
      - `payment_link` (text) - Payment/booking link
      - `published_url` (text) - Final published URL
      - `completed_steps` (text[]) - Tracks progress
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on websites table
    - Add policies for authenticated users to read/write own data
*/

CREATE TABLE IF NOT EXISTS websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_key text NOT NULL,
  copy jsonb DEFAULT NULL,
  theme jsonb DEFAULT NULL,
  design_preferences jsonb DEFAULT NULL,
  subdomain text DEFAULT NULL,
  payment_link text DEFAULT NULL,
  published_url text DEFAULT NULL,
  completed_steps text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, idea_key)
);

ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own websites"
  ON websites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own websites"
  ON websites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own websites"
  ON websites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own websites"
  ON websites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
