-- Allow admins to delete any post
-- This policy enables admin users to moderate content by deleting posts

-- First, drop the existing restrictive delete policy
DROP POLICY IF EXISTS "Users can delete their own posts." ON public.posts;

-- Create a new policy that allows users to delete their own posts OR admins to delete any post
CREATE POLICY "Users can delete own posts, admins can delete any post" ON public.posts
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Also update the UPDATE policy to allow admins to edit any post
DROP POLICY IF EXISTS "Users can update their own posts." ON public.posts;

CREATE POLICY "Users can update own posts, admins can update any post" ON public.posts
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
