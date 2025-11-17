/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Indexes on Foreign Keys
  - Add indexes for `business_ideas.user_id`
  - Add indexes for `operations_tracking.user_id`
  - Add indexes for `roadmaps.user_id`
  - Add indexes for `scale_optimization.user_id`

  ### 2. Optimize RLS Policies
  - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies
  - This prevents re-evaluation of auth functions for each row
  - Significantly improves query performance at scale

  ### 3. Fix Function Search Path
  - Update `update_updated_at_column` function with immutable search_path

  ### 4. Remove Unused Indexes
  - Drop indexes that are not being used to reduce maintenance overhead

  ## Performance Impact
  - Foreign key indexes: Faster joins and queries
  - Optimized RLS: 10-100x faster for large datasets
  - Cleaner index structure: Reduced storage and maintenance overhead
*/

-- =====================================================
-- SECTION 1: Add Missing Foreign Key Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_business_ideas_user_id 
  ON public.business_ideas(user_id);

CREATE INDEX IF NOT EXISTS idx_operations_tracking_user_id 
  ON public.operations_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id 
  ON public.roadmaps(user_id);

CREATE INDEX IF NOT EXISTS idx_scale_optimization_user_id 
  ON public.scale_optimization(user_id);

-- =====================================================
-- SECTION 2: Optimize RLS Policies - User Profiles
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own profile"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 3: Optimize RLS Policies - Business Ideas
-- =====================================================

DROP POLICY IF EXISTS "Users can read own ideas" ON public.business_ideas;
DROP POLICY IF EXISTS "Users can insert own ideas" ON public.business_ideas;
DROP POLICY IF EXISTS "Users can update own ideas" ON public.business_ideas;
DROP POLICY IF EXISTS "Users can delete own ideas" ON public.business_ideas;

CREATE POLICY "Users can read own ideas"
  ON public.business_ideas FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own ideas"
  ON public.business_ideas FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own ideas"
  ON public.business_ideas FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own ideas"
  ON public.business_ideas FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 4: Optimize RLS Policies - Roadmaps
-- =====================================================

DROP POLICY IF EXISTS "Users can read own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users can insert own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users can update own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users can delete own roadmaps" ON public.roadmaps;

CREATE POLICY "Users can read own roadmaps"
  ON public.roadmaps FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own roadmaps"
  ON public.roadmaps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own roadmaps"
  ON public.roadmaps FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own roadmaps"
  ON public.roadmaps FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 5: Optimize RLS Policies - Business Plans
-- =====================================================

DROP POLICY IF EXISTS "Users can view own business plans" ON public.business_plans;
DROP POLICY IF EXISTS "Users can insert own business plans" ON public.business_plans;
DROP POLICY IF EXISTS "Users can update own business plans" ON public.business_plans;
DROP POLICY IF EXISTS "Users can delete own business plans" ON public.business_plans;

CREATE POLICY "Users can view own business plans"
  ON public.business_plans FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own business plans"
  ON public.business_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own business plans"
  ON public.business_plans FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own business plans"
  ON public.business_plans FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 6: Optimize RLS Policies - First Revenue
-- =====================================================

DROP POLICY IF EXISTS "Users can view own first revenue plans" ON public.first_revenue;
DROP POLICY IF EXISTS "Users can insert own first revenue plans" ON public.first_revenue;
DROP POLICY IF EXISTS "Users can update own first revenue plans" ON public.first_revenue;
DROP POLICY IF EXISTS "Users can delete own first revenue plans" ON public.first_revenue;

CREATE POLICY "Users can view own first revenue plans"
  ON public.first_revenue FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own first revenue plans"
  ON public.first_revenue FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own first revenue plans"
  ON public.first_revenue FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own first revenue plans"
  ON public.first_revenue FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 7: Optimize RLS Policies - Storybrand Roadmap
-- =====================================================

DROP POLICY IF EXISTS "Users can view own storybrand roadmaps" ON public.storybrand_roadmap;
DROP POLICY IF EXISTS "Users can insert own storybrand roadmaps" ON public.storybrand_roadmap;
DROP POLICY IF EXISTS "Users can update own storybrand roadmaps" ON public.storybrand_roadmap;
DROP POLICY IF EXISTS "Users can delete own storybrand roadmaps" ON public.storybrand_roadmap;

CREATE POLICY "Users can view own storybrand roadmaps"
  ON public.storybrand_roadmap FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own storybrand roadmaps"
  ON public.storybrand_roadmap FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own storybrand roadmaps"
  ON public.storybrand_roadmap FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own storybrand roadmaps"
  ON public.storybrand_roadmap FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 8: Optimize RLS Policies - Local Analyses
-- =====================================================

DROP POLICY IF EXISTS "Users can read own analyses" ON public.local_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.local_analyses;

CREATE POLICY "Users can read own analyses"
  ON public.local_analyses FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own analyses"
  ON public.local_analyses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 9: Optimize RLS Policies - User Milestones
-- =====================================================

