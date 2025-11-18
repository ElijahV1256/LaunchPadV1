/*
  # Create saved business names table

  1. New Tables
    - `saved_business_names`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `idea_key` (text, links to business idea)
      - `name` (text, the business name)
      - `tagline` (text, the tagline)
      - `description` (text, additional context)
      - `created_at` (timestamptz)
      - `is_selected` (boolean, whether this name was chosen)

  2. Security
    - Enable RLS on `saved_business_names` table
    - Add policies for authenticated users to manage their own saved names

  3. Indexes
    - Add index on user_id and idea_key for faster lookups
*/

CREATE TABLE IF NOT EXISTS saved_business_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  is_selected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_business_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved names"
  ON saved_business_names FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved names"
  ON saved_business_names FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved names"
  ON saved_business_names FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved names"
  ON saved_business_names FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_business_names_user_idea 
  ON saved_business_names(user_id, idea_key);

CREATE INDEX IF NOT EXISTS idx_saved_business_names_created 
  ON saved_business_names(created_at DESC);