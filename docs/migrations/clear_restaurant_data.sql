-- Clear all restaurant data to start from scratch
-- Run this in Supabase SQL Editor

-- IMPORTANT: This will delete ALL restaurant data!
-- This script temporarily disables RLS to allow deletion

-- Step 1: Temporarily disable RLS on all restaurant tables
ALTER TABLE restaurant_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_cuisines DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete from dependent tables first (to avoid foreign key constraints)
DELETE FROM restaurant_assignments;
DELETE FROM restaurant_contacts;
DELETE FROM restaurant_cuisines;

-- Step 3: Delete from main restaurants table
DELETE FROM restaurants;

-- Step 4: Re-enable RLS (keep it disabled for now since we're testing)
-- Uncomment these lines when you're ready to re-enable RLS:
-- ALTER TABLE restaurant_assignments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE restaurant_contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE restaurant_cuisines ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify deletion
SELECT 
    'restaurants' as table_name, 
    COUNT(*) as remaining_rows 
FROM restaurants
UNION ALL
SELECT 
    'restaurant_cuisines' as table_name, 
    COUNT(*) as remaining_rows 
FROM restaurant_cuisines
UNION ALL
SELECT 
    'restaurant_contacts' as table_name, 
    COUNT(*) as remaining_rows 
FROM restaurant_contacts
UNION ALL
SELECT 
    'restaurant_assignments' as table_name, 
    COUNT(*) as remaining_rows 
FROM restaurant_assignments;

-- Expected result: All counts should be 0
