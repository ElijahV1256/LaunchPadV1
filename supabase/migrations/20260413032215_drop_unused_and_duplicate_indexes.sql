/*
  # Drop unused and duplicate indexes

  1. Changes
    - Removes 1 duplicate index on profit_loss_entries (keeping idx_profit_loss_entries_user_idea)
    - Removes unused indexes across many tables to reduce write overhead and storage

  2. Affected Tables
    - starter_websites, pro_website_requests, roadmaps, operations_tracking,
      scale_optimization, business_plans, user_progress, websites, first_revenue,
      customer_feedback, upsell_ideas, managed_websites, community_posts,
      managed_website_content, community_comments, website_payments,
      marketing_strategies, website_setup, profit_loss_entries, user_milestones,
      business_goals, user_activities, user_metrics, reminders, saved_ideas,
      saved_business_names, website_suggestions, marketing_playbook

  3. Important Notes
    - These indexes have had zero usage according to pg_stat_user_indexes
    - Dropping them reduces write amplification and storage overhead
    - If any are needed in the future, they can be recreated
*/

-- Duplicate index (keeping idx_profit_loss_entries_user_idea)
DROP INDEX IF EXISTS idx_profit_loss_user_idea;

-- Unused indexes
DROP INDEX IF EXISTS idx_starter_websites_user_id;
DROP INDEX IF EXISTS idx_starter_websites_idea_key;
DROP INDEX IF EXISTS idx_starter_websites_user_idea;
DROP INDEX IF EXISTS idx_pro_website_requests_user_id;
DROP INDEX IF EXISTS idx_pro_website_requests_idea_key;
DROP INDEX IF EXISTS idx_pro_website_requests_status;
DROP INDEX IF EXISTS idx_pro_website_requests_user_idea;
DROP INDEX IF EXISTS idx_roadmaps_user_created;
DROP INDEX IF EXISTS idx_roadmaps_idea_id;
DROP INDEX IF EXISTS idx_roadmaps_user_id;
DROP INDEX IF EXISTS idx_operations_tracking_user_idea;
DROP INDEX IF EXISTS idx_operations_tracking_user_id_v2;
DROP INDEX IF EXISTS idx_scale_optimization_user_idea;
DROP INDEX IF EXISTS idx_scale_optimization_user_id_v2;
DROP INDEX IF EXISTS idx_business_plans_user_id;
DROP INDEX IF EXISTS idx_business_plans_idea_id;
DROP INDEX IF EXISTS idx_user_progress_user_idea;
DROP INDEX IF EXISTS idx_websites_subdomain;
DROP INDEX IF EXISTS idx_websites_published;
DROP INDEX IF EXISTS idx_first_revenue_user_idea;
DROP INDEX IF EXISTS idx_customer_feedback_user_idea;
DROP INDEX IF EXISTS idx_upsell_ideas_user_idea;
DROP INDEX IF EXISTS idx_managed_websites_user_id;
DROP INDEX IF EXISTS idx_community_posts_featured;
DROP INDEX IF EXISTS idx_managed_website_content_website_id;
DROP INDEX IF EXISTS idx_community_comments_post;
DROP INDEX IF EXISTS idx_website_payments_website_id;
DROP INDEX IF EXISTS idx_marketing_strategies_user_id;
DROP INDEX IF EXISTS idx_marketing_strategies_website_id;
DROP INDEX IF EXISTS idx_marketing_strategies_user;
DROP INDEX IF EXISTS idx_website_setup_user_id;
DROP INDEX IF EXISTS idx_website_setup_idea_key;
DROP INDEX IF EXISTS idx_website_setup_user_idea;
DROP INDEX IF EXISTS idx_profit_loss_entries_user_idea;
DROP INDEX IF EXISTS idx_profit_loss_entries_date;
DROP INDEX IF EXISTS idx_user_milestones_user_id;
DROP INDEX IF EXISTS idx_user_milestones_type;
DROP INDEX IF EXISTS idx_business_goals_user_idea;
DROP INDEX IF EXISTS idx_user_activities_user_id;
DROP INDEX IF EXISTS idx_user_activities_created_at;
DROP INDEX IF EXISTS idx_user_metrics_user_id;
DROP INDEX IF EXISTS idx_reminders_user_idea;
DROP INDEX IF EXISTS idx_reminders_active;
DROP INDEX IF EXISTS idx_reminders_unread;
DROP INDEX IF EXISTS idx_saved_ideas_user_created;
DROP INDEX IF EXISTS saved_ideas_user_id_idx;
DROP INDEX IF EXISTS idx_saved_business_names_user_created;
DROP INDEX IF EXISTS idx_saved_business_names_user_idea;
DROP INDEX IF EXISTS idx_website_suggestions_website;
DROP INDEX IF EXISTS idx_website_suggestions_user;
DROP INDEX IF EXISTS idx_website_suggestions_website_id;
DROP INDEX IF EXISTS idx_website_suggestions_user_id;
DROP INDEX IF EXISTS idx_website_suggestions_status;
DROP INDEX IF EXISTS idx_marketing_playbook_user_id;
