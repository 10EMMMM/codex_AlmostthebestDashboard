-- Fix discount_percentage column type - Version 3
-- Drop and recreate the column as TEXT type

-- Step 1: Drop the existing column (this will lose any existing discount data)
ALTER TABLE restaurants DROP COLUMN IF EXISTS discount_percentage;

-- Step 2: Add it back as TEXT type
ALTER TABLE restaurants ADD COLUMN discount_percentage text;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name = 'discount_percentage';
