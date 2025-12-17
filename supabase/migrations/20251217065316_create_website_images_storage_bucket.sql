/*
  # Create storage bucket for user-uploaded website images

  1. Storage
    - Create `website-images` bucket for user uploads
    - Enable public access for uploaded images
    - Set up RLS policies for authenticated users

  2. Security
    - Users can upload images to their own folder
    - Users can view all public images
    - Users can delete their own images
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-images', 'website-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload website images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'website-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view all public images
CREATE POLICY "Anyone can view website images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'website-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own website images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'website-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update own website images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'website-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'website-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);