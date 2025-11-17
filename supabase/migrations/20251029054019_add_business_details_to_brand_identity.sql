/*
  # Add Business Details to Brand Identity

  1. Changes
    - Add `offer_description` column to store what the business offers
    - Add `target_audience` column to store the target audience
    - Add `brand_keywords` column to store brand keywords/descriptors
  
  2. Notes
    - These fields are filled in step 1 of the brand identity process
    - They provide context for generating business names and other brand elements
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_identity' AND column_name = 'offer_description'
  ) THEN
    ALTER TABLE brand_identity ADD COLUMN offer_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_identity' AND column_name = 'target_audience'
  ) THEN
    ALTER TABLE brand_identity ADD COLUMN target_audience text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_identity' AND column_name = 'brand_keywords'
  ) THEN
    ALTER TABLE brand_identity ADD COLUMN brand_keywords text;
  END IF;
END $$;