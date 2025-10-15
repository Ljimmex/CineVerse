import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get ratings for a video
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
      .eq('video_id', req.params.videoId)
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

// Get user's rating for a video
router.get('/video/:videoId/user', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ratings')
      .select('*')
      .eq('video_id', req.params.videoId)
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
router.post('/video/:videoId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 10) {
      throw new AppError('Rating must be between 1 and 10', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('ratings')
      .upsert({
        user_id: req.user!.id,
        video_id: req.params.videoId,
        rating,
        updated_at: new Date().toISOString(),
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
router.delete('/video/:videoId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin
      .from('ratings')
      .delete()
      .eq('video_id', req.params.videoId)
      .eq('user_id', req.user!.id);

    if (error) {
      throw new AppError('Failed to delete rating', 400);
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

