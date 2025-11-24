/*
  # Create Website Suggestions Table

  1. New Tables
    - `website_suggestions`
      - `id` (uuid, primary key)
      - `website_id` (uuid, foreign key to websites)
      - `user_id` (uuid, foreign key to auth.users)
      - `user_message` (text) - User's suggestion/feedback
      - `ai_response` (text) - AI's response/implementation notes
      - `status` (text) - pending, implemented, dismissed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `website_suggestions` table
    - Add policy for users to manage their own suggestions
*/

CREATE TABLE IF NOT EXISTS website_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES websites(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_message text NOT NULL,
  ai_response text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'implemented', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE website_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions"
  ON website_suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own suggestions"
  ON website_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions"
  ON website_suggestions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suggestions"
  ON website_suggestions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_website_suggestions_website_id ON website_suggestions(website_id);
CREATE INDEX IF NOT EXISTS idx_website_suggestions_user_id ON website_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_website_suggestions_status ON website_suggestions(status);