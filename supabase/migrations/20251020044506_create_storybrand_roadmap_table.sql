/*
  # Create StoryBrand Roadmap Table

  1. New Tables
    - `storybrand_roadmap`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `idea_key` (text, identifies the business idea)
      - `title` (text, roadmap title)
      - `subtitle` (text, roadmap subtitle)
      - `stages` (jsonb, array of stage objects with name, goal, and steps)
      - `completed` (text[], array of completed step labels)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `storybrand_roadmap` table
    - Add policies for authenticated users to manage their own rows

  3. Notes
    - Each stage contains name, goal, and steps array
    - Completed steps are tracked by their step text
    - Users can have multiple roadmaps for different ideas
*/

-- Create storybrand_roadmap table
CREATE TABLE IF NOT EXISTS storybrand_roadmap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  title text DEFAULT '',
  subtitle text DEFAULT '',
  stages jsonb DEFAULT '[]'::jsonb NOT NULL,
  completed text[] DEFAULT ARRAY[]::text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE storybrand_roadmap ENABLE ROW LEVEL SECURITY;

-- Policies for storybrand_roadmap
CREATE POLICY "Users can view own storybrand roadmaps"
  ON storybrand_roadmap FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storybrand roadmaps"
  ON storybrand_roadmap FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storybrand roadmaps"
  ON storybrand_roadmap FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own storybrand roadmaps"
  ON storybrand_roadmap FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_storybrand_roadmap_user_id ON storybrand_roadmap(user_id);
CREATE INDEX IF NOT EXISTS idx_storybrand_roadmap_idea_key ON storybrand_roadmap(idea_key);
CREATE INDEX IF NOT EXISTS idx_storybrand_roadmap_user_idea ON storybrand_roadmap(user_id, idea_key);