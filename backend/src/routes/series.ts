import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/series - Get all TV series with filters
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
      .from('series_with_details')
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

// GET /api/series/featured - Get featured series
router.get('/featured', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('series_with_details')
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

// GET /api/series/:id - Get single series with seasons
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('series_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get seasons for this series
    const { data: seasons } = await supabaseAdmin
      .from('seasons')
      .select('*')
      .eq('series_id', id)
      .order('season_number', { ascending: true });

    const seriesWithSeasons = {
      ...data,
      seasons: seasons || [],
    };

    res.json({ data: seriesWithSeasons });
  } catch (error: any) {
    res.status(404).json({ error: 'Series not found' });
  }
});

// POST /api/series - Create new series (admin only)
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

    const seriesData = req.body;

    const { data, error } = await supabaseAdmin
      .from('tv_series')
      .insert(seriesData)
      .select()
      .single();

    if (error) throw error;

    // Add categories if provided
    if (seriesData.categories && seriesData.categories.length > 0) {
      const categoryLinks = seriesData.categories.map((catId: string) => ({
        series_id: data.id,
        category_id: catId,
      }));

      await supabaseAdmin
        .from('series_categories')
        .insert(categoryLinks);
    }

    return res.status(201).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/series/:id - Update series (admin only)
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

    const seriesData = req.body;
    const { categories, ...updateData } = seriesData;

    const { data, error } = await supabaseAdmin
      .from('tv_series')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update categories if provided
    if (categories) {
      // Delete existing categories
      await supabaseAdmin
        .from('series_categories')
        .delete()
        .eq('series_id', id);

      // Add new categories
      if (categories.length > 0) {
        const categoryLinks = categories.map((catId: string) => ({
          series_id: id,
          category_id: catId,
        }));

        await supabaseAdmin
          .from('series_categories')
          .insert(categoryLinks);
      }
    }

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/series/:id - Delete series (admin only)
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
      .from('tv_series')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ message: 'Series deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

