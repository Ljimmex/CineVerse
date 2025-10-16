import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get comments for content (movie, series, or episode)
router.get('/:contentType/:contentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;

    if (!['movie', 'series', 'episode'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

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
      .eq('content_type', contentType)
      .eq('content_id', contentId)
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
router.post('/:contentType/:contentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId } = req.params;
    const { content, parent_id } = req.body;

    if (!['movie', 'series', 'episode'].includes(contentType)) {
      throw new AppError('Invalid content type', 400);
    }

    if (!content || content.trim().length === 0) {
      throw new AppError('Comment content is required', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        user_id: req.user!.id,
        content_type: contentType,
        content_id: contentId,
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
router.put('/:commentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      throw new AppError('Comment content is required', 400);
    }

    // First check if user owns the comment
    const { data: existingComment } = await supabaseAdmin
      .from('comments')
      .select('user_id')
      .eq('id', req.params.commentId)
      .single();

    if (!existingComment || existingComment.user_id !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.commentId)
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
router.delete('/:commentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user owns the comment or is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user!.id)
      .single();

    const { data: existingComment } = await supabaseAdmin
      .from('comments')
      .select('user_id')
      .eq('id', req.params.commentId)
      .single();

    if (!existingComment || (existingComment.user_id !== req.user!.id && profile?.role !== 'admin')) {
      throw new AppError('Unauthorized', 403);
    }

    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', req.params.commentId);

    if (error) {
      throw new AppError('Failed to delete comment', 400);
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Legacy support - Get comments for a video (deprecated)
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
      .eq('legacy_video_id', req.params.videoId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch comments', 400);
    }

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

export default router;
