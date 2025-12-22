-- ============================================
-- CREATE DEFAULT ADMIN ACCOUNT
-- Run this in Supabase SQL Editor
-- ============================================

-- First, you need to create the admin user in Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Use these credentials:
--    Email: sharveshadmin@gmail.com
--    Password: 9843147333
-- 4. Click "Create User"

-- Then run this SQL to make them admin:
UPDATE public.profiles
SET is_admin = true
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'sharveshadmin@gmail.com'
    LIMIT 1
);

-- Verify the admin was created
SELECT 
    p.id,
    p.username,
    p.full_name,
    au.email,
    p.is_admin,
    p.created_at
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email = 'sharveshadmin@gmail.com';

-- Success message
SELECT '✅ Admin account setup complete!' AS status;
SELECT 'Email: sharveshadmin@gmail.com' AS email;
SELECT 'Password: 9843147333' AS password;
SELECT 'Access at: http://localhost:3000/admin' AS url;
