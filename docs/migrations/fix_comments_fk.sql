-- Fix Foreign Key Relationships for Comments Feature
-- Problem: API cannot join 'profiles' because FKs point to 'auth.users'
-- Solution: Update FKs to point to 'public.profiles'

-- ============================================
-- STEP 1: Fix request_comments.user_id
-- ============================================

DO $$
DECLARE
    r record;
BEGIN
    -- 1. Find and drop existing FK to auth.users
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'request_comments'::regclass 
        AND confrelid = 'auth.users'::regclass
        AND contype = 'f'
    LOOP
        RAISE NOTICE 'Dropping constraint % on request_comments', r.conname;
        EXECUTE 'ALTER TABLE request_comments DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. Add new FK to public.profiles
-- Note: This assumes all users in request_comments exist in profiles. 
-- If not, this might fail. We'll handle that by creating missing profiles if needed? 
-- For now, let's assume data integrity or that we want it to fail if invalid.
ALTER TABLE request_comments 
ADD CONSTRAINT request_comments_user_id_fkey_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;


-- ============================================
-- STEP 2: Fix comment_mentions.mentioned_user_id
-- ============================================

DO $$
DECLARE
    r record;
BEGIN
    -- 1. Find and drop existing FK to auth.users
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'comment_mentions'::regclass 
        AND confrelid = 'auth.users'::regclass
        AND contype = 'f'
    LOOP
        RAISE NOTICE 'Dropping constraint % on comment_mentions', r.conname;
        EXECUTE 'ALTER TABLE comment_mentions DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. Add new FK to public.profiles
ALTER TABLE comment_mentions 
ADD CONSTRAINT comment_mentions_mentioned_user_id_fkey_profiles 
FOREIGN KEY (mentioned_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;


-- ============================================
-- STEP 3: Verify Relationships
-- ============================================

SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('request_comments', 'comment_mentions')
AND ccu.table_name = 'profiles';
