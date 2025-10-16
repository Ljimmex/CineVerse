// Shared TypeScript types for Frontend and Backend

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role: 'user' | 'admin';
  subscription_tier: 'free' | 'basic' | 'standard' | 'premium';
  subscription_status: 'active' | 'cancelled' | 'expired' | 'inactive';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Studio {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  created_at: string;
}

export interface Movie {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  poster_url?: string;
  trailer_url?: string;
  duration: number;
  release_year?: number;
  language?: string;
  quality?: string[];
  published: boolean;
  views_count: number;
  featured: boolean;
  studio_id?: string;
  created_at: string;
  updated_at: string;
  studio?: Studio;
  studio_name?: string;
  studio_slug?: string;
  categories?: Category[];
  category_slugs?: string[];
  average_rating?: number;
  rating_count?: number;
}

export interface TVSeries {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  poster_url?: string;
  trailer_url?: string;
  release_year?: number;
  language?: string;
  published: boolean;
  featured: boolean;
  studio_id?: string;
  total_seasons: number;
  total_episodes: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  studio?: Studio;
  studio_name?: string;
  studio_slug?: string;
  categories?: Category[];
  category_slugs?: string[];
  seasons?: Season[];
  average_rating?: number;
  rating_count?: number;
}

export interface Season {
  id: string;
  series_id: string;
  season_number: number;
  title?: string;
  description?: string;
  release_year?: number;
  episode_count: number;
  poster_url?: string;
  created_at: string;
  updated_at: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  season_id: string;
  series_id: string;
  episode_number: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration: number;
  published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  season_number?: number;
  season_title?: string;
  series_title?: string;
  average_rating?: number;
  rating_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

// Legacy Video type (deprecated - use Movie or TVSeries instead)
/** @deprecated Use Movie or TVSeries instead */
export interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  poster_url?: string;
  trailer_url?: string;
  duration: number;
  release_year?: number;
  language?: string;
  quality?: string[];
  published: boolean;
  views_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  average_rating?: number;
  rating_count?: number;
}

export interface Rating {
  id: string;
  user_id: string;
  content_type: 'movie' | 'series' | 'episode';
  content_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
  // Legacy fields
  video_id?: string;
  legacy_video_id?: string;
  profiles?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Comment {
  id: string;
  user_id: string;
  content_type: 'movie' | 'series' | 'episode';
  content_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Legacy fields
  video_id?: string;
  legacy_video_id?: string;
  profiles?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

export interface Favorite {
  id: string;
  user_id: string;
  content_type: 'movie' | 'series';
  content_id: string;
  created_at: string;
  // Legacy fields
  video_id?: string;
  legacy_video_id?: string;
  videos?: Video;
  movie?: Movie;
  series?: TVSeries;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  content_type: 'movie' | 'episode';
  content_id: string;
  watch_position: number;
  completed: boolean;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
  // Legacy fields
  video_id?: string;
  legacy_video_id?: string;
  videos?: Video;
  movie?: Movie;
  episode?: Episode;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete' | 'trialing';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

