/*
  # Fix Remaining Security and Performance Issues

  ## Changes
  
  ### 1. Add Missing Foreign Key Indexes
  - Add indexes for operations_tracking.user_id and scale_optimization.user_id
  - These indexes improve query performance when filtering by user_id
  
  ### 2. Remove Unused Indexes
  - Drop 10 unused indexes that were created in previous migration but are not being utilized
  - These tables may have alternative query patterns or are not yet heavily used
  - Removing unused indexes reduces database overhead and improves write performance
  
  ## Security Impact
  - Improved query performance on foreign key lookups
  - Reduced database overhead from maintaining unused indexes
  - Better write performance on tables with removed indexes
  
  ## Notes
  - Indexes marked as unused may become useful as the application scales
  - Monitor query patterns and recreate indexes if needed in the future
  - The leaked password protection setting must be enabled in Supabase dashboard
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Index for operations_tracking.user_id
CREATE INDEX IF NOT EXISTS idx_operations_tracking_user_id_v2 ON public.operations_tracking(user_id);

-- Index for scale_optimization.user_id
CREATE INDEX IF NOT EXISTS idx_scale_optimization_user_id_v2 ON public.scale_optimization(user_id);

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

-- These indexes were created but are not currently being used by queries
-- Drop them to reduce database maintenance overhead

DROP INDEX IF EXISTS public.idx_business_goals_user_id;
DROP INDEX IF EXISTS public.idx_community_comments_post_id;
DROP INDEX IF EXISTS public.idx_community_comments_user_id;
DROP INDEX IF EXISTS public.idx_community_posts_user_id;
DROP INDEX IF EXISTS public.idx_customer_feedback_user_id;
DROP INDEX IF EXISTS public.idx_first_revenue_user_id;
DROP INDEX IF EXISTS public.idx_local_analyses_user_id;
DROP INDEX IF EXISTS public.idx_reminders_user_id;
DROP INDEX IF EXISTS public.idx_storybrand_roadmap_user_id;
DROP INDEX IF EXISTS public.idx_upsell_ideas_user_id;
