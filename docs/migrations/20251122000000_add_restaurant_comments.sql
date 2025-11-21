-- Migration: Add restaurant comments, mentions, and reactions
-- Created: 2025-11-22
-- Description: Implements commenting system for restaurants with threaded discussions, @mentions, and emoji reactions

-- ============================================
-- STEP 1: Create Tables
-- ============================================

-- Restaurant Comments table
CREATE TABLE IF NOT EXISTS restaurant_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_comment_id UUID REFERENCES restaurant_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_edited BOOLEAN DEFAULT FALSE
);

-- Restaurant Comment Mentions table
CREATE TABLE IF NOT EXISTS restaurant_comment_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES restaurant_comments(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, mentioned_user_id)
);

-- Restaurant Comment Reactions table
CREATE TABLE IF NOT EXISTS restaurant_comment_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES restaurant_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, user_id, emoji)
);

-- ============================================
-- STEP 2: Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_restaurant_comments_restaurant ON restaurant_comments(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_comments_user ON restaurant_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_comments_parent ON restaurant_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_comments_deleted ON restaurant_comments(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_restaurant_mentions_user ON restaurant_comment_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_mentions_comment ON restaurant_comment_mentions(comment_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_reactions_comment ON restaurant_comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_reactions_user ON restaurant_comment_reactions(user_id);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================

ALTER TABLE restaurant_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_comment_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_comment_reactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Drop Existing Policies (for re-running)
-- ============================================

DROP POLICY IF EXISTS "Users can view restaurant comments" ON restaurant_comments;
DROP POLICY IF EXISTS "Users can create restaurant comments" ON restaurant_comments;
DROP POLICY IF EXISTS "Users can update own restaurant comments" ON restaurant_comments;
DROP POLICY IF EXISTS "Users can delete own restaurant comments" ON restaurant_comments;
DROP POLICY IF EXISTS "Users can view restaurant mentions" ON restaurant_comment_mentions;
DROP POLICY IF EXISTS "Users can create restaurant mentions" ON restaurant_comment_mentions;
DROP POLICY IF EXISTS "Users can view restaurant reactions" ON restaurant_comment_reactions;
DROP POLICY IF EXISTS "Users can add restaurant reactions" ON restaurant_comment_reactions;
DROP POLICY IF EXISTS "Users can remove own restaurant reactions" ON restaurant_comment_reactions;

-- ============================================
-- STEP 5: Create RLS Policies
-- ============================================

-- Comment visibility: Authenticated users can view non-deleted comments
CREATE POLICY "Users can view restaurant comments" ON restaurant_comments
    FOR SELECT USING (
        deleted_at IS NULL AND
        auth.uid() IS NOT NULL
    );

-- Allow authenticated users to create comments
CREATE POLICY "Users can create restaurant comments" ON restaurant_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() IS NOT NULL
    );

-- Allow users to update their own comments
CREATE POLICY "Users can update own restaurant comments" ON restaurant_comments
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Allow users to soft delete their own comments (or admins can delete any)
CREATE POLICY "Users can delete own restaurant comments" ON restaurant_comments
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Mention policies (inherit comment visibility)
CREATE POLICY "Users can view restaurant mentions" ON restaurant_comment_mentions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM restaurant_comments rc
            WHERE rc.id = restaurant_comment_mentions.comment_id
            AND rc.deleted_at IS NULL
        )
    );

CREATE POLICY "Users can create restaurant mentions" ON restaurant_comment_mentions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM restaurant_comments
            WHERE id = comment_id AND user_id = auth.uid()
        )
    );

-- Reaction policies
CREATE POLICY "Users can view restaurant reactions" ON restaurant_comment_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM restaurant_comments rc
            WHERE rc.id = restaurant_comment_reactions.comment_id
            AND rc.deleted_at IS NULL
        )
    );

CREATE POLICY "Users can add restaurant reactions" ON restaurant_comment_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own restaurant reactions" ON restaurant_comment_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: Enable Realtime (Optional)
-- ============================================

-- Enable realtime for restaurant_comments table
-- Run this in Supabase Dashboard > Database > Replication
-- Or uncomment if you have the extension enabled:
-- ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_comments;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✓ Restaurant comments migration complete!';
    RAISE NOTICE 'Tables created: restaurant_comments, restaurant_comment_mentions, restaurant_comment_reactions';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Enable Realtime replication in Supabase Dashboard';
    RAISE NOTICE '  2. Test RLS policies';
    RAISE NOTICE '  3. Verify indexes are working';
END $$;
