import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Get all videos (public + authenticated)
router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      featured,
      sort = 'created_at',
      order = 'desc'
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('videos')
      .select(`
        *,
        video_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `, { count: 'exact' });

    // Only show published videos to non-admin users
    if (!req.user || req.user.role !== 'admin') {
      query = query.eq('published', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.contains('video_categories', [{ categories: { slug: category } }]);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data, error, count } = await query
      .range(offset, offset + Number(limit) - 1)
      .order(sort as string, { ascending: order === 'asc' });

    if (error) {
      throw new AppError('Failed to fetch videos', 400);
    }

    res.json({
      videos: data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single video
router.get('/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query = supabaseAdmin
      .from('videos')
      .select(`
        *,
        video_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', req.params.id)
      .single();

    // Only show published videos to non-admin users
    if (!req.user || req.user.role !== 'admin') {
      query = query.eq('published', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Video not found', 404);
    }

    // Increment view count
    await supabaseAdmin
      .from('videos')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', req.params.id);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create video (admin only)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
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
      featured,
      categories,
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert({
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
        featured,
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create video', 400);
    }

    // Add categories
    if (categories && categories.length > 0) {
      const categoryInserts = categories.map((catId: string) => ({
        video_id: data.id,
        category_id: catId,
      }));

      await supabaseAdmin
        .from('video_categories')
        .insert(categoryInserts);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update video (admin only)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categories, ...videoData } = req.body;

    const { data, error } = await supabaseAdmin
      .from('videos')
      .update({
        ...videoData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update video', 400);
    }

    // Update categories if provided
    if (categories) {
      // Delete existing categories
      await supabaseAdmin
        .from('video_categories')
        .delete()
        .eq('video_id', req.params.id);

      // Insert new categories
      if (categories.length > 0) {
        const categoryInserts = categories.map((catId: string) => ({
          video_id: req.params.id,
          category_id: catId,
        }));

        await supabaseAdmin
          .from('video_categories')
          .insert(categoryInserts);
      }
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete video (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw new AppError('Failed to delete video', 400);
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

