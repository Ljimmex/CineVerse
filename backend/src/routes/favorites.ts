import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get user's favorites
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select(`
        *,
        videos (
          id,
          title,
          description,
          thumbnail_url,
          poster_url,
          duration,
          release_year
        )
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch favorites', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Check if video is favorited
router.get('/video/:videoId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('video_id', req.params.videoId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw new AppError('Failed to check favorite status', 400);
    }

    res.json({ isFavorite: !!data });
  } catch (error) {
    next(error);
  }
});

// Add to favorites
router.post('/video/:videoId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .insert({
        user_id: req.user!.id,
        video_id: req.params.videoId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new AppError('Video already in favorites', 400);
      }
      throw new AppError('Failed to add to favorites', 400);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Remove from favorites
router.delete('/video/:videoId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('video_id', req.params.videoId);

    if (error) {
      throw new AppError('Failed to remove from favorites', 400);
    }

    res.json({ message: 'Removed from favorites successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

