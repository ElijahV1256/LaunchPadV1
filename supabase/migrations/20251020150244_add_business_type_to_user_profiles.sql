/*
  # Add business type preferences to user profiles

  1. Changes
    - Add `business_type` column to `user_profiles` table to store user's preferred business model
    - Supports multiple types: service-based, online, product-based, local, consulting, etc.
  
  2. Purpose
    - Helps AI generate more targeted business ideas based on user preferences
    - Allows users to specify what type of business they want to start
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'business_type'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN business_type text DEFAULT 'any';
  END IF;
END $$;
