-- Fix permissions for BDR loading
-- Problem: 'user_roles' table might be locked down or missing policies
-- Solution: Enable RLS and add policies for viewing roles

-- 1. Enable RLS on user_roles (safe to run if already enabled)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow users to view their own role
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Create policy to allow ADMINs to view ALL roles
-- Note: We use a security definer function to avoid infinite recursion
-- (checking if user is admin requires reading user_roles)

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles" ON user_roles
    FOR SELECT USING (public.is_admin());

-- 4. Ensure profiles are readable by authenticated users
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- 5. Create a dummy BDR for testing if none exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'BDR') THEN
        -- Insert a dummy BDR (using a placeholder UUID, might fail if user doesn't exist in auth.users)
        -- So we skip this part to avoid errors. 
        -- Instead, we'll just log a message.
        RAISE NOTICE 'No BDRs found. You may need to assign the BDR role to a user.';
    END IF;
END $$;
