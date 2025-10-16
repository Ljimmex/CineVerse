import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/studios - Get all studios
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('studios')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/studios/:slug - Get studio by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabaseAdmin
      .from('studios')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(404).json({ error: 'Studio not found' });
  }
});

// GET /api/studios/:slug/movies - Get all movies for a studio
router.get('/:slug/movies', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error, count } = await supabaseAdmin
      .from('movies_with_details')
      .select('*', { count: 'exact' })
      .eq('studio_slug', slug)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

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

// GET /api/studios/:slug/series - Get all series for a studio
router.get('/:slug/series', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error, count } = await supabaseAdmin
      .from('series_with_details')
      .select('*', { count: 'exact' })
      .eq('studio_slug', slug)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

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

// GET /api/studios/:slug/content - Get all content (movies + series) for a studio
router.get('/:slug/content', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get movies
    const { data: movies } = await supabaseAdmin
      .from('movies_with_details')
      .select('*')
      .eq('studio_slug', slug)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get series
    const { data: series } = await supabaseAdmin
      .from('series_with_details')
      .select('*')
      .eq('studio_slug', slug)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      data: {
        movies: movies || [],
        series: series || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/studios - Create new studio (admin only)
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

    const studioData = req.body;

    const { data, error } = await supabaseAdmin
      .from('studios')
      .insert(studioData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/studios/:id - Update studio (admin only)
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

    const studioData = req.body;

    const { data, error } = await supabaseAdmin
      .from('studios')
      .update(studioData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/studios/:id - Delete studio (admin only)
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
      .from('studios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ message: 'Studio deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

