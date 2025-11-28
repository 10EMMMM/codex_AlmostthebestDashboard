-- Re-enable RLS and apply proper policies for restaurants
-- Run this after confirming restaurant creation works with RLS disabled

-- Step 1: Re-enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_contacts ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies
DROP POLICY IF EXISTS "restaurants_insert_policy" ON restaurants;
DROP POLICY IF EXISTS "restaurants_select_policy" ON restaurants;
DROP POLICY IF EXISTS "restaurants_update_policy" ON restaurants;
DROP POLICY IF EXISTS "restaurant_cuisines_insert_policy" ON restaurant_cuisines;
DROP POLICY IF EXISTS "restaurant_cuisines_select_policy" ON restaurant_cuisines;
DROP POLICY IF EXISTS "restaurant_contacts_insert_policy" ON restaurant_contacts;
DROP POLICY IF EXISTS "restaurant_contacts_select_policy" ON restaurant_contacts;
DROP POLICY IF EXISTS "restaurant_contacts_update_policy" ON restaurant_contacts;

-- Step 3: Create INSERT policies (BDR and ADMIN can create)
CREATE POLICY "restaurants_insert_policy" ON restaurants
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('BDR', 'ADMIN')
            AND user_roles.archived_at IS NULL
        )
    );

CREATE POLICY "restaurant_cuisines_insert_policy" ON restaurant_cuisines
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('BDR', 'ADMIN')
            AND user_roles.archived_at IS NULL
        )
    );

CREATE POLICY "restaurant_contacts_insert_policy" ON restaurant_contacts
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('BDR', 'ADMIN')
            AND user_roles.archived_at IS NULL
        )
    );

-- Step 4: Create SELECT policies (everyone can view)
CREATE POLICY "restaurants_select_policy" ON restaurants
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "restaurant_cuisines_select_policy" ON restaurant_cuisines
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "restaurant_contacts_select_policy" ON restaurant_contacts
    FOR SELECT TO authenticated
    USING (true);

-- Step 5: Create UPDATE policies (BDR and ADMIN can update)
CREATE POLICY "restaurants_update_policy" ON restaurants
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('BDR', 'ADMIN')
            AND user_roles.archived_at IS NULL
        )
    );

CREATE POLICY "restaurant_contacts_update_policy" ON restaurant_contacts
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('BDR', 'ADMIN')
            AND user_roles.archived_at IS NULL
        )
    );

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('restaurants', 'restaurant_cuisines', 'restaurant_contacts')
ORDER BY tablename, cmd, policyname;
