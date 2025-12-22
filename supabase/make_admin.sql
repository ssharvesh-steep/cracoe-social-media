-- ============================================
-- MAKE FIRST USER ADMIN
-- Run this after creating your first user account
-- ============================================

-- Option 1: Make a specific user admin by email
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles
SET is_admin = true
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'your-email@example.com'
    LIMIT 1
);

-- Option 2: Make the first created user admin
-- Uncomment this if you want to make the very first user admin
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = (
--     SELECT id FROM public.profiles 
--     ORDER BY created_at ASC 
--     LIMIT 1
-- );

-- Option 3: Make ALL existing users admin (for testing only!)
-- Uncomment this if you want all users to be admin
-- UPDATE public.profiles
-- SET is_admin = true;

-- Verify admin users
SELECT 
    p.id,
    p.username,
    p.full_name,
    au.email,
    p.is_admin,
    p.created_at
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.is_admin = true
ORDER BY p.created_at;

-- Success message
SELECT '✅ Admin status updated! Check the results above.' AS status;
