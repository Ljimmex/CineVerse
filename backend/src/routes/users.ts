import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get current user profile
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error) {
      throw new AppError('Profile not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { full_name, bio, avatar_url } = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        bio,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update profile', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get all users (admin only)
router.get('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error, count } = await query
      .range(offset, offset + Number(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch users', 400);
    }

    res.json({
      users: data,
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

// Get user by ID (admin only)
router.get('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      throw new AppError('User not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, subscription_tier, subscription_status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        role,
        subscription_tier,
        subscription_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update user', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);

    if (error) {
      throw new AppError('Failed to delete user', 400);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

