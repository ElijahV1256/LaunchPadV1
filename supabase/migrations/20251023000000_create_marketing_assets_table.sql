/*
  # Create Marketing Assets Table

  1. New Tables
    - `marketing_assets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `idea_key` (text) - reference to the business idea
      - `flyers` (jsonb) - array of generated flyer designs
      - `social_posts` (jsonb) - Instagram posts with captions and hashtags
      - `message_templates` (jsonb) - SMS, email, and DM templates
      - `ad_strategy` (jsonb) - AI-generated advertising strategy
      - `completed_steps` (text array) - tracks which sections are complete
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `marketing_assets` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS marketing_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  flyers jsonb DEFAULT '[]'::jsonb,
  social_posts jsonb DEFAULT '[]'::jsonb,
  message_templates jsonb DEFAULT '[]'::jsonb,
  ad_strategy jsonb DEFAULT NULL,
  completed_steps text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own marketing assets"
  ON marketing_assets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing assets"
  ON marketing_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing assets"
  ON marketing_assets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketing assets"
  ON marketing_assets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_marketing_assets_user_id ON marketing_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_assets_idea_key ON marketing_assets(idea_key);
