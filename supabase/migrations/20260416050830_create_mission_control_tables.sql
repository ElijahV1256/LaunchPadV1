/*
  # Create Mission Control Tables

  1. New Tables
    - `daily_reflections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `rating` (integer 1-5, day rating)
      - `note` (text, optional reflection note)
      - `reflection_date` (date, the day being reflected on)
      - `created_at` (timestamptz)
    - `dashboard_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `hidden_sections` (text[], sections the user has hidden)
      - `section_order` (text[], custom ordering of sections)
      - `onboarding_completed` (boolean, whether onboarding tour is done)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `daily_priorities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, the task description)
      - `completed` (boolean)
      - `priority_date` (date, the date this task is for)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to manage their own data only
*/

-- daily_reflections
CREATE TABLE IF NOT EXISTS daily_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  note text DEFAULT '',
  reflection_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, reflection_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_id ON daily_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date ON daily_reflections(user_id, reflection_date);

ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
  ON daily_reflections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON daily_reflections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
  ON daily_reflections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- dashboard_preferences
CREATE TABLE IF NOT EXISTS dashboard_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  hidden_sections text[] DEFAULT '{}' NOT NULL,
  section_order text[] DEFAULT '{}' NOT NULL,
  onboarding_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_user_id ON dashboard_preferences(user_id);

ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dashboard preferences"
  ON dashboard_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboard preferences"
  ON dashboard_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard preferences"
  ON dashboard_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- daily_priorities
CREATE TABLE IF NOT EXISTS daily_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  priority_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_priorities_user_id ON daily_priorities(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_priorities_date ON daily_priorities(user_id, priority_date);

ALTER TABLE daily_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own priorities"
  ON daily_priorities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own priorities"
  ON daily_priorities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own priorities"
  ON daily_priorities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own priorities"
  ON daily_priorities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
