-- Migration: Restructure from Videos to Movies/TV Series
-- This migration transforms the generic videos table into separate movies and tv_series tables

-- ==========================================
-- STUDIOS TABLE
-- ==========================================
CREATE TABLE studios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- MOVIES TABLE
-- ==========================================
CREATE TABLE movies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    poster_url TEXT,
    trailer_url TEXT,
    duration INTEGER NOT NULL, -- in seconds
    release_year INTEGER,
    language TEXT DEFAULT 'en',
    quality TEXT[] DEFAULT ARRAY['SD', 'HD'],
    published BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    studio_id UUID REFERENCES studios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- TV SERIES TABLE
-- ==========================================
CREATE TABLE tv_series (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    poster_url TEXT,
    trailer_url TEXT,
    release_year INTEGER,
    language TEXT DEFAULT 'en',
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    studio_id UUID REFERENCES studios(id) ON DELETE SET NULL,
    total_seasons INTEGER DEFAULT 0,
    total_episodes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- SEASONS TABLE
-- ==========================================
CREATE TABLE seasons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    series_id UUID REFERENCES tv_series(id) ON DELETE CASCADE NOT NULL,
    season_number INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    release_year INTEGER,
    episode_count INTEGER DEFAULT 0,
    poster_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(series_id, season_number)
);

-- ==========================================
-- EPISODES TABLE
-- ==========================================
CREATE TABLE episodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
    series_id UUID REFERENCES tv_series(id) ON DELETE CASCADE NOT NULL,
    episode_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER NOT NULL, -- in seconds
    published BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(season_id, episode_number)
);

-- ==========================================
-- MOVIE CATEGORIES (Many-to-Many)
-- ==========================================
CREATE TABLE movie_categories (
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, category_id)
);

