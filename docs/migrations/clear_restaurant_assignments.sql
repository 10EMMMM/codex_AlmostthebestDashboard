-- Clear restaurant_assignments table
-- This table is not part of the restaurant onboarding flow

DELETE FROM restaurant_assignments;

-- Verify deletion
SELECT COUNT(*) as remaining_rows FROM restaurant_assignments;
-- Expected: 0
