-- Fix RLS policies for restaurant creation
-- Based on actual database schema scan

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "restaurants_insert_policy" ON restaurants;
DROP POLICY IF EXISTS "restaurant_cuisines_insert_policy" ON restaurant_cuisines;
DROP POLICY IF EXISTS "restaurant_contacts_insert_policy" ON restaurant_contacts;
DROP POLICY IF EXISTS "restaurant_assignments_insert_policy" ON restaurant_assignments;

-- RESTAURANTS table - Allow BDRs and Super Admins to insert
CREATE POLICY "restaurants_insert_policy" ON restaurants
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Allow if user has BDR or ADMIN role in user_roles table
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('BDR', 'ADMIN')
            AND user_roles.archived_at IS NULL
        )
    );

-- RESTAURANT_CUISINES table - Allow insert if user can create restaurants
CREATE POLICY "restaurant_cuisines_insert_policy" ON restaurant_cuisines
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Allow if user has BDR or ADMIN role
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('BDR', 'ADMIN')
            AND user_roles.archived_at IS NULL
        )
    );

-- RESTAURANT_CONTACTS table - Allow insert if user can create restaurants
CREATE POLICY "restaurant_contacts_insert_policy" ON restaurant_contacts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Allow if user has BDR or ADMIN role
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('BDR', 'ADMIN')
            AND user_roles.archived_at IS NULL
        )
    );

-- RESTAURANT_ASSIGNMENTS table - Allow insert if user is Admin
CREATE POLICY "restaurant_assignments_insert_policy" ON restaurant_assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Allow if user is an Admin
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'ADMIN'
            AND user_roles.archived_at IS NULL
        )
    );

-- Verify RLS is enabled
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_assignments ENABLE ROW LEVEL SECURITY;
