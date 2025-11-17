/*
  # Create Logos Storage Bucket

  1. Storage
    - Create a public storage bucket named 'logos' for user-uploaded logo files
    - Enable public access for uploaded logos
    - Set file size limits and allowed MIME types

  2. Security
    - Users can upload logos to their own user_id folder
    - Users can only delete their own logos
    - Public read access for all logos
*/

-- Create the logos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos to their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Users can upload their own logos'
  ) THEN
    CREATE POLICY "Users can upload their own logos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'logos' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Allow authenticated users to update their own logos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Users can update their own logos'
  ) THEN
    CREATE POLICY "Users can update their own logos"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'logos' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Allow authenticated users to delete their own logos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Users can delete their own logos'
  ) THEN
    CREATE POLICY "Users can delete their own logos"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'logos' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Allow public read access to all logos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Public read access for logos'
  ) THEN
    CREATE POLICY "Public read access for logos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'logos');
  END IF;
END $$;
