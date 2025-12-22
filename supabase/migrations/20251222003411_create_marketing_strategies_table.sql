/*
  # Create Marketing Strategies Table

  1. New Tables
    - `marketing_strategies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `website_id` (uuid, references managed_websites)
      - `business_name` (text)
      - `overview` (jsonb) - Executive summary and key objectives
      - `target_audience` (jsonb) - Detailed audience analysis
      - `unique_selling_points` (jsonb) - USPs and competitive advantages
      - `marketing_channels` (jsonb) - Recommended channels with strategies
      - `content_strategy` (jsonb) - Content ideas and calendar
      - `launch_plan` (jsonb) - 30/60/90 day action plan
      - `metrics` (jsonb) - KPIs and success metrics
      - `budget_recommendations` (jsonb) - Suggested budget allocation
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `marketing_strategies` table
    - Add policies for authenticated users to manage their own strategies
*/

CREATE TABLE IF NOT EXISTS marketing_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  website_id uuid REFERENCES managed_websites(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  overview jsonb DEFAULT '{}'::jsonb,
  target_audience jsonb DEFAULT '{}'::jsonb,
  unique_selling_points jsonb DEFAULT '{}'::jsonb,
  marketing_channels jsonb DEFAULT '{}'::jsonb,
  content_strategy jsonb DEFAULT '{}'::jsonb,
  launch_plan jsonb DEFAULT '{}'::jsonb,
  metrics jsonb DEFAULT '{}'::jsonb,
  budget_recommendations jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own marketing strategies"
  ON marketing_strategies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing strategies"
  ON marketing_strategies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing strategies"
  ON marketing_strategies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketing strategies"
  ON marketing_strategies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_marketing_strategies_user_id ON marketing_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_website_id ON marketing_strategies(website_id);
