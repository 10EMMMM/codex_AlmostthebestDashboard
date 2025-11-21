-- Quick verification script for restaurant_comments tables
-- Run this to verify the migration was successful

-- Check if tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename IN ('restaurant_comments', 'restaurant_comment_mentions', 'restaurant_comment_reactions')
ORDER BY tablename;

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('restaurant_comments', 'restaurant_comment_mentions', 'restaurant_comment_reactions')
ORDER BY tablename;

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('restaurant_comments', 'restaurant_comment_mentions', 'restaurant_comment_reactions')
ORDER BY tablename, indexname;

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('restaurant_comments', 'restaurant_comment_mentions', 'restaurant_comment_reactions')
ORDER BY tablename, policyname;

-- Count rows (should be 0 for new tables)
SELECT 'restaurant_comments' as table_name, COUNT(*) as row_count FROM restaurant_comments
UNION ALL
SELECT 'restaurant_comment_mentions', COUNT(*) FROM restaurant_comment_mentions
UNION ALL
SELECT 'restaurant_comment_reactions', COUNT(*) FROM restaurant_comment_reactions;
