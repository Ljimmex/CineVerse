import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all favorites for user
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content_type } = req.query;

    let query = supabaseAdmin
      .from('favorites')
      .select('*')
      .eq('user_id', req.user!.id);

    if (content_type && ['movie', 'series'].includes(content_type as string)) {
      query = query.eq('content_type', content_type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch favorites', 400);
    }

    // Fetch full content details
    const favoritesWithDetails = await Promise.all(
      data.map(async (fav) => {
        if (fav.content_type === 'movie') {
          const { data: movie } = await supabaseAdmin
            .from('movies_with_details')
            .select('*')
            .eq('id', fav.content_id)
            .single();
          return { ...fav, movie };
        } else if (fav.content_type === 'series') {
          const { data: series } = await supabaseAdmin
            .from('series_with_details')
            .select('*')
            .eq('id', fav.content_id)
            .single();
          return { ...fav, series };
        }
        return fav;
      })
    );

    res.json(favoritesWithDetails);
  } catch (error) {
    next(error);
  }
});

// Check if content is favorited
router.get('/:contentType/:contentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;

    if (!['movie', 'series'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new AppError('Failed to check favorite status', 400);
    }

    res.json({ favorited: !!data });
  } catch (error) {
    next(error);
  }
});

// Add to favorites
router.post('/:contentType/:contentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;

    if (!['movie', 'series'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('favorites')
      .insert({
        user_id: req.user!.id,
        content_type: contentType,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new AppError('Already in favorites', 400);
      }
      throw new AppError('Failed to add to favorites', 400);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Remove from favorites
router.delete('/:contentType/:contentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;

    if (!['movie', 'series'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    if (error) {
      throw new AppError('Failed to remove from favorites', 400);
    }

    res.json({ message: 'Removed from favorites successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
