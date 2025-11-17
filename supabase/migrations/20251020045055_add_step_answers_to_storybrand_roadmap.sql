/*
  # Add Step Answers to StoryBrand Roadmap

  1. Changes
    - Add `step_answers` column to `storybrand_roadmap` table
    - This stores user answers for each step as a key-value object

  2. Notes
    - step_answers is a jsonb object where keys are step text and values are user answers
    - This helps build the overall business plan
*/

-- Add step_answers column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storybrand_roadmap' AND column_name = 'step_answers'
  ) THEN
    ALTER TABLE storybrand_roadmap ADD COLUMN step_answers jsonb DEFAULT '{}'::jsonb NOT NULL;
  END IF;
END $$;