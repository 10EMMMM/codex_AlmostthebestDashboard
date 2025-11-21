-- Migration: Add request comments, mentions, and reactions
-- Created: 2025-11-21
-- Description: Implements commenting system with threaded discussions, @mentions, and emoji reactions

-- Comments table
CREATE TABLE IF NOT EXISTS request_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES request_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_edited BOOLEAN DEFAULT FALSE
);

-- Mentions table
CREATE TABLE IF NOT EXISTS comment_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES request_comments(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, mentioned_user_id)
);

-- Reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES request_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, user_id, emoji)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_request ON request_comments(request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user ON request_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON request_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_deleted ON request_comments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mentions_user ON comment_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_comment ON comment_mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON comment_reactions(user_id);

-- Enable Row Level Security
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view comments based on role" ON request_comments;
DROP POLICY IF EXISTS "Users can create comments" ON request_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON request_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON request_comments;
DROP POLICY IF EXISTS "Users can view mentions" ON comment_mentions;
DROP POLICY IF EXISTS "Users can create mentions" ON comment_mentions;
DROP POLICY IF EXISTS "Users can view reactions" ON comment_reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON comment_reactions;
DROP POLICY IF EXISTS "Users can remove own reactions" ON comment_reactions;

-- Comment visibility: super_admin OR assigned BDR OR user with feature flag
CREATE POLICY "Users can view comments based on role" ON request_comments
    FOR SELECT USING (
        -- Super admins can see all
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
        OR
        -- Assigned BDR can see comments on their requests
        EXISTS (
            SELECT 1 FROM request_bdr_assignments rba
            JOIN requests r ON r.id = rba.request_id
            WHERE r.id = request_comments.request_id 
            AND rba.bdr_id = auth.uid()
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
                WHERE user_id = auth.uid() AND role = 'super_admin'
            )
            OR
            EXISTS (
                SELECT 1 FROM request_bdr_assignments rba
                WHERE rba.request_id = request_comments.request_id 
                AND rba.bdr_id = auth.uid()
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.is_edited = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_comment_timestamp ON request_comments;
CREATE TRIGGER update_comment_timestamp
    BEFORE UPDATE ON request_comments
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content)
    EXECUTE FUNCTION update_comment_updated_at();

-- Comments
COMMENT ON TABLE request_comments IS 'Stores comments and internal notes on requests';
COMMENT ON TABLE comment_mentions IS 'Tracks @mentions in comments for notifications';
COMMENT ON TABLE comment_reactions IS 'Stores emoji reactions to comments';