DROP POLICY IF EXISTS "Users can view own milestones" ON public.user_milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON public.user_milestones;

CREATE POLICY "Users can view own milestones"
  ON public.user_milestones FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own milestones"
  ON public.user_milestones FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 10: Optimize RLS Policies - User Activities
-- =====================================================

DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;

CREATE POLICY "Users can view own activities"
  ON public.user_activities FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own activities"
  ON public.user_activities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 11: Optimize RLS Policies - User Metrics
-- =====================================================

DROP POLICY IF EXISTS "Users can view own metrics" ON public.user_metrics;
DROP POLICY IF EXISTS "Users can update own metrics" ON public.user_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON public.user_metrics;

CREATE POLICY "Users can view own metrics"
  ON public.user_metrics FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own metrics"
  ON public.user_metrics FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own metrics"
  ON public.user_metrics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 12: Optimize RLS Policies - First Dollar
-- =====================================================

DROP POLICY IF EXISTS "Users can read own first_dollar data" ON public.first_dollar;
DROP POLICY IF EXISTS "Users can insert own first_dollar data" ON public.first_dollar;
DROP POLICY IF EXISTS "Users can update own first_dollar data" ON public.first_dollar;
DROP POLICY IF EXISTS "Users can delete own first_dollar data" ON public.first_dollar;

CREATE POLICY "Users can read own first_dollar data"
  ON public.first_dollar FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own first_dollar data"
  ON public.first_dollar FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own first_dollar data"
  ON public.first_dollar FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own first_dollar data"
  ON public.first_dollar FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 13: Optimize RLS Policies - Brand Identity
-- =====================================================

DROP POLICY IF EXISTS "Users can read own brand identity" ON public.brand_identity;
DROP POLICY IF EXISTS "Users can insert own brand identity" ON public.brand_identity;
DROP POLICY IF EXISTS "Users can update own brand identity" ON public.brand_identity;
DROP POLICY IF EXISTS "Users can delete own brand identity" ON public.brand_identity;

CREATE POLICY "Users can read own brand identity"
  ON public.brand_identity FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own brand identity"
  ON public.brand_identity FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own brand identity"
  ON public.brand_identity FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own brand identity"
  ON public.brand_identity FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 14: Optimize RLS Policies - Marketing Assets
-- =====================================================

DROP POLICY IF EXISTS "Users can read own marketing assets" ON public.marketing_assets;
DROP POLICY IF EXISTS "Users can insert own marketing assets" ON public.marketing_assets;
DROP POLICY IF EXISTS "Users can update own marketing assets" ON public.marketing_assets;
DROP POLICY IF EXISTS "Users can delete own marketing assets" ON public.marketing_assets;

CREATE POLICY "Users can read own marketing assets"
  ON public.marketing_assets FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own marketing assets"
  ON public.marketing_assets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own marketing assets"
  ON public.marketing_assets FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own marketing assets"
  ON public.marketing_assets FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 15: Optimize RLS Policies - Operations Tracking
-- =====================================================

DROP POLICY IF EXISTS "Users can read own operations tracking" ON public.operations_tracking;
DROP POLICY IF EXISTS "Users can insert own operations tracking" ON public.operations_tracking;
DROP POLICY IF EXISTS "Users can update own operations tracking" ON public.operations_tracking;
DROP POLICY IF EXISTS "Users can delete own operations tracking" ON public.operations_tracking;

CREATE POLICY "Users can read own operations tracking"
  ON public.operations_tracking FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own operations tracking"
  ON public.operations_tracking FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own operations tracking"
  ON public.operations_tracking FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own operations tracking"
  ON public.operations_tracking FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 16: Optimize RLS Policies - Scale Optimization
-- =====================================================

DROP POLICY IF EXISTS "Users can read own scale optimization" ON public.scale_optimization;
DROP POLICY IF EXISTS "Users can insert own scale optimization" ON public.scale_optimization;
DROP POLICY IF EXISTS "Users can update own scale optimization" ON public.scale_optimization;
DROP POLICY IF EXISTS "Users can delete own scale optimization" ON public.scale_optimization;

CREATE POLICY "Users can read own scale optimization"
  ON public.scale_optimization FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own scale optimization"
  ON public.scale_optimization FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own scale optimization"
  ON public.scale_optimization FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own scale optimization"
  ON public.scale_optimization FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 17: Optimize RLS Policies - User Progress
-- =====================================================

DROP POLICY IF EXISTS "Users can read own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON public.user_progress;

CREATE POLICY "Users can read own progress"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own progress"
  ON public.user_progress FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 18: Optimize RLS Policies - Customer Feedback
-- =====================================================

DROP POLICY IF EXISTS "Users can view own feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "Users can delete own feedback" ON public.customer_feedback;

CREATE POLICY "Users can view own feedback"
  ON public.customer_feedback FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own feedback"
  ON public.customer_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own feedback"
  ON public.customer_feedback FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own feedback"
  ON public.customer_feedback FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 19: Optimize RLS Policies - Upsell Ideas
