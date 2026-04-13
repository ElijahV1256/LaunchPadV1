/*
  # Add missing foreign key indexes and drop unused indexes

  1. New Indexes (covering foreign keys)
    - business_goals(user_id)
    - business_plans(user_id)
    - community_comments(post_id)
    - customer_feedback(user_id)
    - first_revenue(user_id)
    - managed_websites(user_id)
    - marketing_strategies(user_id, website_id)
    - operations_tracking(user_id)
    - pro_website_requests(user_id)
    - profit_loss_entries(user_id)
    - reminders(user_id)
    - roadmaps(user_id)
    - saved_business_names(user_id)
    - scale_optimization(user_id)
    - upsell_ideas(user_id)
    - user_milestones(user_id)
    - website_suggestions(user_id, website_id)

  2. Dropped Indexes (unused)
    - idx_community_posts_user_id
    - idx_community_comments_user_id
    - idx_local_analyses_user_id
    - idx_website_bookings_user_id

  3. Important Notes
    - Foreign key indexes improve JOIN/DELETE performance on referenced tables
    - Unused indexes are dropped to reduce write overhead
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_business_goals_user_id ON public.business_goals (user_id);
CREATE INDEX IF NOT EXISTS idx_business_plans_user_id ON public.business_plans (user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_user_id ON public.customer_feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_first_revenue_user_id ON public.first_revenue (user_id);
CREATE INDEX IF NOT EXISTS idx_managed_websites_user_id ON public.managed_websites (user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_user_id ON public.marketing_strategies (user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_website_id ON public.marketing_strategies (website_id);
CREATE INDEX IF NOT EXISTS idx_operations_tracking_user_id ON public.operations_tracking (user_id);
CREATE INDEX IF NOT EXISTS idx_pro_website_requests_user_id ON public.pro_website_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_profit_loss_entries_user_id ON public.profit_loss_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders (user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_business_names_user_id ON public.saved_business_names (user_id);
CREATE INDEX IF NOT EXISTS idx_scale_optimization_user_id ON public.scale_optimization (user_id);
CREATE INDEX IF NOT EXISTS idx_upsell_ideas_user_id ON public.upsell_ideas (user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON public.user_milestones (user_id);
CREATE INDEX IF NOT EXISTS idx_website_suggestions_user_id ON public.website_suggestions (user_id);
CREATE INDEX IF NOT EXISTS idx_website_suggestions_website_id ON public.website_suggestions (website_id);

-- Drop unused indexes
DROP INDEX IF EXISTS idx_community_posts_user_id;
DROP INDEX IF EXISTS idx_community_comments_user_id;
DROP INDEX IF EXISTS idx_local_analyses_user_id;
DROP INDEX IF EXISTS idx_website_bookings_user_id;
