/*
  # Create Launch Phases Tables

  1. New Tables
    - `brand_identity`
      - Stores business names, logo data, domain suggestions
      - Links to user_id and idea_key
      - Tracks completion status for Phase 2
    
    - `marketing_assets`
      - Stores flyers, social posts, message templates, ad strategies
      - Links to user_id and idea_key
      - Tracks completion status for Phase 3
    
    - `operations_tracking`
      - Stores P&L entries, goals, reminders
      - Links to user_id and idea_key
      - Tracks metrics and progress for Phase 4
    
    - `scale_optimization`
      - Stores feedback analysis, upsell ideas, community content
      - Links to user_id and idea_key
      - Tracks completion status for Phase 5
    
    - `user_progress`
      - Tracks which phases each user has completed
      - Simple progress tracking across all 5 phases

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write own data
*/

-- Brand Identity Table (Phase 2)
CREATE TABLE IF NOT EXISTS brand_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_key text NOT NULL,
  business_names jsonb DEFAULT '[]'::jsonb,
  selected_name text,
  logo_data jsonb DEFAULT '{}'::jsonb,
  brand_colors jsonb DEFAULT '{}'::jsonb,
  domain_suggestions jsonb DEFAULT '[]'::jsonb,
  selected_domain text,
  completed_steps text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brand_identity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own brand identity"
  ON brand_identity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand identity"
  ON brand_identity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand identity"
  ON brand_identity FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand identity"
  ON brand_identity FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Marketing Assets Table (Phase 3)
CREATE TABLE IF NOT EXISTS marketing_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_key text NOT NULL,
  flyers jsonb DEFAULT '[]'::jsonb,
  social_posts jsonb DEFAULT '[]'::jsonb,
  message_templates jsonb DEFAULT '[]'::jsonb,
  ad_strategy jsonb DEFAULT '{}'::jsonb,
  content_calendar jsonb DEFAULT '[]'::jsonb,
  completed_steps text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own marketing assets"
  ON marketing_assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing assets"
  ON marketing_assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing assets"
  ON marketing_assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketing assets"
  ON marketing_assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Operations Tracking Table (Phase 4)
CREATE TABLE IF NOT EXISTS operations_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_key text NOT NULL,
  profit_loss_entries jsonb DEFAULT '[]'::jsonb,
  goals jsonb DEFAULT '{}'::jsonb,
  reminders jsonb DEFAULT '[]'::jsonb,
  leads_count integer DEFAULT 0,
  customers_count integer DEFAULT 0,
  revenue_total numeric DEFAULT 0,
  completed_steps text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE operations_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own operations tracking"
  ON operations_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own operations tracking"
  ON operations_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own operations tracking"
  ON operations_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own operations tracking"
  ON operations_tracking FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Scale Optimization Table (Phase 5)
CREATE TABLE IF NOT EXISTS scale_optimization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_key text NOT NULL,
  feedback_entries jsonb DEFAULT '[]'::jsonb,
  feedback_analysis jsonb DEFAULT '{}'::jsonb,
  upsell_ideas jsonb DEFAULT '[]'::jsonb,
  community_posts jsonb DEFAULT '[]'::jsonb,
  completed_steps text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scale_optimization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scale optimization"
  ON scale_optimization FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scale optimization"
  ON scale_optimization FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scale optimization"
  ON scale_optimization FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scale optimization"
  ON scale_optimization FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Progress Table (tracks completion across all phases)
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_key text NOT NULL,
  phase_1_completed boolean DEFAULT false,
  phase_2_completed boolean DEFAULT false,
  phase_3_completed boolean DEFAULT false,
  phase_4_completed boolean DEFAULT false,
  phase_5_completed boolean DEFAULT false,
  current_phase integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, idea_key)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);