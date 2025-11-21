-- Pre-Migration Check and Setup Script
-- Run this BEFORE running the main migration

-- ============================================
-- STEP 1: Check if required tables exist
-- ============================================

DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check for requests table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'requests') THEN
        missing_tables := array_append(missing_tables, 'requests');
    END IF;
    
    -- Check for user_roles table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        missing_tables := array_append(missing_tables, 'user_roles');
    END IF;
    
    -- Check for request_assignments table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'request_assignments') THEN
        missing_tables := array_append(missing_tables, 'request_assignments');
    END IF;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing required tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All required tables exist ✓';
    END IF;
END $$;

-- ============================================
-- STEP 2: Create user_feature_flags if needed
-- ============================================

CREATE TABLE IF NOT EXISTS user_feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_flag VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, feature_flag)
);

-- Enable RLS
ALTER TABLE user_feature_flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own feature flags" ON user_feature_flags;
DROP POLICY IF EXISTS "Admins can manage feature flags" ON user_feature_flags;

-- Policy: Users can view their own feature flags
CREATE POLICY "Users can view own feature flags" ON user_feature_flags
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can manage all feature flags
CREATE POLICY "Admins can manage feature flags" ON user_feature_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_user ON user_feature_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag ON user_feature_flags(feature_flag);

-- ============================================
-- STEP 3: Grant yourself super_admin access
-- ============================================

-- Get current user ID
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        -- Grant ADMIN role
        INSERT INTO user_roles (user_id, role)
        VALUES (current_user_id, 'ADMIN')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Grant view_comments feature flag
        INSERT INTO user_feature_flags (user_id, feature_flag, is_enabled)
        VALUES (current_user_id, 'view_comments', true)
        ON CONFLICT (user_id, feature_flag) DO UPDATE SET is_enabled = true;
        
        RAISE NOTICE 'Granted super_admin role and view_comments flag to user: %', current_user_id;
    ELSE
        RAISE NOTICE 'No authenticated user found. You may need to grant permissions manually.';
    END IF;
END $$;

-- ============================================
-- STEP 4: Verify setup
-- ============================================

SELECT 
    'user_feature_flags' as table_name,
    COUNT(*) as row_count
FROM user_feature_flags
UNION ALL
SELECT 
    'user_roles' as table_name,
    COUNT(*) as row_count
FROM user_roles;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✓ Pre-migration setup complete!';
    RAISE NOTICE 'You can now run the main migration: 20251121170049_add_request_comments.sql';
END $$;
