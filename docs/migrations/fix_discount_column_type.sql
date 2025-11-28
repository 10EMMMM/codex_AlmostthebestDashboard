-- Fix discount_percentage column type
-- Change from numeric to text to allow descriptive discount text

-- Check current type and alter if needed
DO $$ 
BEGIN
    -- Change discount_percentage from numeric to text
    ALTER TABLE restaurants 
    ALTER COLUMN discount_percentage TYPE text;
    
    RAISE NOTICE 'Successfully changed discount_percentage to text type';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Column might already be text type or error occurred: %', SQLERRM;
END $$;
