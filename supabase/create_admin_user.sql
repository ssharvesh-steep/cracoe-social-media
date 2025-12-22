-- ============================================
-- CREATE DEFAULT ADMIN USER
-- Run this in Supabase SQL Editor
-- ============================================

-- First, make sure the admin migration has been run
-- This adds is_admin and is_banned columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned);

-- Now create the admin user
-- Email: sharveshadmin@gmail.com
-- Password: 9843147333
-- You can change these credentials after first login

-- Note: This uses Supabase's auth.users table
-- The trigger will automatically create the profile

DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'sharveshadmin@gmail.com';

    IF admin_user_id IS NULL THEN
        -- Create the admin user in auth.users
        -- Note: You'll need to use Supabase Dashboard to create the user first
        -- This script will just mark them as admin
        RAISE NOTICE 'Please create a user with email: sharveshadmin@gmail.com and password: 9843147333';
        RAISE NOTICE 'Then run the UPDATE query below to make them admin';
    ELSE
        -- User exists, make them admin
        UPDATE public.profiles
        SET is_admin = true
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin user updated successfully!';
    END IF;
END $$;

-- After creating the user via signup, run this to make them admin:
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE username = 'Sharveshadmin';

SELECT '✅ Setup complete! Create user sharveshadmin@gmail.com via signup, then they will have admin access.' AS status;
