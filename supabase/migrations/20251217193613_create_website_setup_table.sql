/*
  # Create Website Setup Table

  1. New Tables
    - `website_setup`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `idea_key` (text, business idea identifier)
      - `contact_info` (jsonb, email, phone, address)
      - `social_links` (jsonb, website, facebook, instagram, twitter, linkedin)
      - `business_info` (jsonb, hours, services description)
      - `stripe_info` (jsonb, connected status, checkout URL)
      - `product_images` (text[], array of image URLs)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `website_setup` table
    - Add policies for authenticated users to manage their own setup data
*/

CREATE TABLE IF NOT EXISTS website_setup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  contact_info jsonb DEFAULT '{}'::jsonb,
  social_links jsonb DEFAULT '{}'::jsonb,
  business_info jsonb DEFAULT '{}'::jsonb,
  stripe_info jsonb DEFAULT '{}'::jsonb,
  product_images text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, idea_key)
);

ALTER TABLE website_setup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own website setup"
  ON website_setup FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own website setup"
  ON website_setup FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own website setup"
  ON website_setup FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own website setup"
  ON website_setup FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_website_setup_user_id ON website_setup(user_id);
CREATE INDEX IF NOT EXISTS idx_website_setup_idea_key ON website_setup(idea_key);