-- =====================================================

DROP POLICY IF EXISTS "Users can view own upsells" ON public.upsell_ideas;
DROP POLICY IF EXISTS "Users can insert own upsells" ON public.upsell_ideas;
DROP POLICY IF EXISTS "Users can update own upsells" ON public.upsell_ideas;
DROP POLICY IF EXISTS "Users can delete own upsells" ON public.upsell_ideas;

CREATE POLICY "Users can view own upsells"
  ON public.upsell_ideas FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own upsells"
  ON public.upsell_ideas FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own upsells"
  ON public.upsell_ideas FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own upsells"
  ON public.upsell_ideas FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 20: Optimize RLS Policies - Community Posts
-- =====================================================

DROP POLICY IF EXISTS "Users can insert own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;

CREATE POLICY "Users can insert own posts"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 21: Optimize RLS Policies - Community Comments
-- =====================================================

DROP POLICY IF EXISTS "Users can insert own comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.community_comments;

CREATE POLICY "Users can insert own comments"
  ON public.community_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own comments"
  ON public.community_comments FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own comments"
  ON public.community_comments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 22: Optimize RLS Policies - Profit/Loss Entries
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profit/loss entries" ON public.profit_loss_entries;
DROP POLICY IF EXISTS "Users can insert own profit/loss entries" ON public.profit_loss_entries;
DROP POLICY IF EXISTS "Users can update own profit/loss entries" ON public.profit_loss_entries;
DROP POLICY IF EXISTS "Users can delete own profit/loss entries" ON public.profit_loss_entries;

CREATE POLICY "Users can view own profit/loss entries"
  ON public.profit_loss_entries FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own profit/loss entries"
  ON public.profit_loss_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own profit/loss entries"
  ON public.profit_loss_entries FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own profit/loss entries"
  ON public.profit_loss_entries FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 23: Optimize RLS Policies - Business Goals
-- =====================================================

DROP POLICY IF EXISTS "Users can view own goals" ON public.business_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.business_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.business_goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.business_goals;

CREATE POLICY "Users can view own goals"
  ON public.business_goals FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own goals"
  ON public.business_goals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own goals"
  ON public.business_goals FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own goals"
  ON public.business_goals FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 24: Optimize RLS Policies - Reminders
-- =====================================================

DROP POLICY IF EXISTS "Users can view own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can insert own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON public.reminders;

CREATE POLICY "Users can view own reminders"
  ON public.reminders FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own reminders"
  ON public.reminders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own reminders"
  ON public.reminders FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own reminders"
  ON public.reminders FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 25: Optimize RLS Policies - Websites
-- =====================================================

DROP POLICY IF EXISTS "Users can view own websites" ON public.websites;
DROP POLICY IF EXISTS "Users can insert own websites" ON public.websites;
DROP POLICY IF EXISTS "Users can update own websites" ON public.websites;
DROP POLICY IF EXISTS "Users can delete own websites" ON public.websites;

CREATE POLICY "Users can view own websites"
  ON public.websites FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own websites"
  ON public.websites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own websites"
  ON public.websites FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own websites"
  ON public.websites FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- SECTION 26: Fix Function Search Path
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- SECTION 27: Remove Unused Indexes
-- =====================================================

DROP INDEX IF EXISTS public.idx_business_plans_idea_id;
DROP INDEX IF EXISTS public.idx_websites_user_idea;
DROP INDEX IF EXISTS public.idx_first_revenue_user_id;
DROP INDEX IF EXISTS public.idx_first_revenue_idea_key;
DROP INDEX IF EXISTS public.idx_first_revenue_user_idea;
DROP INDEX IF EXISTS public.idx_storybrand_roadmap_user_id;
DROP INDEX IF EXISTS public.idx_storybrand_roadmap_idea_key;
DROP INDEX IF EXISTS public.idx_storybrand_roadmap_user_idea;
DROP INDEX IF EXISTS public.idx_customer_feedback_user_id;
DROP INDEX IF EXISTS public.idx_customer_feedback_idea_key;
DROP INDEX IF EXISTS public.idx_upsell_ideas_user_id;
DROP INDEX IF EXISTS public.idx_upsell_ideas_idea_key;
DROP INDEX IF EXISTS public.idx_community_posts_user_id;
DROP INDEX IF EXISTS public.idx_community_posts_post_type;
DROP INDEX IF EXISTS public.idx_community_comments_post_id;
DROP INDEX IF EXISTS public.idx_community_comments_user_id;
DROP INDEX IF EXISTS public.idx_local_analyses_user_id;
DROP INDEX IF EXISTS public.idx_local_analyses_created_at;
DROP INDEX IF EXISTS public.idx_profit_loss_date;
DROP INDEX IF EXISTS public.idx_business_goals_user_idea;
DROP INDEX IF EXISTS public.idx_reminders_user_idea;
DROP INDEX IF EXISTS public.idx_reminders_unread;
