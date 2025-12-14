/*
  # Create Website Generation Tables

  1. New Tables
    - `starter_websites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `idea_key` (text) - links to business idea
      - `business_package` (jsonb) - complete business package JSON
      - `home_html` (text) - generated home page HTML
      - `shop_html` (text) - generated shop page HTML
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `pro_website_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `idea_key` (text) - links to business idea
      - `business_package` (jsonb) - complete business package JSON
      - `status` (text) - submitted, paid, assigned, in_progress, delivered
      - `price` (int) - default 600
      - `notes` (text) - customer notes/requirements
      - `deliverables_url` (text) - link to final deliverables
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own records

  3. Indexes
    - Index on user_id and idea_key for fast lookups
*/

-- Create starter_websites table
CREATE TABLE IF NOT EXISTS starter_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_key text NOT NULL,
  business_package jsonb DEFAULT '{}'::jsonb,
  home_html text,
  shop_html text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pro_website_requests table
CREATE TABLE IF NOT EXISTS pro_website_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_key text NOT NULL,
  business_package jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'paid', 'assigned', 'in_progress', 'delivered')),
  price int DEFAULT 600,
  notes text,
  deliverables_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE starter_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_website_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for starter_websites
CREATE POLICY "Users can view own starter websites"
  ON starter_websites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own starter websites"
  ON starter_websites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own starter websites"
  ON starter_websites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own starter websites"
  ON starter_websites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for pro_website_requests
CREATE POLICY "Users can view own pro website requests"
  ON pro_website_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pro website requests"
  ON pro_website_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pro website requests"
  ON pro_website_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pro website requests"
  ON pro_website_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_starter_websites_user_id ON starter_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_starter_websites_idea_key ON starter_websites(idea_key);
CREATE INDEX IF NOT EXISTS idx_starter_websites_user_idea ON starter_websites(user_id, idea_key);

CREATE INDEX IF NOT EXISTS idx_pro_website_requests_user_id ON pro_website_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_website_requests_idea_key ON pro_website_requests(idea_key);
CREATE INDEX IF NOT EXISTS idx_pro_website_requests_status ON pro_website_requests(status);
CREATE INDEX IF NOT EXISTS idx_pro_website_requests_user_idea ON pro_website_requests(user_id, idea_key);

-- Add unique constraint to prevent duplicates per user/idea
CREATE UNIQUE INDEX IF NOT EXISTS idx_starter_websites_unique_user_idea 
  ON starter_websites(user_id, idea_key);
