-- Add created_by column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add comment to explain the column
COMMENT ON COLUMN restaurants.created_by IS 'The user who physically created the record (e.g. Admin), distinct from onboarded_by (the assigned BDR)';

-- Update RLS policies to allow creators to see their own created restaurants (if needed)
-- For now, existing policies cover BDRs and Admins, but we might want to ensure creators can always see what they created.
-- However, Admins can see everything anyway.

-- Grant permissions if necessary (usually handled by existing grants on table)
