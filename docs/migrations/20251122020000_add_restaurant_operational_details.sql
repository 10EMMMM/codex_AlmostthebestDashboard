-- Migration: Add restaurant operational details
-- Created: 2025-11-22
-- Description: Adds discount, box meal, tray options, and earliest pickup time

-- ============================================
-- Add operational columns to restaurants table
-- ============================================

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) CHECK (discount_percentage BETWEEN 0 AND 100);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS offers_box_meals BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS offers_trays BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS earliest_pickup_time TIME;

-- Add comments for clarity
COMMENT ON COLUMN restaurants.discount_percentage IS 'Discount percentage offered (0-100)';
COMMENT ON COLUMN restaurants.offers_box_meals IS 'Whether restaurant offers box meal options';
COMMENT ON COLUMN restaurants.offers_trays IS 'Whether restaurant offers tray/catering options';
COMMENT ON COLUMN restaurants.earliest_pickup_time IS 'Earliest time for pickup orders (e.g., 11:00:00)';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✓ Restaurant operational details migration complete!';
    RAISE NOTICE 'Added columns: discount_percentage, offers_box_meals, offers_trays, earliest_pickup_time';
END $$;
