/*
  # Fix duplicate websites and add unique constraint

  1. Changes
    - Remove duplicate rows from websites table (keeping the newest one)
    - Add unique constraint on (user_id, idea_key) to prevent future duplicates
  
  2. Security
    - No changes to RLS policies
*/

-- Remove duplicates, keeping only the most recent entry for each user_id + idea_key combination
DELETE FROM websites a
USING websites b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.idea_key = b.idea_key;

-- Add unique constraint to prevent future duplicates
ALTER TABLE websites 
ADD CONSTRAINT websites_user_id_idea_key_unique 
UNIQUE (user_id, idea_key);
