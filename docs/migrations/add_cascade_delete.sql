-- Migration: Add ON DELETE CASCADE to restaurant related tables
-- Description: Ensures that deleting a restaurant also deletes related assignments, cuisines, and comments.

-- 1. restaurant_assignments
ALTER TABLE restaurant_assignments
DROP CONSTRAINT IF EXISTS restaurant_assignments_restaurant_id_fkey;

ALTER TABLE restaurant_assignments
ADD CONSTRAINT restaurant_assignments_restaurant_id_fkey
    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id)
    ON DELETE CASCADE;

-- 2. restaurant_cuisines (Verify/Re-apply)
ALTER TABLE restaurant_cuisines
DROP CONSTRAINT IF EXISTS restaurant_cuisines_restaurant_id_fkey;

ALTER TABLE restaurant_cuisines
ADD CONSTRAINT restaurant_cuisines_restaurant_id_fkey
    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id)
    ON DELETE CASCADE;

-- 3. restaurant_comments (Verify/Re-apply)
ALTER TABLE restaurant_comments
DROP CONSTRAINT IF EXISTS restaurant_comments_restaurant_id_fkey;

ALTER TABLE restaurant_comments
ADD CONSTRAINT restaurant_comments_restaurant_id_fkey
    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id)
    ON DELETE CASCADE;
