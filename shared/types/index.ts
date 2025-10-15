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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  video_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Comment {
  id: string;
  user_id: string;
  video_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
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
  video_id: string;
  created_at: string;
  videos?: Video;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  video_id: string;
  watch_position: number;
  completed: boolean;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
  videos?: Video;
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

