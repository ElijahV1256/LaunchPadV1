/*
  # Create Marketing Playbook Table

  1. New Tables
    - `marketing_playbook`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `business_name` (text)
      - `platform` (text) - one of: instagram, meta_ads, tiktok, mass_text, email
      - `strategy` (jsonb) - AI-generated strategy data
      - `content` (jsonb) - AI-generated content pieces
      - `generated_at` (timestamptz)
      - Unique constraint on (user_id, platform)

  2. Security
    - Enable RLS on `marketing_playbook` table
    - Separate policies for select, insert, update, delete
    - All policies restricted to authenticated users managing their own data
*/

CREATE TABLE IF NOT EXISTS marketing_playbook (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL DEFAULT '',
  platform text NOT NULL,
  strategy jsonb,
  content jsonb,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE marketing_playbook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playbook entries"
  ON marketing_playbook FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playbook entries"
  ON marketing_playbook FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playbook entries"
  ON marketing_playbook FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playbook entries"
  ON marketing_playbook FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_marketing_playbook_user_id ON marketing_playbook(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_playbook_user_platform ON marketing_playbook(user_id, platform);
