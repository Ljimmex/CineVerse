import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get user's watch history
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('watch_history')
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
      .order('last_watched_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch watch history', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get watch position for a video
router.get('/video/:videoId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('watch_history')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('video_id', req.params.videoId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw new AppError('Failed to fetch watch position', 400);
    }

    res.json(data || { watch_position: 0, completed: false });
  } catch (error) {
    next(error);
  }
});

// Update watch position
router.post('/video/:videoId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { watch_position, completed } = req.body;

    const { data, error } = await supabaseAdmin
      .from('watch_history')
      .upsert({
        user_id: req.user!.id,
        video_id: req.params.videoId,
        watch_position,
        completed: completed || false,
        last_watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update watch history', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete watch history entry
router.delete('/video/:videoId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin
      .from('watch_history')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('video_id', req.params.videoId);

    if (error) {
      throw new AppError('Failed to delete watch history', 400);
    }

    res.json({ message: 'Watch history deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Clear all watch history
router.delete('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin
      .from('watch_history')
      .delete()
      .eq('user_id', req.user!.id);

    if (error) {
      throw new AppError('Failed to clear watch history', 400);
    }

    res.json({ message: 'Watch history cleared successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

