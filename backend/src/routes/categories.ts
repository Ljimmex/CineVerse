import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all categories (public)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch categories', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get single category
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error) {
      throw new AppError('Category not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create category (admin only)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description } = req.body;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name, slug, description })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create category', 400);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update category (admin only)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description } = req.body;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ name, slug, description })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update category', 400);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete category (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw new AppError('Failed to delete category', 400);
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

