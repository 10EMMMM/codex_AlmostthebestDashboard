-- Fix discount_percentage column type - Version 2
-- This ensures the column is TEXT type to accept descriptive discount text

-- First, check if there's existing data and handle it
DO $$ 
BEGIN
    -- Drop any existing data that might cause issues (optional - comment out if you want to preserve data)
    -- UPDATE restaurants SET discount_percentage = NULL WHERE discount_percentage IS NOT NULL;
    
    -- Change column type from numeric to text
    -- Using USING clause to handle any existing numeric values
    ALTER TABLE restaurants 
    ALTER COLUMN discount_percentage TYPE text 
    USING discount_percentage::text;
    
    RAISE NOTICE 'Successfully changed discount_percentage to text type';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
        RAISE;
END $$;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name = 'discount_percentage';
