import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get comments for a video
router.get('/video/:videoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('video_id', req.params.videoId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch comments', 400);
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      data.map(async (comment) => {
        const { data: replies } = await supabaseAdmin
          .from('comments')
          .select(`
            *,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || [],
        };
      })
    );

    res.json(commentsWithReplies);
  } catch (error) {
    next(error);
  }
});

// Create comment
router.post('/video/:videoId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, parent_id } = req.body;

    if (!content || content.trim().length === 0) {
      throw new AppError('Comment content is required', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        user_id: req.user!.id,
        video_id: req.params.videoId,
        parent_id: parent_id || null,
        content: content.trim(),
      })
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new AppError('Failed to create comment', 400);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update comment
router.put('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;

    const { data, error } = await supabaseAdmin
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update comment', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete comment
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user owns the comment or is admin
    const { data: comment } = await supabaseAdmin
      .from('comments')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.user_id !== req.user!.id && req.user!.role !== 'admin') {
      throw new AppError('Not authorized to delete this comment', 403);
    }

    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw new AppError('Failed to delete comment', 400);
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

