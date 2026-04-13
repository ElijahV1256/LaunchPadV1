/*
  # Add brand personality field to brand_identity

  1. Changes
    - Add `brand_personality` column (jsonb) to store selected personality traits (array of strings)
    - Add `color_palettes` column (jsonb) to store AI-generated color palette options

  2. Notes
    - brand_personality stores an array like ["Bold & Confident", "Smart & Expert"]
    - color_palettes stores AI-generated palette objects with name, mood, colors
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_identity' AND column_name = 'brand_personality'
  ) THEN
    ALTER TABLE brand_identity ADD COLUMN brand_personality jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_identity' AND column_name = 'color_palettes'
  ) THEN
    ALTER TABLE brand_identity ADD COLUMN color_palettes jsonb;
  END IF;
END $$;
