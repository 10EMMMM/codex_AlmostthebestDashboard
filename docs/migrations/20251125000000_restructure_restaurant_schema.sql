-- Migration: Restructure Restaurant Schema
-- Created: 2025-11-25
-- Description: Comprehensive restructure of restaurants and restaurant_contacts tables
--              - Change discount_percentage to TEXT
--              - Make primary_cuisine_id NOT NULL
--              - Add pickup address fields to restaurants
--              - Remove deprecated fields from restaurants
--              - Remove address fields from restaurant_contacts
--              - Add unique constraint for primary contacts

-- ============================================
-- PART 1: Change discount_percentage to TEXT
-- ============================================

-- Change column type from DECIMAL to TEXT
ALTER TABLE restaurants ALTER COLUMN discount_percentage TYPE TEXT USING discount_percentage::text;

-- Update comment
COMMENT ON COLUMN restaurants.discount_percentage IS 'Free-form discount description (e.g., "15% off first order", "20% for orders over $100")';

-- ============================================
-- PART 2: Add Pickup Address Fields
-- ============================================

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS pickup_street TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS pickup_suite TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS pickup_city TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS pickup_state TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS pickup_postal_code TEXT;

-- Add comments
COMMENT ON COLUMN restaurants.pickup_street IS 'Pickup location street address';
COMMENT ON COLUMN restaurants.pickup_suite IS 'Pickup location suite/unit number';
COMMENT ON COLUMN restaurants.pickup_city IS 'Pickup location city';
COMMENT ON COLUMN restaurants.pickup_state IS 'Pickup location state';
COMMENT ON COLUMN restaurants.pickup_postal_code IS 'Pickup location postal/ZIP code';

-- ============================================
-- PART 3: Make Primary Cuisine Required
-- ============================================

-- Note: If there are any restaurants without primary_cuisine_id, this will fail.
-- Since user confirmed no restaurants exist yet, this should be safe.
-- If needed, uncomment the following line to set a default:
-- UPDATE restaurants SET primary_cuisine_id = (SELECT id FROM cuisines LIMIT 1) WHERE primary_cuisine_id IS NULL;

ALTER TABLE restaurants ALTER COLUMN primary_cuisine_id SET NOT NULL;

-- ============================================
-- PART 4: Remove Deprecated Fields from Restaurants
-- ============================================

-- Remove status (moved to separate tracking if needed)
ALTER TABLE restaurants DROP COLUMN IF EXISTS status;

-- Remove onboarding_stage (moved to separate tracking if needed)
ALTER TABLE restaurants DROP COLUMN IF EXISTS onboarding_stage;

-- Remove bdr_target_per_week (not needed)
ALTER TABLE restaurants DROP COLUMN IF EXISTS bdr_target_per_week;

-- Remove price_range (not needed)
ALTER TABLE restaurants DROP COLUMN IF EXISTS price_range;

-- Remove Yelp-related fields (not needed)
ALTER TABLE restaurants DROP COLUMN IF EXISTS yelp_url;
ALTER TABLE restaurants DROP COLUMN IF EXISTS primary_photo_url;
ALTER TABLE restaurants DROP COLUMN IF EXISTS average_rating;
ALTER TABLE restaurants DROP COLUMN IF EXISTS total_reviews;

-- ============================================
-- PART 5: Remove Address Fields from Contacts
-- ============================================

-- Contacts are for people, not locations
-- Pickup address is now on restaurants table
ALTER TABLE restaurant_contacts DROP COLUMN IF EXISTS street;
ALTER TABLE restaurant_contacts DROP COLUMN IF EXISTS suite;
ALTER TABLE restaurant_contacts DROP COLUMN IF EXISTS city;
ALTER TABLE restaurant_contacts DROP COLUMN IF EXISTS state;
ALTER TABLE restaurant_contacts DROP COLUMN IF EXISTS postal_code;

-- ============================================
-- PART 6: Add Unique Constraint for Primary Contact
-- ============================================

-- Ensure only one primary contact per restaurant
-- Using partial unique index (only where is_primary = true)
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_primary_contact 
ON restaurant_contacts (restaurant_id) 
WHERE is_primary = true;

COMMENT ON INDEX idx_restaurant_primary_contact IS 'Ensures only one primary contact per restaurant';

-- ============================================
-- PART 7: Update RLS Policies (if needed)
-- ============================================

-- RLS policies should still work as they reference table-level permissions
-- No changes needed as we're only modifying columns, not access patterns

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✓ Restaurant schema restructure complete!';
    RAISE NOTICE 'Changes applied:';
    RAISE NOTICE '  - discount_percentage changed to TEXT';
    RAISE NOTICE '  - primary_cuisine_id set to NOT NULL';
    RAISE NOTICE '  - Added pickup address fields (pickup_street, pickup_suite, pickup_city, pickup_state, pickup_postal_code)';
    RAISE NOTICE '  - Removed deprecated fields (status, onboarding_stage, bdr_target_per_week, price_range, yelp_url, primary_photo_url, average_rating, total_reviews)';
    RAISE NOTICE '  - Removed address fields from restaurant_contacts (street, suite, city, state, postal_code)';
    RAISE NOTICE '  - Added unique constraint for primary contacts';
END $$;
