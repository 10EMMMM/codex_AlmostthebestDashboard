-- Check current user's super admin status
-- Run this in your Supabase SQL editor

-- 1. Check if you have the is_super_admin flag in auth.users
SELECT 
    id,
    email,
    raw_app_meta_data,
    raw_app_meta_data->>'is_super_admin' as is_super_admin_flag
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE';  -- Replace with your email

-- 2. Check user_roles table
SELECT 
    ur.user_id,
    ur.role,
    p.display_name,
    p.email
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
WHERE p.email = 'YOUR_EMAIL_HERE';  -- Replace with your email

-- 3. To SET super admin flag (if you need to add it):
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"is_super_admin": true}'::jsonb
-- WHERE email = 'YOUR_EMAIL_HERE';
