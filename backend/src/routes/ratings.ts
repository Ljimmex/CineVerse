import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get ratings for content (movie, series, or episode)
router.get('/:contentType/:contentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;

    if (!['movie', 'series', 'episode'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('ratings')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch ratings', 400);
    }

    // Calculate average
    const average = data.length > 0
      ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
      : 0;

    res.json({
      ratings: data,
      average: Math.round(average * 10) / 10,
      count: data.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's rating for content
router.get('/:contentType/:contentId/user', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;

    if (!['movie', 'series', 'episode'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('ratings')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('user_id', req.user!.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw new AppError('Failed to fetch rating', 400);
    }

    res.json(data || null);
  } catch (error) {
    next(error);
  }
});

// Create or update rating
router.post('/:contentType/:contentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;
    const { rating } = req.body;

    if (!['movie', 'series', 'episode'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    if (rating < 1 || rating > 10) {
      throw new AppError('Rating must be between 1 and 10', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('ratings')
      .upsert({
        user_id: req.user!.id,
        content_type: contentType,
        content_id: contentId,
        rating,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,content_type,content_id'
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to save rating', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete rating
router.delete('/:contentType/:contentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;

    if (!['movie', 'series', 'episode'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    const { error } = await supabaseAdmin
      .from('ratings')
      .delete()
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('user_id', req.user!.id);

    if (error) {
      throw new AppError('Failed to delete rating', 400);
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Legacy support - Get ratings for a video (deprecated)
router.get('/video/:videoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ratings')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('legacy_video_id', req.params.videoId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch ratings', 400);
    }

    const average = data.length > 0
      ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
      : 0;

    res.json({
      ratings: data,
      average: Math.round(average * 10) / 10,
      count: data.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
