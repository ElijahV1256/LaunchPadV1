/*
  # Add Unique Constraint to Marketing Assets

  1. Changes
    - Add unique constraint on (user_id, idea_key) to prevent duplicate entries
  
  2. Notes
    - This ensures each user can only have one marketing_assets record per idea
    - Duplicates have already been cleaned up
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'marketing_assets_user_id_idea_key_unique'
  ) THEN
    ALTER TABLE marketing_assets 
    ADD CONSTRAINT marketing_assets_user_id_idea_key_unique 
    UNIQUE (user_id, idea_key);
  END IF;
END $$;