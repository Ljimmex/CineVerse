import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/movies - Get all movies with filters
router.get('/', async (req, res) => {
  try {
    const { 
      studio, 
      category, 
      featured, 
      search, 
      limit = 20, 
      offset = 0,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    let query = supabaseAdmin
      .from('movies_with_details')
      .select('*')
      .eq('published', true);

    // Apply filters
    if (studio) {
      query = query.eq('studio_slug', studio);
    }

    if (category) {
      query = query.contains('category_slugs', [category]);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sort as string, { ascending: order === 'asc' });

    // Pagination
    query = query.range(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string) - 1
    );

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      data,
      pagination: {
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/movies/featured - Get featured movies
router.get('/featured', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('movies_with_details')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ data: data || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/movies/:id - Get single movie
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('movies_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(404).json({ error: 'Movie not found' });
  }
});

// POST /api/movies - Create new movie (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { user } = req as any;

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const movieData = req.body;

    const { data, error } = await supabaseAdmin
      .from('movies')
      .insert(movieData)
      .select()
      .single();

    if (error) throw error;

    // Add categories if provided
    if (movieData.categories && movieData.categories.length > 0) {
      const categoryLinks = movieData.categories.map((catId: string) => ({
        movie_id: data.id,
        category_id: catId,
      }));

      await supabaseAdmin
        .from('movie_categories')
        .insert(categoryLinks);
    }

    return res.status(201).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/movies/:id - Update movie (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { user } = req as any;
    const { id } = req.params;

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const movieData = req.body;
    const { categories, ...updateData } = movieData;

    const { data, error } = await supabaseAdmin
      .from('movies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update categories if provided
    if (categories) {
      // Delete existing categories
      await supabaseAdmin
        .from('movie_categories')
        .delete()
        .eq('movie_id', id);

      // Add new categories
      if (categories.length > 0) {
        const categoryLinks = categories.map((catId: string) => ({
          movie_id: id,
          category_id: catId,
        }));

        await supabaseAdmin
          .from('movie_categories')
          .insert(categoryLinks);
      }
    }

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/movies/:id - Delete movie (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { user } = req as any;
    const { id } = req.params;

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabaseAdmin
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ message: 'Movie deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

