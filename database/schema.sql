-- VOD Platform Database Schema for Supabase
-- PostgreSQL with Supabase Auth integration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ==========================================
-- PROFILES TABLE (extends Supabase Auth)
-- ==========================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'standard', 'premium')),
    subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'inactive')),
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- CATEGORIES TABLE
-- ==========================================
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- VIDEOS TABLE
-- ==========================================
CREATE TABLE videos (
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
    quality TEXT[] DEFAULT ARRAY['SD', 'HD'], -- Available qualities
    published BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE, -- For hero section
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- VIDEO_CATEGORIES (Many-to-Many)
-- ==========================================
CREATE TABLE video_categories (
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, category_id)
);

-- ==========================================
-- RATINGS TABLE
-- ==========================================
CREATE TABLE ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, video_id)
);

-- ==========================================
-- COMMENTS TABLE
-- ==========================================
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- FAVORITES TABLE
-- ==========================================
CREATE TABLE favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, video_id)
);

-- ==========================================
-- WATCH_HISTORY TABLE
-- ==========================================
CREATE TABLE watch_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
    watch_position INTEGER DEFAULT 0, -- in seconds
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, video_id)
);

-- ==========================================
-- SUBSCRIPTIONS TABLE (Stripe integration)
-- ==========================================
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_price_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- INDEXES for Performance
-- ==========================================
CREATE INDEX idx_videos_published ON videos(published);
CREATE INDEX idx_videos_featured ON videos(featured);
CREATE INDEX idx_videos_title_trgm ON videos USING GIN (title gin_trgm_ops);
CREATE INDEX idx_videos_description_trgm ON videos USING GIN (description gin_trgm_ops);
CREATE INDEX idx_ratings_video_id ON ratings(video_id);
CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_last_watched ON watch_history(last_watched_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_history_updated_at BEFORE UPDATE ON watch_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update video average rating
CREATE OR REPLACE FUNCTION update_video_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- This could be enhanced to store average rating in videos table
    -- For now, we calculate on the fly in queries
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_rating_change AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_video_rating();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
    ON profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- VIDEOS POLICIES
CREATE POLICY "Published videos are viewable by everyone"
    ON videos FOR SELECT
    USING (published = true OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can insert videos"
    ON videos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update videos"
    ON videos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete videos"
    ON videos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- CATEGORIES POLICIES
CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage categories"
    ON categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- VIDEO_CATEGORIES POLICIES
CREATE POLICY "Video categories are viewable by everyone"
    ON video_categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage video categories"
    ON video_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RATINGS POLICIES
CREATE POLICY "Ratings are viewable by everyone"
    ON ratings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert their own ratings"
    ON ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
    ON ratings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
    ON ratings FOR DELETE
    USING (auth.uid() = user_id);

-- COMMENTS POLICIES
CREATE POLICY "Comments are viewable by everyone"
    ON comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments or admins can delete any"
    ON comments FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- FAVORITES POLICIES
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- WATCH_HISTORY POLICIES
CREATE POLICY "Users can view their own watch history"
    ON watch_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history"
    ON watch_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history"
    ON watch_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all watch history"
    ON watch_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (true); -- This will be done via service role

CREATE POLICY "System can update subscriptions"
    ON subscriptions FOR UPDATE
    USING (true); -- This will be done via service role

CREATE POLICY "Admins can view all subscriptions"
    ON subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- VIEWS for Common Queries
-- ==========================================

-- View for videos with average ratings
CREATE OR REPLACE VIEW videos_with_ratings AS
SELECT 
    v.*,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS rating_count
FROM videos v
LEFT JOIN ratings r ON v.id = r.video_id
GROUP BY v.id;

-- View for videos with categories
CREATE OR REPLACE VIEW videos_with_categories AS
SELECT 
    v.id,
    v.title,
    v.description,
    v.video_url,
    v.thumbnail_url,
    v.poster_url,
    v.duration,
    v.release_year,
    v.published,
    v.views_count,
    v.featured,
    ARRAY_AGG(c.name) FILTER (WHERE c.name IS NOT NULL) AS categories,
    ARRAY_AGG(c.slug) FILTER (WHERE c.slug IS NOT NULL) AS category_slugs
FROM videos v
LEFT JOIN video_categories vc ON v.id = vc.video_id
LEFT JOIN categories c ON vc.category_id = c.id
GROUP BY v.id;

-- ==========================================
-- SEED DATA (Initial Categories)
-- ==========================================
INSERT INTO categories (name, slug, description) VALUES
    ('Action', 'action', 'High-energy films with intense physical action'),
    ('Comedy', 'comedy', 'Films designed to make audiences laugh'),
    ('Drama', 'drama', 'Serious, plot-driven films'),
    ('Horror', 'horror', 'Films designed to frighten and scare'),
    ('Sci-Fi', 'sci-fi', 'Science fiction films'),
    ('Thriller', 'thriller', 'Suspenseful, edge-of-your-seat films'),
    ('Romance', 'romance', 'Films focused on romantic relationships'),
    ('Documentary', 'documentary', 'Non-fiction films'),
    ('Animation', 'animation', 'Animated films for all ages'),
    ('Fantasy', 'fantasy', 'Films with magical or supernatural elements')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- ==========================================
-- Create storage bucket for videos
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('posters', 'posters', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies will need to be set via Supabase Dashboard

