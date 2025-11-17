/*
  # Add completed_steps column to websites table

  1. Changes
    - Add `completed_steps` column (text array) to track progress through website builder steps
    - Also rename `stripe_payment_link` to `payment_link` for consistency
  
  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Default value is empty array
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websites' AND column_name = 'completed_steps'
  ) THEN
    ALTER TABLE websites ADD COLUMN completed_steps text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websites' AND column_name = 'stripe_payment_link'
  ) THEN
    ALTER TABLE websites RENAME COLUMN stripe_payment_link TO payment_link;
  END IF;
END $$;
