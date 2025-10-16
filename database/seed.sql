-- Seed data for VOD Platform
-- Run this after schema.sql and migration script

-- ==========================================
-- SAMPLE ADMIN USER (Manual creation via Supabase Auth UI recommended)
-- ==========================================
-- After creating a user via Supabase Auth, update their role:
-- UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid-here';

-- ==========================================
-- STUDIOS DATA
-- ==========================================
INSERT INTO studios (name, slug, logo_url, description) VALUES
    ('Disney+', 'disney-plus', '/studios/disney-plus.svg', 'The official home of Disney, Pixar, Marvel, Star Wars, and National Geographic'),
    ('Netflix', 'netflix', '/studios/netflix.svg', 'Watch TV shows and movies online or stream to your smart TV, game console, PC, Mac, mobile, tablet and more'),
    ('HBO Max', 'hbo-max', '/studios/hbo-max.svg', 'Stream all of HBO together with even more favorites from WB, DC, Cartoon Network and more'),
    ('Pixar', 'pixar', '/studios/pixar.svg', 'Pixar Animation Studios - Creating animated feature films'),
    ('Marvel Studios', 'marvel', '/studios/marvel.png', 'Marvel Studios productions featuring superheroes from Marvel Comics'),
    ('Lucasfilm', 'star-wars', '/studios/star-wars.png', 'Home of Star Wars and Indiana Jones'),
    ('National Geographic', 'nat-geo', '/studios/nat-geo.svg', 'Premium documentaries and nature content'),
    ('Warner Bros', 'warner-bros', '/studios/warner-bros.svg', 'Warner Bros. Entertainment productions'),
    ('Universal Pictures', 'universal', '/studios/universal.svg', 'Universal Pictures film productions'),
    ('Paramount', 'paramount', '/studios/paramount.svg', 'Paramount Pictures Corporation')
ON CONFLICT (slug) DO NOTHING;

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
-- SAMPLE MOVIES (for testing - replace URLs with actual content)
-- ==========================================
DO $$
DECLARE
    marvel_studio_id UUID;
    disney_studio_id UUID;
    netflix_studio_id UUID;
    action_cat_id UUID;
    comedy_cat_id UUID;
    scifi_cat_id UUID;
    drama_cat_id UUID;
    adventure_cat_id UUID;
    movie1_id UUID;
    movie2_id UUID;
    movie3_id UUID;
BEGIN
    -- Get studio IDs
    SELECT id INTO marvel_studio_id FROM studios WHERE slug = 'marvel';
    SELECT id INTO disney_studio_id FROM studios WHERE slug = 'disney-plus';
    SELECT id INTO netflix_studio_id FROM studios WHERE slug = 'netflix';
    
    -- Get category IDs
    SELECT id INTO action_cat_id FROM categories WHERE slug = 'action';
    SELECT id INTO comedy_cat_id FROM categories WHERE slug = 'comedy';
    SELECT id INTO scifi_cat_id FROM categories WHERE slug = 'sci-fi';
    SELECT id INTO drama_cat_id FROM categories WHERE slug = 'drama';
    SELECT id INTO adventure_cat_id FROM categories WHERE slug = 'adventure';
    
    -- Insert sample movies
    INSERT INTO movies (
        title, description, video_url, thumbnail_url, poster_url, trailer_url,
        duration, release_year, language, quality, published, featured, studio_id
    ) VALUES
    (
        'Avengers: Infinity War',
        'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos.',
        'https://example.com/videos/avengers.mp4',
        'https://example.com/thumbnails/avengers.jpg',
        'https://example.com/posters/avengers.jpg',
        'https://example.com/trailers/avengers.mp4',
        9060, -- 2h 31m
        2018,
        'en',
        ARRAY['SD', 'HD', '4K'],
        true,
        true,
        marvel_studio_id
    ),
    (
        'The Lion King',
        'Lion prince Simba flees his kingdom after the death of his father, but returns years later to reclaim his throne.',
        'https://example.com/videos/lionking.mp4',
        'https://example.com/thumbnails/lionking.jpg',
        'https://example.com/posters/lionking.jpg',
        'https://example.com/trailers/lionking.mp4',
        5280, -- 1h 28m
        2019,
        'en',
        ARRAY['SD', 'HD', '4K'],
        true,
        false,
        disney_studio_id
    ),
    (
        'Stranger Things: The Movie',
        'The kids of Hawkins face their biggest challenge yet in this feature-length adventure.',
        'https://example.com/videos/stranger.mp4',
        'https://example.com/thumbnails/stranger.jpg',
        'https://example.com/posters/stranger.jpg',
        'https://example.com/trailers/stranger.mp4',
        7200, -- 2h
        2024,
        'en',
        ARRAY['SD', 'HD', '4K'],
        true,
        true,
        netflix_studio_id
    )
    RETURNING id INTO movie1_id;
    
    -- Get movie IDs
    SELECT id INTO movie1_id FROM movies WHERE title = 'Avengers: Infinity War';
    SELECT id INTO movie2_id FROM movies WHERE title = 'The Lion King';
    SELECT id INTO movie3_id FROM movies WHERE title = 'Stranger Things: The Movie';
    
    -- Assign categories to movies
    IF movie1_id IS NOT NULL THEN
        INSERT INTO movie_categories (movie_id, category_id) VALUES 
            (movie1_id, action_cat_id),
            (movie1_id, adventure_cat_id),
            (movie1_id, scifi_cat_id);
    END IF;
    
    IF movie2_id IS NOT NULL THEN
        INSERT INTO movie_categories (movie_id, category_id) VALUES 
            (movie2_id, adventure_cat_id),
            (movie2_id, drama_cat_id);
    END IF;
    
    IF movie3_id IS NOT NULL THEN
        INSERT INTO movie_categories (movie_id, category_id) VALUES 
            (movie3_id, scifi_cat_id),
            (movie3_id, drama_cat_id),
            (movie3_id, adventure_cat_id);
    END IF;
