/*
  # Add completed steps tracking to roadmaps

  1. Changes
    - Add `completed_steps` column to `roadmaps` table to store array of completed step IDs
    - Add `updated_at` column to track when roadmap was last modified

  2. Notes
    - Uses text array to store completed step identifiers (e.g., ["0-0", "0-1", "1-0"])
    - These represent stage index and step index combinations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roadmaps' AND column_name = 'completed_steps'
  ) THEN
    ALTER TABLE roadmaps ADD COLUMN completed_steps text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roadmaps' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE roadmaps ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;
