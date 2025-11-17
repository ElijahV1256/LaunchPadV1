/*
  # Create First Revenue Table

  1. New Tables
    - `first_revenue`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `idea_key` (text, identifies the business idea)
      - `title` (text, title of the first revenue plan)
      - `subtitle` (text, motivational subtitle)
      - `steps` (jsonb, array of step objects with label and example)
      - `completed` (text[], array of completed step labels)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `first_revenue` table
    - Add policies for authenticated users to manage their own rows

  3. Notes
    - Users can have multiple first revenue plans for different ideas
    - Completed steps are tracked by their label text
*/

-- Create first_revenue table
CREATE TABLE IF NOT EXISTS first_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  title text DEFAULT '',
  subtitle text DEFAULT '',
  steps jsonb DEFAULT '[]'::jsonb NOT NULL,
  completed text[] DEFAULT ARRAY[]::text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE first_revenue ENABLE ROW LEVEL SECURITY;

-- Policies for first_revenue
CREATE POLICY "Users can view own first revenue plans"
  ON first_revenue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own first revenue plans"
  ON first_revenue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own first revenue plans"
  ON first_revenue FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own first revenue plans"
  ON first_revenue FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_first_revenue_user_id ON first_revenue(user_id);
CREATE INDEX IF NOT EXISTS idx_first_revenue_idea_key ON first_revenue(idea_key);
CREATE INDEX IF NOT EXISTS idx_first_revenue_user_idea ON first_revenue(user_id, idea_key);