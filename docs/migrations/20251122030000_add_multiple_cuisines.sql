-- Migration: Add multiple cuisines support for restaurants
-- Created: 2025-11-22
-- Description: Creates junction table for many-to-many relationship between restaurants and cuisines

-- ============================================
-- STEP 1: Create restaurant_cuisines junction table
-- ============================================

CREATE TABLE IF NOT EXISTS restaurant_cuisines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    cuisine_id UUID NOT NULL REFERENCES cuisines(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure no duplicate cuisine assignments
    UNIQUE(restaurant_id, cuisine_id)
);

-- Add comments for clarity
COMMENT ON TABLE restaurant_cuisines IS 'Junction table for many-to-many relationship between restaurants and cuisines';
COMMENT ON COLUMN restaurant_cuisines.is_primary IS 'Marks the primary cuisine for the restaurant';
COMMENT ON COLUMN restaurant_cuisines.display_order IS 'Order in which cuisines should be displayed (0 = first)';

-- ============================================
-- STEP 2: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_restaurant_cuisines_restaurant ON restaurant_cuisines(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_cuisines_cuisine ON restaurant_cuisines(cuisine_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_cuisines_primary ON restaurant_cuisines(restaurant_id, is_primary);

-- ============================================
-- STEP 3: Enable RLS
-- ============================================

ALTER TABLE restaurant_cuisines ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS Policies
-- ============================================

-- Users can view restaurant cuisines
DROP POLICY IF EXISTS "Users can view restaurant cuisines" ON restaurant_cuisines;
CREATE POLICY "Users can view restaurant cuisines"
    ON restaurant_cuisines FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Users can manage restaurant cuisines (insert, update, delete)
DROP POLICY IF EXISTS "Users can manage restaurant cuisines" ON restaurant_cuisines;
CREATE POLICY "Users can manage restaurant cuisines"
    ON restaurant_cuisines FOR ALL
    USING (
        -- User is assigned to this restaurant OR user is super admin
        EXISTS (
            SELECT 1 FROM restaurant_assignments ra
            WHERE ra.restaurant_id = restaurant_cuisines.restaurant_id
            AND ra.user_id = auth.uid()
        )
        OR
        -- Check if user has super_admin role from user_roles table
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'ADMIN'
        )
    );

-- ============================================
-- STEP 5: Migrate existing data
-- ============================================

-- Copy existing primary_cuisine_id to junction table
INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id, is_primary, display_order)
SELECT id, primary_cuisine_id, true, 0
FROM restaurants
WHERE primary_cuisine_id IS NOT NULL
ON CONFLICT (restaurant_id, cuisine_id) DO NOTHING;

-- ============================================
-- STEP 6: Create helper function to get primary cuisine
-- ============================================

CREATE OR REPLACE FUNCTION get_primary_cuisine_id(p_restaurant_id UUID)
RETURNS UUID AS $$
    SELECT cuisine_id
    FROM restaurant_cuisines
    WHERE restaurant_id = p_restaurant_id
    AND is_primary = true
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✓ Multiple cuisines support migration complete!';
    RAISE NOTICE 'Created table: restaurant_cuisines';
    RAISE NOTICE 'Migrated existing primary cuisines';
    RAISE NOTICE 'Note: primary_cuisine_id column kept for backward compatibility';
END $$;
