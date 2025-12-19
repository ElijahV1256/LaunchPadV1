/*
  # Website Management System

  1. New Tables
    - `managed_websites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `business_type` (text, 'ecommerce' or 'service')
      - `brand_name` (text)
      - `domain_status` (jsonb) - stores domain configuration
      - `publish_status` (text, 'draft' or 'published')
      - `primary_color` (text, hex color)
      - `secondary_color` (text, hex color)
      - `font_heading` (text)
      - `font_body` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `managed_website_content`
      - `id` (uuid, primary key)
      - `website_id` (uuid, foreign key to managed_websites)
      - `home` (jsonb) - structured content sections
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `website_payments`
      - `id` (uuid, primary key)
      - `website_id` (uuid, foreign key to managed_websites)
      - `provider` (text, 'stripe')
      - `status` (text, 'not_connected' or 'connected')
      - `stripe_account_id` (text, nullable)
      - `checkout_mode` (text, 'pay_link', 'deposit', 'cart', or 'invoice')
      - `default_price` (numeric, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own websites
    - Ensure users can only access their own data

  3. Important Notes
    - Uses proper foreign key constraints
    - Includes indexes for performance
    - All timestamps default to now()
*/

-- Create managed_websites table
CREATE TABLE IF NOT EXISTS managed_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_type text NOT NULL DEFAULT 'service' CHECK (business_type IN ('ecommerce', 'service')),
  brand_name text NOT NULL DEFAULT '',
  domain_status jsonb NOT NULL DEFAULT '{"mode": "subdomain", "subdomain": "", "custom_domain": "", "verification_status": "pending"}'::jsonb,
  publish_status text NOT NULL DEFAULT 'draft' CHECK (publish_status IN ('draft', 'published')),
  primary_color text DEFAULT '#2979FF',
  secondary_color text DEFAULT '#06D6A0',
  font_heading text DEFAULT 'Inter',
  font_body text DEFAULT 'Inter',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create managed_website_content table
CREATE TABLE IF NOT EXISTS managed_website_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid NOT NULL REFERENCES managed_websites(id) ON DELETE CASCADE,
  home jsonb NOT NULL DEFAULT '{
    "hero": {
      "headline": "",
      "subheadline": "",
      "cta_text": "",
      "cta_link": ""
    },
    "social_proof": {
      "bullets": [],
      "testimonial_snippets": []
    },
    "features_or_services": {
      "items": []
    },
    "faq": {
      "items": []
    },
    "contact": {
      "phone": "",
      "email": "",
      "city": "",
      "service_area": ""
    },
    "footer": {
      "short_blurb": "",
      "links": []
    }
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(website_id)
);

-- Create website_payments table
CREATE TABLE IF NOT EXISTS website_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid NOT NULL REFERENCES managed_websites(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'stripe' CHECK (provider IN ('stripe')),
  status text NOT NULL DEFAULT 'not_connected' CHECK (status IN ('not_connected', 'connected')),
  stripe_account_id text,
  checkout_mode text DEFAULT 'pay_link' CHECK (checkout_mode IN ('pay_link', 'deposit', 'cart', 'invoice')),
  default_price numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(website_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_managed_websites_user_id ON managed_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_managed_website_content_website_id ON managed_website_content(website_id);
CREATE INDEX IF NOT EXISTS idx_website_payments_website_id ON website_payments(website_id);

-- Enable Row Level Security
ALTER TABLE managed_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for managed_websites
CREATE POLICY "Users can view own websites"
  ON managed_websites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own websites"
  ON managed_websites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own websites"
  ON managed_websites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own websites"
  ON managed_websites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for managed_website_content
CREATE POLICY "Users can view own website content"
  ON managed_website_content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = managed_website_content.website_id
      AND managed_websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own website content"
  ON managed_website_content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = managed_website_content.website_id
      AND managed_websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own website content"
  ON managed_website_content FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = managed_website_content.website_id
      AND managed_websites.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = managed_website_content.website_id
      AND managed_websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own website content"
  ON managed_website_content FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = managed_website_content.website_id
      AND managed_websites.user_id = auth.uid()
    )
  );

-- RLS Policies for website_payments
CREATE POLICY "Users can view own website payments"
  ON website_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = website_payments.website_id
      AND managed_websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own website payments"
  ON website_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = website_payments.website_id
      AND managed_websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own website payments"
  ON website_payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = website_payments.website_id
      AND managed_websites.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = website_payments.website_id
      AND managed_websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own website payments"
  ON website_payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM managed_websites
      WHERE managed_websites.id = website_payments.website_id
      AND managed_websites.user_id = auth.uid()
    )
  );