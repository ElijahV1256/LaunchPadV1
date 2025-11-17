/*
  # Create Scale & Optimize Tables

  1. New Tables
    - `customer_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `idea_key` (text, links to business idea)
      - `customer_name` (text, name of the customer)
      - `feedback_text` (text, actual feedback content)
      - `rating` (integer, 1-5 rating)
      - `source` (text, where feedback came from)
      - `ai_analysis` (jsonb, AI-generated analysis results)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `upsell_ideas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `idea_key` (text, links to business idea)
      - `upsell_type` (text, product/service/tier)
      - `title` (text, upsell idea title)
      - `description` (text, detailed description)
      - `estimated_price` (numeric, suggested pricing)
      - `target_audience` (text, who this is for)
      - `implementation_difficulty` (text, easy/medium/hard)
      - `ai_confidence` (integer, 0-100 confidence score)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `community_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `post_type` (text, success_story/template/question/answer)
      - `title` (text, post title)
      - `content` (text, post content)
      - `likes_count` (integer, number of likes)
      - `comments_count` (integer, number of comments)
      - `is_featured` (boolean, whether post is featured)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Community posts are readable by all authenticated users
    - Only post owners can update/delete their posts
*/

-- Create customer_feedback table
CREATE TABLE IF NOT EXISTS customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  customer_name text NOT NULL,
  feedback_text text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  source text NOT NULL DEFAULT 'manual',
  ai_analysis jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON customer_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON customer_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON customer_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback"
  ON customer_feedback FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create upsell_ideas table
CREATE TABLE IF NOT EXISTS upsell_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_key text NOT NULL,
  upsell_type text NOT NULL DEFAULT 'product',
  title text NOT NULL,
  description text NOT NULL,
  estimated_price numeric NOT NULL DEFAULT 0,
  target_audience text NOT NULL,
  implementation_difficulty text NOT NULL DEFAULT 'medium',
  ai_confidence integer NOT NULL DEFAULT 0 CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE upsell_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upsells"
  ON upsell_ideas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own upsells"
  ON upsell_ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own upsells"
  ON upsell_ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own upsells"
  ON upsell_ideas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_type text NOT NULL DEFAULT 'question',
  title text NOT NULL,
  content text NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view community posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_feedback_user_idea ON customer_feedback(user_id, idea_key);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_created ON customer_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upsell_ideas_user_idea ON upsell_ideas(user_id, idea_key);
CREATE INDEX IF NOT EXISTS idx_upsell_ideas_confidence ON upsell_ideas(ai_confidence DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
