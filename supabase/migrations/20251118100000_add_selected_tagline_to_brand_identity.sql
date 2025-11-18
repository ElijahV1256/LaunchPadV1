/*
  # Add selected tagline to brand identity

  1. Changes
    - Add `selected_tagline` column to `brand_identity` table to store the chosen tagline for the selected business name

  2. Notes
    - Allows nullable values since existing records won't have taglines
    - Users can generate and regenerate taglines for their selected business name
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_identity' AND column_name = 'selected_tagline'
  ) THEN
    ALTER TABLE brand_identity ADD COLUMN selected_tagline text;
  END IF;
END $$;
