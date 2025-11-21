-- FINAL FIX for Infinite Recursion
-- We will drop ALL relevant policies and re-create them with a guaranteed loop-breaker.

-- 1. Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can view their own requests" ON requests;
DROP POLICY IF EXISTS "Users can view assignments" ON request_assignments;
DROP POLICY IF EXISTS "Users can view comments based on role" ON request_comments;
DROP POLICY IF EXISTS "Users can create comments" ON request_comments;

-- 2. Create (or replace) the SECURITY DEFINER function
-- This function checks if a user is the Creator or Requester of a request.
-- IMPORTANT: SECURITY DEFINER means it runs with the permissions of the function creator (admin),
-- explicitly BYPASSING RLS on the 'requests' table. This breaks the loop.
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

-- 3. Policy for REQUESTS
-- Users can see a request if:
-- a) They created it or requested it
-- b) They are assigned to it (as BDR)
-- c) They are an ADMIN
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

-- 4. Policy for REQUEST_ASSIGNMENTS
-- Users can see an assignment if:
-- a) It is THEIR assignment
-- b) They are the Creator/Requester of the request (uses FUNCTION to avoid recursion)
-- c) They are an ADMIN
CREATE POLICY "Users can view assignments" ON request_assignments
    FOR SELECT USING (
        user_id = auth.uid()
        OR public.is_request_owner(request_id, auth.uid())
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 5. Policy for REQUEST_COMMENTS
-- Users can see comments if:
-- a) They are an ADMIN
-- b) They are the Assigned BDR
-- c) They are the Creator/Requester (uses FUNCTION for consistency, though not strictly needed for recursion here)
CREATE POLICY "Users can view comments based on role" ON request_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
        OR EXISTS (
            SELECT 1 FROM request_assignments ra
            WHERE ra.request_id = request_comments.request_id 
            AND ra.user_id = auth.uid()
            AND ra.role = 'BDR'
        )
        OR public.is_request_owner(request_id, auth.uid())
    );

-- 6. Create Policy for REQUEST_COMMENTS
CREATE POLICY "Users can create comments" ON request_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND (
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
            OR EXISTS (
                SELECT 1 FROM request_assignments ra
                WHERE ra.request_id = request_comments.request_id 
                AND ra.user_id = auth.uid()
                AND ra.role = 'BDR'
            )
            OR public.is_request_owner(request_id, auth.uid())
        )
    );
