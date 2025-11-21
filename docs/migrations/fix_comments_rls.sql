-- Fix RLS policies for request_comments to include Requesters, Creators, and use correct assignments table

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view comments based on role" ON request_comments;
DROP POLICY IF EXISTS "Users can create comments" ON request_comments;

-- Re-create view policy
CREATE POLICY "Users can view comments based on role" ON request_comments
    FOR SELECT USING (
        -- Super admins
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
        OR
        -- Assigned BDRs (using request_assignments table)
        EXISTS (
            SELECT 1 FROM request_assignments ra
            WHERE ra.request_id = request_comments.request_id 
            AND ra.user_id = auth.uid()
            AND ra.role = 'BDR'
        )
        OR
        -- Requester or Creator
        EXISTS (
            SELECT 1 FROM requests r
            WHERE r.id = request_comments.request_id
            AND (r.requester_id = auth.uid() OR r.created_by = auth.uid())
        )
        OR
        -- Users with comment viewing feature flag
        EXISTS (
            SELECT 1 FROM user_feature_flags uff
            WHERE uff.user_id = auth.uid() 
            AND uff.feature_flag = 'view_comments'
            AND uff.is_enabled = true
        )
    );

-- Re-create create policy
CREATE POLICY "Users can create comments" ON request_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Super admins
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
            OR
            -- Assigned BDRs
            EXISTS (
                SELECT 1 FROM request_assignments ra
                WHERE ra.request_id = request_comments.request_id 
                AND ra.user_id = auth.uid()
                AND ra.role = 'BDR'
            )
            OR
            -- Requester or Creator
            EXISTS (
                SELECT 1 FROM requests r
                WHERE r.id = request_comments.request_id
                AND (r.requester_id = auth.uid() OR r.created_by = auth.uid())
            )
            OR
            -- Feature flag
            EXISTS (
                SELECT 1 FROM user_feature_flags uff
                WHERE uff.user_id = auth.uid() 
                AND uff.feature_flag = 'view_comments'
                AND uff.is_enabled = true
            )
        )
    );
