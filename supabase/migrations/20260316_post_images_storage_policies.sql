-- Storage policies for post_images bucket
-- Run this after creating the bucket in the Supabase dashboard

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post_images');

-- Anyone can read images (public bucket)
CREATE POLICY "Public can view post images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'post_images');

-- Users can delete their own images (files are stored under their user ID)
CREATE POLICY "Users can delete own post images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'post_images' AND auth.uid()::text = (storage.foldername(name))[1]);
