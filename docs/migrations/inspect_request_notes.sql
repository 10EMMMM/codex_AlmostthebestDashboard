-- Check existing request_notes table schema
-- Run this in Supabase SQL Editor to see what already exists

-- ============================================
-- Check if request_notes table exists
-- ============================================

SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'request_notes';

-- ============================================
-- Get column details of request_notes
-- ============================================

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'request_notes'
ORDER BY ordinal_position;

-- ============================================
-- Check constraints and foreign keys
-- ============================================

SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'request_notes';

-- ============================================
-- Check indexes
-- ============================================

SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'request_notes';

-- ============================================
-- Check RLS policies
-- ============================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'request_notes';

-- ============================================
-- Sample data (first 5 rows)
-- ============================================

SELECT *
FROM request_notes
LIMIT 5;
