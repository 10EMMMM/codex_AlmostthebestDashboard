-- ============================================
-- SUPABASE DATABASE ENUM AUDIT
-- ============================================
-- Run this in Supabase SQL Editor to audit all ENUMs and actual data

-- 1. CHECK ALL ENUM TYPES IN DATABASE
-- ============================================
SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM 
    pg_type t
JOIN 
    pg_enum e ON t.oid = e.enumtypid
WHERE 
    t.typname IN ('request_status', 'restaurant_status', 'task_status', 'role_type', 'request_type')
GROUP BY 
    t.typname
ORDER BY 
    t.typname;

-- 2. CHECK REQUEST_STATUS ENUM SPECIFICALLY
-- ============================================
SELECT 
    e.enumsortorder as sort_order,
    e.enumlabel as status_value
FROM 
    pg_enum e
JOIN 
    pg_type t ON e.enumtypid = t.oid
WHERE 
    t.typname = 'request_status'
ORDER BY 
    e.enumsortorder;

-- 3. CHECK ACTUAL STATUS VALUES IN REQUESTS TABLE
-- ============================================
SELECT 
    status,
    COUNT(*) as count
FROM 
    public.requests
GROUP BY 
    status
ORDER BY 
    count DESC;

-- 4. CHECK IF THERE ARE ANY INVALID STATUS VALUES
-- ============================================
-- This will show requests with status values that don't match the ENUM
-- (This query will error if all values are valid, which is good!)
SELECT 
    id,
    title,
    status,
    created_at
FROM 
    public.requests
WHERE 
    status NOT IN (
        SELECT enumlabel 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'request_status'
    )
LIMIT 10;

-- 5. CHECK COLUMN DATA TYPE
-- ============================================
SELECT 
    column_name,
    data_type,
    udt_name
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'requests'
    AND column_name = 'status';
