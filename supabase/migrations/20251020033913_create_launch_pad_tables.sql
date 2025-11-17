/*
  # Create Launch Pad Application Tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `interests` (text) - User's interests and hobbies
      - `problems` (text) - Problems they want to solve
      - `budget` (text) - Startup budget range
      - `availability` (text) - Time availability (part-time/full-time)
      - `created_at` (timestamptz) - Profile creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `business_ideas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `idea_id` (text) - Unique identifier for the idea
      - `name` (text) - Business name
      - `description` (text) - Business description
      - `difficulty` (integer) - Difficulty rating (1-5)
      - `cost_range` (text) - Cost range to start
      - `created_at` (timestamptz) - Idea creation timestamp
    
    - `roadmaps`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `idea_id` (text) - References business idea
      - `stages` (jsonb) - Array of roadmap stages with steps
      - `created_at` (timestamptz) - Roadmap creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own data
      - Insert their own data
      - Update their own data
      - Delete their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interests text NOT NULL,
  problems text NOT NULL,
  budget text NOT NULL,
  availability text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS business_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  difficulty integer NOT NULL,
  cost_range text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE business_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ideas"
  ON business_ideas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas"
  ON business_ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas"
  ON business_ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas"
  ON business_ideas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id text NOT NULL,
  stages jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roadmaps"
  ON roadmaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps"
  ON roadmaps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmaps"
  ON roadmaps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmaps"
  ON roadmaps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
