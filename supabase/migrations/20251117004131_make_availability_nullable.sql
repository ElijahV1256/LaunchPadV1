/*
  # Make availability column nullable
  
  1. Changes
    - Make `availability` column nullable in `user_profiles` table
    - Set default value to 'Not specified' for existing NULL values
  
  2. Reason
    - The onboarding flow now uses three different questions (interests, problems, budget)
    - The `availability` field is no longer actively used in the new flow
    - Making it nullable prevents form submission errors
*/

-- First, update any NULL values to have a default
UPDATE user_profiles 
SET availability = 'Not specified' 
WHERE availability IS NULL;

-- Then alter the column to be nullable with a default
ALTER TABLE user_profiles 
ALTER COLUMN availability DROP NOT NULL;

ALTER TABLE user_profiles 
ALTER COLUMN availability SET DEFAULT 'Not specified';