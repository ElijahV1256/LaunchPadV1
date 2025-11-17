/*
  # Operations & Tracking Tables

  1. New Tables
    - `profit_loss_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `idea_key` (text)
      - `entry_date` (date)
      - `entry_type` (text) - 'income' or 'expense'
      - `category` (text) - e.g., 'sales', 'ads', 'materials', 'services'
      - `description` (text)
      - `amount` (decimal)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `business_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `idea_key` (text)
      - `goal_type` (text) - 'leads', 'customers', 'revenue'
      - `target_value` (decimal)
      - `current_value` (decimal)
      - `period` (text) - 'weekly', 'monthly', 'yearly'
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `reminders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `idea_key` (text)
      - `reminder_type` (text) - 'manual', 'ai_generated'
      - `title` (text)
      - `message` (text)
      - `is_read` (boolean)
      - `is_dismissed` (boolean)
      - `priority` (text) - 'low', 'medium', 'high'
      - `action_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Profit & Loss Entries Table
CREATE TABLE IF NOT EXISTS profit_loss_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  entry_type text NOT NULL CHECK (entry_type IN ('income', 'expense')),
  category text NOT NULL,
  description text,
  amount decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profit_loss_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profit/loss entries"
  ON profit_loss_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profit/loss entries"
  ON profit_loss_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profit/loss entries"
  ON profit_loss_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profit/loss entries"
  ON profit_loss_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Business Goals Table
CREATE TABLE IF NOT EXISTS business_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  goal_type text NOT NULL CHECK (goal_type IN ('leads', 'customers', 'revenue')),
  target_value decimal(10, 2) NOT NULL,
  current_value decimal(10, 2) DEFAULT 0,
  period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON business_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON business_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON business_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON business_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  reminder_type text NOT NULL CHECK (reminder_type IN ('manual', 'ai_generated')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profit_loss_user_idea ON profit_loss_entries(user_id, idea_key);
CREATE INDEX IF NOT EXISTS idx_profit_loss_date ON profit_loss_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_business_goals_user_idea ON business_goals(user_id, idea_key);
CREATE INDEX IF NOT EXISTS idx_reminders_user_idea ON reminders(user_id, idea_key);
CREATE INDEX IF NOT EXISTS idx_reminders_unread ON reminders(user_id, is_read) WHERE is_read = false;
