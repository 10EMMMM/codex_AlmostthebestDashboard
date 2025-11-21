-- Comprehensive RLS Fix
-- Ensures users can read Requests, Assignments, and Comments they are involved in.

-- 1. REQUESTS TABLE
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own requests" ON requests;
CREATE POLICY "Users can view their own requests" ON requests
    FOR SELECT USING (
        -- Creator or Requester
        auth.uid() = created_by 
        OR auth.uid() = requester_id
        -- Assigned BDR
        OR EXISTS (
            SELECT 1 FROM request_assignments ra 
            WHERE ra.request_id = id 
            AND ra.user_id = auth.uid()
        )
        -- Admin
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 2. REQUEST ASSIGNMENTS TABLE
ALTER TABLE request_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view assignments" ON request_assignments;
CREATE POLICY "Users can view assignments" ON request_assignments
    FOR SELECT USING (
        -- The assigned user themselves
        user_id = auth.uid()
        -- The request owner/creator (needs to see who is assigned)
        OR EXISTS (
            SELECT 1 FROM requests r
            WHERE r.id = request_id
            AND (r.created_by = auth.uid() OR r.requester_id = auth.uid())
        )
        -- Admin
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 3. REQUEST COMMENTS TABLE
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view comments based on role" ON request_comments;
CREATE POLICY "Users can view comments based on role" ON request_comments
    FOR SELECT USING (
        -- Admin
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
        -- Assigned BDR
        OR EXISTS (
            SELECT 1 FROM request_assignments ra
            WHERE ra.request_id = request_comments.request_id 
            AND ra.user_id = auth.uid()
            AND ra.role = 'BDR'
        )
        -- Requester or Creator
        OR EXISTS (
            SELECT 1 FROM requests r
            WHERE r.id = request_comments.request_id
            AND (r.requester_id = auth.uid() OR r.created_by = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can create comments" ON request_comments;
CREATE POLICY "Users can create comments" ON request_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Admin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
            -- Assigned BDR
            OR EXISTS (
                SELECT 1 FROM request_assignments ra
                WHERE ra.request_id = request_comments.request_id 
                AND ra.user_id = auth.uid()
                AND ra.role = 'BDR'
            )
            -- Requester or Creator
            OR EXISTS (
                SELECT 1 FROM requests r
                WHERE r.id = request_comments.request_id
                AND (r.requester_id = auth.uid() OR r.created_by = auth.uid())
            )
        )
    );

-- 4. USER ROLES (Ensure readability)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (user_id = auth.uid());