END $$;

-- ==========================================
-- SAMPLE TV SERIES (for testing)
-- ==========================================
DO $$
DECLARE
    netflix_studio_id UUID;
    disney_studio_id UUID;
    series1_id UUID;
    series2_id UUID;
    season1_id UUID;
    season2_id UUID;
    scifi_cat_id UUID;
    drama_cat_id UUID;
    fantasy_cat_id UUID;
BEGIN
    -- Get studio IDs
    SELECT id INTO netflix_studio_id FROM studios WHERE slug = 'netflix';
    SELECT id INTO disney_studio_id FROM studios WHERE slug = 'disney-plus';
    
    -- Get category IDs
    SELECT id INTO scifi_cat_id FROM categories WHERE slug = 'sci-fi';
    SELECT id INTO drama_cat_id FROM categories WHERE slug = 'drama';
    SELECT id INTO fantasy_cat_id FROM categories WHERE slug = 'fantasy';
    
    -- Insert TV Series
    INSERT INTO tv_series (
        title, description, thumbnail_url, poster_url, trailer_url,
        release_year, language, published, featured, studio_id, status
    ) VALUES
    (
        'Stranger Things',
        'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
        'https://example.com/thumbnails/strangerthings.jpg',
        'https://example.com/posters/strangerthings.jpg',
        'https://example.com/trailers/strangerthings.mp4',
        2016,
        'en',
        true,
        true,
        netflix_studio_id,
        'ongoing'
    ),
    (
        'The Mandalorian',
        'The travels of a lone bounty hunter in the outer reaches of the galaxy far from the authority of the New Republic.',
        'https://example.com/thumbnails/mandalorian.jpg',
        'https://example.com/posters/mandalorian.jpg',
        'https://example.com/trailers/mandalorian.mp4',
        2019,
        'en',
        true,
        true,
        disney_studio_id,
        'ongoing'
    )
    RETURNING id INTO series1_id;
    
    -- Get series IDs
    SELECT id INTO series1_id FROM tv_series WHERE title = 'Stranger Things';
    SELECT id INTO series2_id FROM tv_series WHERE title = 'The Mandalorian';
    
    -- Assign categories
    IF series1_id IS NOT NULL THEN
        INSERT INTO series_categories (series_id, category_id) VALUES 
            (series1_id, scifi_cat_id),
            (series1_id, drama_cat_id);
            
        -- Add seasons for Stranger Things
        INSERT INTO seasons (series_id, season_number, title, description, release_year)
        VALUES (series1_id, 1, 'Season 1', 'The disappearance of Will Byers', 2016)
        RETURNING id INTO season1_id;
        
        -- Add episodes for Season 1
        INSERT INTO episodes (season_id, series_id, episode_number, title, description, video_url, thumbnail_url, duration, published)
        VALUES 
            (season1_id, series1_id, 1, 'Chapter One: The Vanishing of Will Byers', 'On his way home from a friend''s house, young Will sees something terrifying.', 'https://example.com/episodes/st-s1e1.mp4', 'https://example.com/thumbnails/st-s1e1.jpg', 2880, true),
            (season1_id, series1_id, 2, 'Chapter Two: The Weirdo on Maple Street', 'Lucas, Mike and Dustin try to talk to the girl they found in the woods.', 'https://example.com/episodes/st-s1e2.mp4', 'https://example.com/thumbnails/st-s1e2.jpg', 3360, true);
    END IF;
    
    IF series2_id IS NOT NULL THEN
        INSERT INTO series_categories (series_id, category_id) VALUES 
            (series2_id, scifi_cat_id),
            (series2_id, adventure_cat_id);
            
        -- Add seasons for The Mandalorian
        INSERT INTO seasons (series_id, season_number, title, description, release_year)
        VALUES (series2_id, 1, 'Season 1', 'The journey begins', 2019)
        RETURNING id INTO season2_id;
        
        -- Add episodes for Season 1
        INSERT INTO episodes (season_id, series_id, episode_number, title, description, video_url, thumbnail_url, duration, published)
        VALUES 
            (season2_id, series2_id, 1, 'Chapter 1: The Mandalorian', 'A Mandalorian bounty hunter tracks a target.', 'https://example.com/episodes/mando-s1e1.mp4', 'https://example.com/thumbnails/mando-s1e1.jpg', 2280, true),
            (season2_id, series2_id, 2, 'Chapter 2: The Child', 'The Mandalorian must protect his mysterious asset.', 'https://example.com/episodes/mando-s1e2.mp4', 'https://example.com/thumbnails/mando-s1e2.jpg', 1920, true);
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

