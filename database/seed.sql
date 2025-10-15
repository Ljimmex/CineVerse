-- Seed data for VOD Platform
-- Run this after schema.sql

-- ==========================================
-- SAMPLE ADMIN USER (Manual creation via Supabase Auth UI recommended)
-- ==========================================
-- After creating a user via Supabase Auth, update their role:
-- UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid-here';

-- ==========================================
-- ADDITIONAL CATEGORIES (if needed)
-- ==========================================
INSERT INTO categories (name, slug, description) VALUES
    ('Crime', 'crime', 'Films about criminal activities and investigations'),
    ('Mystery', 'mystery', 'Films involving solving a puzzle or crime'),
    ('Adventure', 'adventure', 'Exciting journeys and quests'),
    ('Western', 'western', 'Films set in the American Old West'),
    ('Music', 'music', 'Films centered around music and musicians'),
    ('War', 'war', 'Films about military conflict'),
    ('Biography', 'biography', 'Films based on real people''s lives'),
    ('History', 'history', 'Films based on historical events'),
    ('Family', 'family', 'Films suitable for all ages'),
    ('Sport', 'sport', 'Films about sports and athletes')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- SAMPLE VIDEOS (for testing - replace URLs with actual content)
-- ==========================================
INSERT INTO videos (
    title, 
    description, 
    video_url, 
    thumbnail_url, 
    poster_url,
    trailer_url,
    duration, 
    release_year, 
    language,
    quality,
    published,
    featured
) VALUES
    (
        'Sample Action Movie',
        'An exciting action-packed thriller that will keep you on the edge of your seat.',
        'https://example.com/videos/sample1.mp4',
        'https://example.com/thumbnails/sample1.jpg',
        'https://example.com/posters/sample1.jpg',
        'https://example.com/trailers/sample1.mp4',
        7200, -- 2 hours
        2023,
        'en',
        ARRAY['SD', 'HD', '4K'],
        true,
        true
    ),
    (
        'Comedy Central',
        'A hilarious comedy that will make you laugh until you cry.',
        'https://example.com/videos/sample2.mp4',
        'https://example.com/thumbnails/sample2.jpg',
        'https://example.com/posters/sample2.jpg',
        'https://example.com/trailers/sample2.mp4',
        5400, -- 90 minutes
        2023,
        'en',
        ARRAY['SD', 'HD'],
        true,
        false
    ),
    (
        'Sci-Fi Adventure',
        'Journey through space and time in this epic science fiction adventure.',
        'https://example.com/videos/sample3.mp4',
        'https://example.com/thumbnails/sample3.jpg',
        'https://example.com/posters/sample3.jpg',
        'https://example.com/trailers/sample3.mp4',
        8100, -- 2h 15m
        2024,
        'en',
        ARRAY['SD', 'HD', '4K'],
        true,
        true
    );

-- Get video IDs for category assignment
DO $$
DECLARE
    action_movie_id UUID;
    comedy_movie_id UUID;
    scifi_movie_id UUID;
    action_cat_id UUID;
    comedy_cat_id UUID;
    scifi_cat_id UUID;
    thriller_cat_id UUID;
BEGIN
    -- Get video IDs
    SELECT id INTO action_movie_id FROM videos WHERE title = 'Sample Action Movie';
    SELECT id INTO comedy_movie_id FROM videos WHERE title = 'Comedy Central';
    SELECT id INTO scifi_movie_id FROM videos WHERE title = 'Sci-Fi Adventure';
    
    -- Get category IDs
    SELECT id INTO action_cat_id FROM categories WHERE slug = 'action';
    SELECT id INTO comedy_cat_id FROM categories WHERE slug = 'comedy';
    SELECT id INTO scifi_cat_id FROM categories WHERE slug = 'sci-fi';
    SELECT id INTO thriller_cat_id FROM categories WHERE slug = 'thriller';
    
    -- Assign categories to videos
    IF action_movie_id IS NOT NULL AND action_cat_id IS NOT NULL THEN
        INSERT INTO video_categories (video_id, category_id) VALUES (action_movie_id, action_cat_id);
    END IF;
    
    IF action_movie_id IS NOT NULL AND thriller_cat_id IS NOT NULL THEN
        INSERT INTO video_categories (video_id, category_id) VALUES (action_movie_id, thriller_cat_id);
    END IF;
    
    IF comedy_movie_id IS NOT NULL AND comedy_cat_id IS NOT NULL THEN
        INSERT INTO video_categories (video_id, category_id) VALUES (comedy_movie_id, comedy_cat_id);
    END IF;
    
    IF scifi_movie_id IS NOT NULL AND scifi_cat_id IS NOT NULL THEN
        INSERT INTO video_categories (video_id, category_id) VALUES (scifi_movie_id, scifi_cat_id);
    END IF;
END $$;

-- ==========================================
-- SUBSCRIPTION PLANS (for reference)
-- ==========================================
-- These should be created in Stripe Dashboard and IDs stored in your app config
-- 
-- Free Plan: $0/month
--   - Limited access (trailers only or ads)
--   - SD quality
--   - 1 device
--
-- Basic Plan: $9.99/month
--   - Full library access
--   - SD quality
--   - 1 device
--
-- Standard Plan: $14.99/month
--   - Full library access
--   - HD quality
--   - 2 devices
--
-- Premium Plan: $19.99/month
--   - Full library access
--   - 4K quality
--   - 4 devices

-- ==========================================
-- NOTES FOR DEVELOPMENT
-- ==========================================
-- 1. Create admin user via Supabase Auth UI first
-- 2. Then update their role: UPDATE profiles SET role = 'admin' WHERE id = 'uuid';
-- 3. Upload actual video files to Supabase Storage
-- 4. Update video URLs in this seed data
-- 5. Configure Stripe products and prices
-- 6. Update environment variables with Stripe IDs

