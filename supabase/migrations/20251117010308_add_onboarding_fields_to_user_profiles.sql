/*
  # Add Onboarding Fields to User Profiles

  1. Changes
    - Add `onboarding_completed` (boolean) to track if user completed onboarding
    - Add `onboarding_answers` (jsonb) to store detailed multi-step questionnaire responses
  
  2. Notes
    - Uses IF NOT EXISTS to prevent errors if columns already exist
    - Default value for onboarding_completed is false
    - onboarding_answers can store complex nested JSON data structure
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_answers'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_answers jsonb;
  END IF;
END $$;
