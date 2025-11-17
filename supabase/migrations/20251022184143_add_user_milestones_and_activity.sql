/*
  # Add User Milestones and Activity Tracking

  1. New Tables
    - `user_milestones`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `milestone_type` (text) - e.g., 'idea_selected', 'first_step_completed', 'first_customer', 'first_revenue'
      - `milestone_data` (jsonb) - additional data about the milestone
      - `achieved_at` (timestamptz)
    
    - `user_activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `activity_type` (text) - e.g., 'step_completed', 'idea_generated', 'roadmap_viewed'
      - `activity_data` (jsonb) - details about the activity
      - `created_at` (timestamptz)
    
    - `user_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `messages_sent` (integer, default 0)
      - `replies_received` (integer, default 0)
      - `customers_acquired` (integer, default 0)
      - `revenue_earned` (decimal, default 0)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Create user_milestones table
CREATE TABLE IF NOT EXISTS user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  milestone_data jsonb DEFAULT '{}',
  achieved_at timestamptz DEFAULT now()
);

ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON user_milestones
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON user_milestones
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create user_metrics table
CREATE TABLE IF NOT EXISTS user_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages_sent integer DEFAULT 0,
  replies_received integer DEFAULT 0,
  customers_acquired integer DEFAULT 0,
  revenue_earned decimal(10, 2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON user_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics"
  ON user_metrics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics"
  ON user_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_type ON user_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);