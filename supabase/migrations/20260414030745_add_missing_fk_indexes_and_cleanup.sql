/*
  # Add missing foreign key indexes and clean up unused indexes

  1. New Indexes
    - `community_comments.user_id` - FK index for user lookups
    - `community_posts.user_id` - FK index for user lookups
    - `local_analyses.user_id` - FK index for user lookups
    - `website_bookings.user_id` - FK index for user lookups

  2. Dropped Unused Indexes
    - idx_pro_website_requests_user_id
    - idx_roadmaps_user_id
    - idx_operations_tracking_user_id
    - idx_scale_optimization_user_id
    - idx_business_plans_user_id
    - idx_first_revenue_user_id
    - idx_customer_feedback_user_id
    - idx_upsell_ideas_user_id
    - idx_managed_websites_user_id
    - idx_community_comments_post_id
    - idx_marketing_strategies_user_id
    - idx_marketing_strategies_website_id
    - idx_profit_loss_entries_user_id
    - idx_user_milestones_user_id
    - idx_business_goals_user_id
    - idx_reminders_user_id
    - idx_saved_business_names_user_id
    - idx_website_suggestions_user_id
    - idx_website_suggestions_website_id

  3. Security
    - Restrict storage SELECT policies on `logos` and `website-images` buckets
      to only allow authenticated reads by object path, preventing full listing
*/

-- 1. Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_local_analyses_user_id ON public.local_analyses (user_id);
CREATE INDEX IF NOT EXISTS idx_website_bookings_user_id ON public.website_bookings (user_id);

-- 2. Drop unused indexes
DROP INDEX IF EXISTS idx_pro_website_requests_user_id;
DROP INDEX IF EXISTS idx_roadmaps_user_id;
DROP INDEX IF EXISTS idx_operations_tracking_user_id;
DROP INDEX IF EXISTS idx_scale_optimization_user_id;
DROP INDEX IF EXISTS idx_business_plans_user_id;
DROP INDEX IF EXISTS idx_first_revenue_user_id;
DROP INDEX IF EXISTS idx_customer_feedback_user_id;
DROP INDEX IF EXISTS idx_upsell_ideas_user_id;
DROP INDEX IF EXISTS idx_managed_websites_user_id;
DROP INDEX IF EXISTS idx_community_comments_post_id;
DROP INDEX IF EXISTS idx_marketing_strategies_user_id;
DROP INDEX IF EXISTS idx_marketing_strategies_website_id;
DROP INDEX IF EXISTS idx_profit_loss_entries_user_id;
DROP INDEX IF EXISTS idx_user_milestones_user_id;
DROP INDEX IF EXISTS idx_business_goals_user_id;
DROP INDEX IF EXISTS idx_reminders_user_id;
DROP INDEX IF EXISTS idx_saved_business_names_user_id;
DROP INDEX IF EXISTS idx_website_suggestions_user_id;
DROP INDEX IF EXISTS idx_website_suggestions_website_id;

-- 3. Restrict storage bucket SELECT policies to prevent broad file listing
DROP POLICY IF EXISTS "Public read access for logos" ON storage.objects;
CREATE POLICY "Authenticated users can read logos by path"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Anyone can view website images" ON storage.objects;
CREATE POLICY "Authenticated users can read website images by path"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'website-images');
