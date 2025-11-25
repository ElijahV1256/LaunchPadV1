/*
  # Add HTML Code Column to Websites Table

  1. Changes
    - Add `html_code` column to store the generated HTML/Tailwind website
    - This replaces the old `copy`, `theme`, `design_preferences` approach
    - Allows storing the complete generated website code

  2. Notes
    - Using text type to store potentially large HTML documents
    - Column is nullable to support websites not yet generated
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websites' AND column_name = 'html_code'
  ) THEN
    ALTER TABLE websites ADD COLUMN html_code text;
  END IF;
END $$;
