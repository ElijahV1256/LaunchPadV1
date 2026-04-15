/*
  # Restrict storage SELECT policies to prevent public file listing

  1. Changes
    - Drop broad SELECT policies on `logos` and `website-images` buckets
      that allow any authenticated user to list ALL files
    - Replace with scoped SELECT policies that only allow users to read
      files in their own folder (folder name = user's auth.uid())

  2. Security
    - Public bucket URLs (via getPublicUrl) still work without any SELECT policy
    - Users can no longer enumerate other users' files via the storage API
    - Upload, update, and delete policies remain unchanged (already scoped to owner)

  3. Notes
    - The application only uses getPublicUrl for reading, never list(),
      so this change has zero functional impact
*/

DROP POLICY IF EXISTS "Authenticated users can read logos by path" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read website images by path" ON storage.objects;

CREATE POLICY "Users can read own logos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own website images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'website-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
