-- Migration: Rename request_notes to request_comments and add new features
-- Created: 2025-11-21
-- Description: Renames existing request_notes table and adds mentions, reactions, threading

-- ============================================
-- STEP 1: Rename existing table
-- ============================================

-- Rename the table
ALTER TABLE IF EXISTS request_notes RENAME TO request_comments;

-- ============================================
-- STEP 1.5: Rename columns to match new schema
-- ============================================

-- Rename author_id -> user_id (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_comments' AND column_name = 'author_id'
    ) THEN
        ALTER TABLE request_comments RENAME COLUMN author_id TO user_id;
    END IF;
END $$;

-- Rename body -> content (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_comments' AND column_name = 'body'
    ) THEN
        ALTER TABLE request_comments RENAME COLUMN body TO content;
    END IF;
END $$;

-- Make user_id NOT NULL if it isn't already (and if no nulls exist)
DO $$
BEGIN
    -- Only attempt if no nulls exist
    IF NOT EXISTS (SELECT 1 FROM request_comments WHERE user_id IS NULL) THEN
        ALTER TABLE request_comments ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- ============================================
-- STEP 2: Add new columns if they don't exist
-- ============================================

-- Add parent_comment_id for threading (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_comments' AND column_name = 'parent_comment_id'
    ) THEN
        ALTER TABLE request_comments 
        ADD COLUMN parent_comment_id UUID REFERENCES request_comments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add is_edited flag (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_comments' AND column_name = 'is_edited'
    ) THEN
        ALTER TABLE request_comments 
        ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add deleted_at for soft deletes (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_comments' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE request_comments 
        ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Ensure updated_at exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_comments' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE request_comments 
        ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- STEP 3: Create mentions table
-- ============================================

CREATE TABLE IF NOT EXISTS comment_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES request_comments(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, mentioned_user_id)
);

-- ============================================
-- STEP 4: Create reactions table
-- ============================================

CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES request_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, user_id, emoji)
);

-- ============================================
-- STEP 5: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_comments_request ON request_comments(request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user ON request_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON request_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_deleted ON request_comments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mentions_user ON comment_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_comment ON comment_mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON comment_reactions(user_id);

-- ============================================
-- STEP 6: Enable Row Level Security
-- ============================================

ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: Drop old policies and create new ones
-- ============================================

-- Drop any existing policies on request_comments (from old request_notes)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'request_comments'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON request_comments', pol.policyname);
    END LOOP;
END $$;

-- Drop policies on new tables
DROP POLICY IF EXISTS "Users can view mentions" ON comment_mentions;
DROP POLICY IF EXISTS "Users can create mentions" ON comment_mentions;
DROP POLICY IF EXISTS "Users can view reactions" ON comment_reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON comment_reactions;
DROP POLICY IF EXISTS "Users can remove own reactions" ON comment_reactions;

-- Comment visibility: super_admin OR assigned BDR OR user with feature flag
CREATE POLICY "Users can view comments based on role" ON request_comments
    FOR SELECT USING (
        -- Admins can see all
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
        OR
        -- Assigned BDR can see comments on their requests
        EXISTS (
            SELECT 1 FROM request_assignments rba
            JOIN requests r ON r.id = rba.request_id
            WHERE r.id = request_comments.request_id 
            AND rba.user_id = auth.uid()
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

-- Allow users to create comments (if they can view them)
CREATE POLICY "Users can create comments" ON request_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND (
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
            OR
            EXISTS (
                SELECT 1 FROM request_assignments rba
                WHERE rba.request_id = request_comments.request_id 
                AND rba.user_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM user_feature_flags uff
                WHERE uff.user_id = auth.uid() 
                AND uff.feature_flag = 'view_comments'
                AND uff.is_enabled = true
            )
        )
    );

-- Allow users to update their own comments
CREATE POLICY "Users can update own comments" ON request_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to soft delete their own comments
CREATE POLICY "Users can delete own comments" ON request_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Mention policies (inherit comment visibility)
CREATE POLICY "Users can view mentions" ON comment_mentions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM request_comments rc
            WHERE rc.id = comment_mentions.comment_id
        )
    );

CREATE POLICY "Users can create mentions" ON comment_mentions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM request_comments
            WHERE id = comment_id AND user_id = auth.uid()
        )
    );

-- Reaction policies
CREATE POLICY "Users can view reactions" ON comment_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM request_comments rc
            WHERE rc.id = comment_reactions.comment_id
        )
    );

CREATE POLICY "Users can add reactions" ON comment_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON comment_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 8: Create/Update trigger for updated_at
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.is_edited = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS update_comment_timestamp ON request_comments;

-- Create new trigger
CREATE TRIGGER update_comment_timestamp
    BEFORE UPDATE ON request_comments
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content)
    EXECUTE FUNCTION update_comment_updated_at();

-- ============================================
-- STEP 9: Add table comments
-- ============================================

COMMENT ON TABLE request_comments IS 'Stores comments and internal notes on requests (renamed from request_notes)';
COMMENT ON TABLE comment_mentions IS 'Tracks @mentions in comments for notifications';
COMMENT ON TABLE comment_reactions IS 'Stores emoji reactions to comments';

-- ============================================
-- STEP 10: Verify migration
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('request_comments', 'comment_mentions', 'comment_reactions');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✓ Migration successful! All 3 tables exist.';
        RAISE NOTICE '  - request_comments (renamed from request_notes)';
        RAISE NOTICE '  - comment_mentions';
        RAISE NOTICE '  - comment_reactions';
    ELSE
        RAISE WARNING 'Migration incomplete. Expected 3 tables, found %', table_count;
    END IF;
END $$;

-- Show final table structure
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('request_comments', 'comment_mentions', 'comment_reactions')
ORDER BY table_name;
