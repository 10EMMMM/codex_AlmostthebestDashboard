-- Script to add BDR users to your system
-- Run this in your Supabase SQL Editor

-- Step 1: View all existing users
SELECT 
    u.id as user_id,
    u.email,
    p.display_name,
    COALESCE(
        (SELECT string_agg(role::text, ', ') 
         FROM user_roles ur 
         WHERE ur.user_id = u.id), 
        'No roles'
    ) as current_roles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.email;

-- Step 2: Add BDR role to a specific user
-- UNCOMMENT and replace 'user@example.com' with the actual email
/*
INSERT INTO user_roles (user_id, role)
SELECT id, 'BDR'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
*/

-- Step 3: Verify BDR users
SELECT 
    u.email,
    p.display_name,
    ur.role
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
LEFT JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.role = 'BDR'
ORDER BY p.display_name;

-- Step 4: (Optional) Remove BDR role from a user
-- UNCOMMENT and replace 'user@example.com' with the actual email
/*
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com')
AND role = 'BDR';
*/