-- ==========================================
-- SERIES CATEGORIES (Many-to-Many)
-- ==========================================
CREATE TABLE series_categories (
    series_id UUID REFERENCES tv_series(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (series_id, category_id)
);

-- ==========================================
-- MIGRATE EXISTING DATA
-- ==========================================
-- Migrate videos to movies (default migration)
INSERT INTO movies (
    id, title, description, video_url, thumbnail_url, poster_url, 
    trailer_url, duration, release_year, language, quality, 
    published, views_count, featured, created_at, updated_at
)
SELECT 
    id, title, description, video_url, thumbnail_url, poster_url,
    trailer_url, duration, release_year, language, quality,
    published, views_count, featured, created_at, updated_at
FROM videos;

-- Migrate video_categories to movie_categories
INSERT INTO movie_categories (movie_id, category_id)
SELECT video_id, category_id
FROM video_categories;

-- ==========================================
-- UPDATE RATINGS TABLE
-- ==========================================
ALTER TABLE ratings ADD COLUMN content_type TEXT DEFAULT 'movie' CHECK (content_type IN ('movie', 'series', 'episode'));
ALTER TABLE ratings ADD COLUMN content_id UUID;
ALTER TABLE ratings RENAME COLUMN video_id TO legacy_video_id;
ALTER TABLE ratings ALTER COLUMN legacy_video_id DROP NOT NULL;

-- Migrate existing ratings to use content_type and content_id
UPDATE ratings SET content_type = 'movie', content_id = legacy_video_id WHERE legacy_video_id IS NOT NULL;

-- Create index for new structure
CREATE INDEX idx_ratings_content ON ratings(content_type, content_id);

-- ==========================================
-- UPDATE COMMENTS TABLE
-- ==========================================
ALTER TABLE comments ADD COLUMN content_type TEXT DEFAULT 'movie' CHECK (content_type IN ('movie', 'series', 'episode'));
ALTER TABLE comments ADD COLUMN content_id UUID;
ALTER TABLE comments RENAME COLUMN video_id TO legacy_video_id;
ALTER TABLE comments ALTER COLUMN legacy_video_id DROP NOT NULL;

-- Migrate existing comments
UPDATE comments SET content_type = 'movie', content_id = legacy_video_id WHERE legacy_video_id IS NOT NULL;

CREATE INDEX idx_comments_content ON comments(content_type, content_id);

-- ==========================================
-- UPDATE FAVORITES TABLE
-- ==========================================
ALTER TABLE favorites ADD COLUMN content_type TEXT DEFAULT 'movie' CHECK (content_type IN ('movie', 'series'));
ALTER TABLE favorites ADD COLUMN content_id UUID;
ALTER TABLE favorites RENAME COLUMN video_id TO legacy_video_id;
ALTER TABLE favorites ALTER COLUMN legacy_video_id DROP NOT NULL;

-- Migrate existing favorites
UPDATE favorites SET content_type = 'movie', content_id = legacy_video_id WHERE legacy_video_id IS NOT NULL;

CREATE INDEX idx_favorites_content ON favorites(content_type, content_id);
-- Update unique constraint
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_video_id_key;
ALTER TABLE favorites ADD CONSTRAINT favorites_user_content_unique UNIQUE(user_id, content_type, content_id);

-- ==========================================
-- UPDATE WATCH HISTORY TABLE
-- ==========================================
ALTER TABLE watch_history ADD COLUMN content_type TEXT DEFAULT 'movie' CHECK (content_type IN ('movie', 'episode'));
ALTER TABLE watch_history ADD COLUMN content_id UUID;
ALTER TABLE watch_history RENAME COLUMN video_id TO legacy_video_id;
ALTER TABLE watch_history ALTER COLUMN legacy_video_id DROP NOT NULL;

-- Migrate existing watch history
UPDATE watch_history SET content_type = 'movie', content_id = legacy_video_id WHERE legacy_video_id IS NOT NULL;

CREATE INDEX idx_watch_history_content ON watch_history(content_type, content_id);
-- Update unique constraint
ALTER TABLE watch_history DROP CONSTRAINT IF EXISTS watch_history_user_id_video_id_key;
ALTER TABLE watch_history ADD CONSTRAINT watch_history_user_content_unique UNIQUE(user_id, content_type, content_id);

-- ==========================================
-- INDEXES for Performance
-- ==========================================
CREATE INDEX idx_movies_published ON movies(published);
CREATE INDEX idx_movies_featured ON movies(featured);
CREATE INDEX idx_movies_studio_id ON movies(studio_id);
CREATE INDEX idx_movies_title_trgm ON movies USING GIN (title gin_trgm_ops);

CREATE INDEX idx_series_published ON tv_series(published);
CREATE INDEX idx_series_featured ON tv_series(featured);
CREATE INDEX idx_series_studio_id ON tv_series(studio_id);
CREATE INDEX idx_series_title_trgm ON tv_series USING GIN (title gin_trgm_ops);

CREATE INDEX idx_seasons_series_id ON seasons(series_id);
CREATE INDEX idx_episodes_season_id ON episodes(season_id);
CREATE INDEX idx_episodes_series_id ON episodes(series_id);
CREATE INDEX idx_episodes_published ON episodes(published);

CREATE INDEX idx_studios_slug ON studios(slug);

-- ==========================================
-- TRIGGERS
-- ==========================================
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON tv_series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update season episode count
CREATE OR REPLACE FUNCTION update_season_episode_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE seasons 
    SET episode_count = (
        SELECT COUNT(*) FROM episodes WHERE season_id = COALESCE(NEW.season_id, OLD.season_id)
    )
    WHERE id = COALESCE(NEW.season_id, OLD.season_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_episode_change AFTER INSERT OR UPDATE OR DELETE ON episodes
    FOR EACH ROW EXECUTE FUNCTION update_season_episode_count();

-- Function to update series totals
CREATE OR REPLACE FUNCTION update_series_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tv_series 
    SET 
        total_seasons = (SELECT COUNT(*) FROM seasons WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)),
        total_episodes = (SELECT COUNT(*) FROM episodes WHERE series_id = COALESCE(NEW.series_id, OLD.series_id))
    WHERE id = COALESCE(NEW.series_id, OLD.series_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_season_change AFTER INSERT OR UPDATE OR DELETE ON seasons
    FOR EACH ROW EXECUTE FUNCTION update_series_totals();

CREATE TRIGGER on_episode_series_change AFTER INSERT OR UPDATE OR DELETE ON episodes
    FOR EACH ROW EXECUTE FUNCTION update_series_totals();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_categories ENABLE ROW LEVEL SECURITY;

-- STUDIOS POLICIES
CREATE POLICY "Studios are viewable by everyone"
    ON studios FOR SELECT USING (true);

CREATE POLICY "Only admins can manage studios"
    ON studios FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- MOVIES POLICIES
CREATE POLICY "Published movies are viewable by everyone"
    ON movies FOR SELECT
    USING (published = true OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can manage movies"
    ON movies FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- TV SERIES POLICIES
CREATE POLICY "Published series are viewable by everyone"
    ON tv_series FOR SELECT
    USING (published = true OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can manage series"
    ON tv_series FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- SEASONS POLICIES
CREATE POLICY "Seasons of published series are viewable"
    ON seasons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tv_series 
            WHERE id = seasons.series_id 
            AND (published = true OR EXISTS (
                SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
            ))
        )
    );

CREATE POLICY "Only admins can manage seasons"
    ON seasons FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- EPISODES POLICIES
CREATE POLICY "Published episodes are viewable"
    ON episodes FOR SELECT
    USING (
        published = true OR EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can manage episodes"
    ON episodes FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- CATEGORIES JUNCTION POLICIES
CREATE POLICY "Movie categories are viewable by everyone"
    ON movie_categories FOR SELECT USING (true);

CREATE POLICY "Only admins can manage movie categories"
    ON movie_categories FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Series categories are viewable by everyone"
    ON series_categories FOR SELECT USING (true);

CREATE POLICY "Only admins can manage series categories"
    ON series_categories FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ==========================================
-- VIEWS for Common Queries
-- ==========================================

-- Movies with ratings and categories
CREATE OR REPLACE VIEW movies_with_details AS
SELECT 
    m.*,
    s.name as studio_name,
    s.slug as studio_slug,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(DISTINCT r.id) AS rating_count,
    ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) AS categories,
    ARRAY_AGG(DISTINCT c.slug) FILTER (WHERE c.slug IS NOT NULL) AS category_slugs
FROM movies m
LEFT JOIN studios s ON m.studio_id = s.id
LEFT JOIN ratings r ON r.content_type = 'movie' AND r.content_id = m.id
LEFT JOIN movie_categories mc ON m.id = mc.movie_id
LEFT JOIN categories c ON mc.category_id = c.id
GROUP BY m.id, s.name, s.slug;

-- Series with ratings and categories
CREATE OR REPLACE VIEW series_with_details AS
SELECT 
    s.*,
    st.name as studio_name,
    st.slug as studio_slug,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(DISTINCT r.id) AS rating_count,
    ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) AS categories,
    ARRAY_AGG(DISTINCT c.slug) FILTER (WHERE c.slug IS NOT NULL) AS category_slugs
FROM tv_series s
LEFT JOIN studios st ON s.studio_id = st.id
LEFT JOIN ratings r ON r.content_type = 'series' AND r.content_id = s.id
LEFT JOIN series_categories sc ON s.id = sc.series_id
LEFT JOIN categories c ON sc.category_id = c.id
GROUP BY s.id, st.name, st.slug;

-- Episodes with season and series info
CREATE OR REPLACE VIEW episodes_with_details AS
SELECT 
    e.*,
    se.season_number,
    se.title as season_title,
    s.title as series_title,
    s.id as series_id,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(DISTINCT r.id) AS rating_count
FROM episodes e
JOIN seasons se ON e.season_id = se.id
JOIN tv_series s ON e.series_id = s.id
LEFT JOIN ratings r ON r.content_type = 'episode' AND r.content_id = e.id
GROUP BY e.id, se.season_number, se.title, s.title, s.id;

-- ==========================================
-- OPTIONAL: DROP OLD TABLES (Commented out for safety)
-- ==========================================
-- After verifying migration is successful, you can drop old tables:
-- DROP TABLE IF EXISTS video_categories CASCADE;
-- DROP TABLE IF EXISTS videos CASCADE;
-- DROP VIEW IF EXISTS videos_with_ratings CASCADE;
-- DROP VIEW IF EXISTS videos_with_categories CASCADE;

