-- Fix infinite recursion in RLS policies by using a SECURITY DEFINER function

-- 1. Create a secure function to check request ownership
-- This function runs with the privileges of the creator (superuser), bypassing RLS on the 'requests' table.
-- This breaks the recursion loop: request_assignments -> requests -> request_assignments
CREATE OR REPLACE FUNCTION is_request_creator_or_requester(req_id UUID, uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM requests
    WHERE id = req_id
    AND (created_by = uid OR requester_id = uid)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update request_assignments policy to use the secure function
DROP POLICY IF EXISTS "Users can view assignments" ON request_assignments;

CREATE POLICY "Users can view assignments" ON request_assignments
    FOR SELECT USING (
        -- The assigned user themselves
        user_id = auth.uid()
        -- The request owner/creator (using secure function to avoid recursion)
        OR is_request_creator_or_requester(request_id, auth.uid())
        -- Admin
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 3. Ensure requests policy is also correct (no changes needed if it was already correct, but good to reaffirm)
-- The requests policy can still query request_assignments safely because request_assignments policy no longer queries requests directly.
