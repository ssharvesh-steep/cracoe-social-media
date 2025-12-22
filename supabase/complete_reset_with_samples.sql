-- ============================================
-- COMPLETE RESET WITH SAMPLE DATA
-- This will delete everything and create fresh sample users
-- ============================================

-- Step 1: Delete all existing users from auth (this cascades to profiles)
-- Note: You need to do this manually in Supabase Dashboard
-- Go to Authentication > Users > Select All > Delete

-- Step 2: Clear all data from tables
TRUNCATE TABLE public.comments CASCADE;
TRUNCATE TABLE public.likes CASCADE;
TRUNCATE TABLE public.posts CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Step 3: Ensure admin columns exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- Step 4: Fix the trigger to handle admin columns
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username, created_at, is_admin, is_banned)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    now(),
    false,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Database reset complete!' AS status;
SELECT '📝 Now create users in Supabase Dashboard or via signup' AS next_step;
SELECT '👤 Recommended: Create sharveshadmin@gmail.com with password 9843147333' AS admin_account;
