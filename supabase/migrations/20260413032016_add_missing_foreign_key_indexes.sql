/*
  # Add missing foreign key indexes

  1. New Indexes
    - `idx_community_comments_user_id` on `community_comments(user_id)`
    - `idx_community_posts_user_id` on `community_posts(user_id)`
    - `idx_local_analyses_user_id` on `local_analyses(user_id)`
    - `idx_website_bookings_user_id` on `website_bookings(user_id)`

  2. Important Notes
    - These indexes cover foreign keys that were missing indexes
    - Improves JOIN and lookup performance on these columns
*/

CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_local_analyses_user_id ON public.local_analyses (user_id);
CREATE INDEX IF NOT EXISTS idx_website_bookings_user_id ON public.website_bookings (user_id);
