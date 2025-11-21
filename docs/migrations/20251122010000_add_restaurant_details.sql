-- Migration: Add Yelp-style restaurant details (IDEMPOTENT VERSION)
-- Created: 2025-11-22
-- Description: Adds price range, Yelp link, reviews, ratings, and photo support
-- This version is safe to re-run

-- ============================================
-- STEP 1: Add columns to restaurants table
-- ============================================

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS price_range INTEGER CHECK (price_range BETWEEN 1 AND 4);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS yelp_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) CHECK (average_rating BETWEEN 0 AND 5);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS primary_photo_url TEXT;

-- Add comments for clarity
COMMENT ON COLUMN restaurants.price_range IS 'Price range: 1=$, 2=$$, 3=$$$, 4=$$$$';
COMMENT ON COLUMN restaurants.yelp_url IS 'Link to Yelp business page';
COMMENT ON COLUMN restaurants.average_rating IS 'Average rating from 0.0 to 5.0';
COMMENT ON COLUMN restaurants.total_reviews IS 'Total number of reviews';
COMMENT ON COLUMN restaurants.primary_photo_url IS 'Main restaurant photo URL';

-- ============================================
-- STEP 2: Create restaurant_photos table
-- ============================================

CREATE TABLE IF NOT EXISTS restaurant_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    category VARCHAR(50), -- 'food', 'interior', 'exterior', 'menu', 'drink', 'other'
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_photos_restaurant ON restaurant_photos(restaurant_id, display_order);
CREATE INDEX IF NOT EXISTS idx_restaurant_photos_primary ON restaurant_photos(restaurant_id, is_primary);

-- ============================================
-- STEP 3: Create restaurant_reviews table
-- ============================================

CREATE TABLE IF NOT EXISTS restaurant_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    source VARCHAR(50) DEFAULT 'internal', -- 'internal', 'yelp', 'google', etc.
    external_review_id TEXT, -- ID from external source
    reviewer_name TEXT, -- For external reviews
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_restaurant ON restaurant_reviews(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_user ON restaurant_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_rating ON restaurant_reviews(restaurant_id, rating);

-- ============================================
-- STEP 4: Enable RLS on new tables
-- ============================================

ALTER TABLE restaurant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create RLS Policies (DROP IF EXISTS)
-- ============================================

-- Photos policies
DROP POLICY IF EXISTS "Users can view restaurant photos" ON restaurant_photos;
CREATE POLICY "Users can view restaurant photos" ON restaurant_photos
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can upload restaurant photos" ON restaurant_photos;
CREATE POLICY "Users can upload restaurant photos" ON restaurant_photos
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Users can update own photos" ON restaurant_photos;
CREATE POLICY "Users can update own photos" ON restaurant_photos
    FOR UPDATE USING (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Users can delete own photos" ON restaurant_photos;
CREATE POLICY "Users can delete own photos" ON restaurant_photos
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Reviews policies
DROP POLICY IF EXISTS "Users can view restaurant reviews" ON restaurant_reviews;
CREATE POLICY "Users can view restaurant reviews" ON restaurant_reviews
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create reviews" ON restaurant_reviews;
CREATE POLICY "Users can create reviews" ON restaurant_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON restaurant_reviews;
CREATE POLICY "Users can update own reviews" ON restaurant_reviews
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON restaurant_reviews;
CREATE POLICY "Users can delete own reviews" ON restaurant_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: Create trigger to update average rating
-- ============================================

CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE restaurants
    SET 
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM restaurant_reviews
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM restaurant_reviews
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
        )
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_restaurant_rating ON restaurant_reviews;
CREATE TRIGGER trigger_update_restaurant_rating
    AFTER INSERT OR UPDATE OR DELETE ON restaurant_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_rating();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✓ Restaurant details migration complete!';
    RAISE NOTICE 'Added columns: price_range, yelp_url, average_rating, total_reviews, primary_photo_url';
    RAISE NOTICE 'Created tables: restaurant_photos, restaurant_reviews';
    RAISE NOTICE 'Rating auto-updates enabled via trigger';
END $$;
