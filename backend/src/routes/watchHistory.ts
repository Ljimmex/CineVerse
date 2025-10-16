import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get watch history for user
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content_type, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('watch_history')
      .select('*')
      .eq('user_id', req.user!.id);

    if (content_type && ['movie', 'episode'].includes(content_type as string)) {
      query = query.eq('content_type', content_type);
    }

    const { data, error } = await query
      .order('last_watched_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (error) {
      throw new AppError('Failed to fetch watch history', 400);
    }

    // Fetch full content details
    const historyWithDetails = await Promise.all(
      data.map(async (item) => {
        if (item.content_type === 'movie') {
          const { data: movie } = await supabaseAdmin
            .from('movies_with_details')
            .select('*')
            .eq('id', item.content_id)
            .single();
          return { ...item, movie };
        } else if (item.content_type === 'episode') {
          const { data: episode } = await supabaseAdmin
            .from('episodes_with_details')
            .select('*')
            .eq('id', item.content_id)
            .single();
          return { ...item, episode };
        }
        return item;
      })
    );

    res.json(historyWithDetails);
  } catch (error) {
    next(error);
  }
});

// Get watch progress for specific content
router.get('/:contentType/:contentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;

    if (!['movie', 'episode'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('watch_history')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new AppError('Failed to fetch watch progress', 400);
    }

    res.json(data || null);
  } catch (error) {
    next(error);
  }
});

// Update watch progress
router.post('/:contentType/:contentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;
    const { watch_position, completed } = req.body;

    if (!['movie', 'episode'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    if (typeof watch_position !== 'number' || watch_position < 0) {
      throw new AppError('Invalid watch position', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('watch_history')
      .upsert({
        user_id: req.user!.id,
        content_type: contentType,
        content_id: contentId,
        watch_position,
        completed: completed || false,
        last_watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,content_type,content_id'
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update watch progress', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete watch history entry
router.delete('/:contentType/:contentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;

    if (!['movie', 'episode'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    const { error } = await supabaseAdmin
      .from('watch_history')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    if (error) {
      throw new AppError('Failed to delete watch history', 400);
    }

    res.json({ message: 'Watch history deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Continue watching - Get last watched content
router.get('/continue-watching', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('watch_history')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('completed', false)
      .order('last_watched_at', { ascending: false })
      .limit(10);

    if (error) {
      throw new AppError('Failed to fetch continue watching', 400);
    }

    // Fetch full content details
    const continueWatching = await Promise.all(
      data.map(async (item) => {
        if (item.content_type === 'movie') {
          const { data: movie } = await supabaseAdmin
            .from('movies_with_details')
            .select('*')
            .eq('id', item.content_id)
            .single();
          return { ...item, movie };
        } else if (item.content_type === 'episode') {
          const { data: episode } = await supabaseAdmin
            .from('episodes_with_details')
            .select('*')
            .eq('id', item.content_id)
            .single();
          return { ...item, episode };
        }
        return item;
      })
    );

    res.json(continueWatching);
  } catch (error) {
    next(error);
  }
});

export default router;
