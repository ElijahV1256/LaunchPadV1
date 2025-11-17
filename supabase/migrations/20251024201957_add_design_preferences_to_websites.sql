/*
  # Add design preferences to websites table

  1. Changes
    - Add `design_preferences` column (JSONB) to store website design questionnaire answers
    - This allows users to specify their design preferences using the same questions as the logo
  
  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Default value is NULL
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websites' AND column_name = 'design_preferences'
  ) THEN
    ALTER TABLE websites ADD COLUMN design_preferences JSONB DEFAULT NULL;
  END IF;
END $$;
