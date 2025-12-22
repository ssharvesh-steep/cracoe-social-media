-- ============================================
-- STORAGE BUCKET SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the 'media' and 'avatars' buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true), ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security for the 'media' bucket
-- Note: 'storage.objects' is the table where files are tracked

-- 1. Allow public access to view media and avatars
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id IN ('media', 'avatars') );

-- 2. Allow authenticated users to upload media and avatars
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('media', 'avatars') 
    AND auth.role() = 'authenticated'
  );

-- 3. Allow users to update/delete their own media and avatars
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
CREATE POLICY "Users can update their own media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('media', 'avatars') 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('media', 'avatars') 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Success message
SELECT 'Media bucket and storage policies setup complete! ✅' AS status;
