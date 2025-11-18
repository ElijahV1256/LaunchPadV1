/*
  # Fix Security and Performance Issues

  ## Changes
  
  ### 1. Add Missing Foreign Key Indexes
  - Add indexes for all unindexed foreign keys to improve query performance
  - Tables affected: business_goals, community_comments, community_posts, customer_feedback, 
    first_revenue, local_analyses, reminders, storybrand_roadmap, upsell_ideas
  
  ### 2. Optimize RLS Policies
  - Fix saved_ideas RLS policies to use (select auth.uid()) instead of auth.uid()
  - Fix saved_business_names RLS policies to use (select auth.uid()) instead of auth.uid()
  - This prevents re-evaluation of auth functions for each row, improving performance at scale
  
  ### 3. Remove Unused Indexes
  - Drop indexes that are not being used to reduce database overhead
  - Indexes to remove: saved_ideas_created_at_idx, idx_operations_tracking_user_id,
    idx_scale_optimization_user_id, idx_saved_business_names_created
  
  ## Security Impact
  - Improved query performance on foreign key lookups
  - Better RLS policy performance at scale
  - Reduced database overhead from unused indexes
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Index for business_goals.user_id
CREATE INDEX IF NOT EXISTS idx_business_goals_user_id ON public.business_goals(user_id);

-- Indexes for community_comments
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments(user_id);

-- Index for community_posts.user_id
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);

-- Index for customer_feedback.user_id
CREATE INDEX IF NOT EXISTS idx_customer_feedback_user_id ON public.customer_feedback(user_id);

-- Index for first_revenue.user_id
CREATE INDEX IF NOT EXISTS idx_first_revenue_user_id ON public.first_revenue(user_id);

-- Index for local_analyses.user_id
CREATE INDEX IF NOT EXISTS idx_local_analyses_user_id ON public.local_analyses(user_id);

-- Index for reminders.user_id
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);

-- Index for storybrand_roadmap.user_id
CREATE INDEX IF NOT EXISTS idx_storybrand_roadmap_user_id ON public.storybrand_roadmap(user_id);

-- Index for upsell_ideas.user_id
CREATE INDEX IF NOT EXISTS idx_upsell_ideas_user_id ON public.upsell_ideas(user_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - SAVED_IDEAS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own saved ideas" ON public.saved_ideas;
DROP POLICY IF EXISTS "Users can insert own saved ideas" ON public.saved_ideas;
DROP POLICY IF EXISTS "Users can update own saved ideas" ON public.saved_ideas;
DROP POLICY IF EXISTS "Users can delete own saved ideas" ON public.saved_ideas;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own saved ideas"
  ON public.saved_ideas
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own saved ideas"
  ON public.saved_ideas
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own saved ideas"
  ON public.saved_ideas
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own saved ideas"
  ON public.saved_ideas
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - SAVED_BUSINESS_NAMES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own saved names" ON public.saved_business_names;
DROP POLICY IF EXISTS "Users can insert own saved names" ON public.saved_business_names;
DROP POLICY IF EXISTS "Users can update own saved names" ON public.saved_business_names;
DROP POLICY IF EXISTS "Users can delete own saved names" ON public.saved_business_names;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own saved names"
  ON public.saved_business_names
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own saved names"
  ON public.saved_business_names
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own saved names"
  ON public.saved_business_names
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own saved names"
  ON public.saved_business_names
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 4. REMOVE UNUSED INDEXES
-- =====================================================

-- Drop unused indexes to reduce database overhead
DROP INDEX IF EXISTS public.saved_ideas_created_at_idx;
DROP INDEX IF EXISTS public.idx_operations_tracking_user_id;
DROP INDEX IF EXISTS public.idx_scale_optimization_user_id;
DROP INDEX IF EXISTS public.idx_saved_business_names_created;
