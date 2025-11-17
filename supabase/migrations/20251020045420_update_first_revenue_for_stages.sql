/*
  # Update First Revenue Table for Stages Structure

  1. Changes
    - Rename `steps` column to `stages` to better represent the 3-stage structure
    - Add `step_answers` column to store user answers for each task
    - Update data structure to use stages with embedded steps

  2. Notes
    - Each stage contains name, goal, and steps array
    - step_answers stores answers keyed by step text
    - This aligns with StoryBrand 3-stage approach
*/

-- Add step_answers column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'first_revenue' AND column_name = 'step_answers'
  ) THEN
    ALTER TABLE first_revenue ADD COLUMN step_answers jsonb DEFAULT '{}'::jsonb NOT NULL;
  END IF;
END $$;

-- Rename steps column to stages
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'first_revenue' AND column_name = 'steps'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'first_revenue' AND column_name = 'stages'
  ) THEN
    ALTER TABLE first_revenue RENAME COLUMN steps TO stages;
  END IF;
END $$;