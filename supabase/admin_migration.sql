-- ============================================
-- ADMIN FEATURES MIGRATION
-- Run this AFTER the main schema.sql
-- ============================================

-- Add admin and banned columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- Create an index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned);

-- Update RLS policies to respect banned status
-- Banned users cannot create posts
DROP POLICY IF EXISTS "Authenticated users can create posts." ON public.posts;
CREATE POLICY "Authenticated users can create posts." ON public.posts
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_banned = true
    )
  );

-- Banned users cannot create comments
DROP POLICY IF EXISTS "Authenticated users can create comments." ON public.comments;
CREATE POLICY "Authenticated users can create comments." ON public.comments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_banned = true
    )
  );

-- Banned users cannot like posts
DROP POLICY IF EXISTS "Authenticated users can toggle likes." ON public.likes;
CREATE POLICY "Authenticated users can toggle likes." ON public.likes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_banned = true
    )
  );

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Admin features added successfully! ✅' AS status;

-- IMPORTANT: To make a user an admin, run this query with their user ID:
-- UPDATE public.profiles SET is_admin = true WHERE id = 'USER_ID_HERE';
