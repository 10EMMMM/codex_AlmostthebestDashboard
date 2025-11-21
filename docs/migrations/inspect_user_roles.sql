-- Inspect user_roles permissions and content

-- 1. Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_roles';

-- 2. List existing policies
SELECT * FROM pg_policies WHERE tablename = 'user_roles';

-- 3. Count BDRs (as a superuser/service role, this should work)
SELECT COUNT(*) as bdr_count FROM user_roles WHERE role = 'BDR';

-- 4. Check if current user has ADMIN role
SELECT * FROM user_roles WHERE user_id = auth.uid();
