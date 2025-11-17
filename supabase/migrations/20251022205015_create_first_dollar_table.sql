/*
  # Create first_dollar table for "First $1" flow

  1. New Tables
    - `first_dollar`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `idea_key` (text, the selected business idea)
      - `offer_one_liner` (text, Step 1 - mini-offer description)
      - `price` (text, Step 1 - price point)
      - `target_person` (text, Step 2 - who to ask first)
      - `tiny_proof_url` (text, Step 3 - link to proof)
      - `steps` (jsonb, array of step definitions)
      - `completed` (text[], array of completed step IDs)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `first_dollar` table
    - Add policies for authenticated users to manage only their own rows

  3. Notes
    - Default steps include: define-offer, pick-person, make-proof, reach-out, deliver
    - Users can only access their own first_dollar rows
    - updated_at automatically updates on row changes
*/

CREATE TABLE IF NOT EXISTS first_dollar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_key text NOT NULL,
  offer_one_liner text,
  price text,
  target_person text,
  tiny_proof_url text,
  steps jsonb NOT NULL DEFAULT '[
    {"id":"define-offer","label":"Define your mini-offer"},
    {"id":"pick-person","label":"Pick one person"},
    {"id":"make-proof","label":"Create something tiny"},
    {"id":"reach-out","label":"Send your invite"},
    {"id":"deliver","label":"Deliver & reflect"}
  ]'::jsonb,
  completed text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, idea_key)
);

ALTER TABLE first_dollar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own first_dollar data"
  ON first_dollar
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own first_dollar data"
  ON first_dollar
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own first_dollar data"
  ON first_dollar
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own first_dollar data"
  ON first_dollar
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_first_dollar_updated_at ON first_dollar;

CREATE TRIGGER update_first_dollar_updated_at
  BEFORE UPDATE ON first_dollar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();