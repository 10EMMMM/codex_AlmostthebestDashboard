-- Fix missing permissions for request_assignments
-- We previously only defined SELECT policies, which prevents assigning (INSERT) or unassigning (DELETE) BDRs.

-- 1. Allow ADMINs to assign users (INSERT)
DROP POLICY IF EXISTS "Admins can assign users" ON request_assignments;
CREATE POLICY "Admins can assign users" ON request_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 2. Allow ADMINs to unassign users (DELETE)
DROP POLICY IF EXISTS "Admins can unassign users" ON request_assignments;
CREATE POLICY "Admins can unassign users" ON request_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 3. Allow ADMINs to update assignments (UPDATE) - just in case
DROP POLICY IF EXISTS "Admins can update assignments" ON request_assignments;
CREATE POLICY "Admins can update assignments" ON request_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );
