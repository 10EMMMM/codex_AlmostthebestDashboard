-- Check if description column exists and has data in restaurants table

-- 1. Check table schema to see if description column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'restaurants'
  AND column_name = 'description';

-- 2. Check a few sample restaurants to see if they have descriptions
SELECT 
    id,
    name,
    description,
    CASE 
        WHEN description IS NULL THEN 'NULL'
        WHEN description = '' THEN 'EMPTY STRING'
        ELSE 'HAS VALUE'
    END as description_status,
    LENGTH(description) as description_length
FROM restaurants
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 3. Count restaurants with and without descriptions
SELECT 
    COUNT(*) as total_restaurants,
    COUNT(description) as restaurants_with_description,
    COUNT(*) - COUNT(description) as restaurants_without_description,
    ROUND(COUNT(description)::numeric / COUNT(*)::numeric * 100, 2) as percentage_with_description
FROM restaurants
WHERE deleted_at IS NULL;
