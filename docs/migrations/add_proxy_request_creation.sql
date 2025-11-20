-- Migration: Add proxy request creation support
-- Description: Adds requested_by and created_on_behalf columns to support super admins creating requests on behalf of Account Managers
-- Date: 2025-01-20

-- Step 1: Add new columns to requests table
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_on_behalf BOOLEAN DEFAULT FALSE;

-- Step 2: Backfill existing data (set requested_by = created_by for existing requests)
UPDATE requests 
SET requested_by = created_by, 
    created_on_behalf = FALSE 
WHERE requested_by IS NULL;

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS idx_requests_requested_by ON requests(requested_by);

-- Step 4: Add comments for documentation
COMMENT ON COLUMN requests.requested_by IS 'The Account Manager who actually needs this request (may differ from created_by if created by super admin)';
COMMENT ON COLUMN requests.created_on_behalf IS 'TRUE if a super admin created this request on behalf of an Account Manager';

-- Step 5: Update RLS Policies

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their requests" ON requests;
DROP POLICY IF EXISTS "Users can view requests they created or requested" ON requests;

-- Create new comprehensive SELECT policy
CREATE POLICY "Users can view requests they created or requested"
ON requests FOR SELECT
USING (
  auth.uid() = created_by OR 
  auth.uid() = requested_by OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_app_meta_data->>'is_super_admin' = 'true'
  ) OR
  EXISTS (
    SELECT 1 FROM request_assignments 
    WHERE request_assignments.request_id = requests.id 
    AND request_assignments.user_id = auth.uid()
  )
);

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Account Managers can create requests" ON requests;
DROP POLICY IF EXISTS "Account Managers and Super Admins can create requests" ON requests;

-- Create new INSERT policy
CREATE POLICY "Account Managers and Super Admins can create requests"
ON requests FOR INSERT
WITH CHECK (
  -- Regular Account Managers creating for themselves
  (
    auth.uid() = created_by AND
    auth.uid() = requested_by AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'ACCOUNT_MANAGER'
    )
  )
  OR
  -- Super Admins creating on behalf of Account Managers
  (
    auth.uid() = created_by AND
    created_on_behalf = TRUE AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'is_super_admin' = 'true'
    ) AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = requested_by 
      AND user_roles.role = 'ACCOUNT_MANAGER'
    )
  )
);

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their requests" ON requests;
DROP POLICY IF EXISTS "Users can update requests they created or requested" ON requests;

-- Create new UPDATE policy
CREATE POLICY "Users can update requests they created or requested"
ON requests FOR UPDATE
USING (
  auth.uid() = created_by OR 
  auth.uid() = requested_by OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_app_meta_data->>'is_super_admin' = 'true'
  )
);

-- Step 6: Verify the migration
DO $$
BEGIN
  -- Check if columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'requested_by'
  ) THEN
    RAISE EXCEPTION 'Migration failed: requested_by column not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'created_on_behalf'
  ) THEN
    RAISE EXCEPTION 'Migration failed: created_on_behalf column not created';
  END IF;

  RAISE NOTICE 'Migration completed successfully';
END $$;
