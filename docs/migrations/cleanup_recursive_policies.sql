-- Cleanup conflicting policies that might cause recursion
-- The policy 'requests_select_all_authenticated' likely contains old logic that triggers the recursion loop.
-- We must drop it to allow the new, safe policies to work.

DROP POLICY IF EXISTS "requests_select_all_authenticated" ON requests;

-- Also drop any other potential leftovers just in case
DROP POLICY IF EXISTS "requests_read_own" ON requests;
DROP POLICY IF EXISTS "requests_read_assigned" ON requests;

-- Re-run the safe policies setup just to be absolutely sure they are applied
-- (Copying the logic from fix_recursion_final.sql)

-- 1. Ensure function exists
CREATE OR REPLACE FUNCTION public.is_request_owner(req_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM requests
    WHERE id = req_id
    AND (created_by = user_id OR requester_id = user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-apply Requests Policy (Safe)
DROP POLICY IF EXISTS "Users can view their own requests" ON requests;
CREATE POLICY "Users can view their own requests" ON requests
    FOR SELECT USING (
        auth.uid() = created_by 
        OR auth.uid() = requester_id
        OR EXISTS (
            SELECT 1 FROM request_assignments ra 
            WHERE ra.request_id = id 
            AND ra.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 3. Re-apply Assignments Policy (Safe)
DROP POLICY IF EXISTS "Users can view assignments" ON request_assignments;
CREATE POLICY "Users can view assignments" ON request_assignments
    FOR SELECT USING (
        user_id = auth.uid()
        OR public.is_request_owner(request_id, auth.uid())
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );
