/*
  # Create saved_ideas table

  1. New Tables
    - `saved_ideas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `idea_data` (jsonb) - stores the complete business idea object
      - `original_idea_id` (text) - reference to the original generated idea
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `saved_ideas` table
    - Add policy for users to read their own saved ideas
    - Add policy for users to insert their own saved ideas
    - Add policy for users to update their own saved ideas
    - Add policy for users to delete their own saved ideas

  3. Indexes
    - Add index on user_id for faster queries
    - Add unique constraint on user_id + original_idea_id to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS saved_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_data jsonb NOT NULL,
  original_idea_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, original_idea_id)
);

ALTER TABLE saved_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved ideas"
  ON saved_ideas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved ideas"
  ON saved_ideas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved ideas"
  ON saved_ideas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved ideas"
  ON saved_ideas
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS saved_ideas_user_id_idx ON saved_ideas(user_id);
CREATE INDEX IF NOT EXISTS saved_ideas_created_at_idx ON saved_ideas(created_at DESC);