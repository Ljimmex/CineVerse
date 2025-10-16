import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/seasons/series/:seriesId - Get all seasons for a series
router.get('/series/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('seasons')
      .select('*')
      .eq('series_id', seriesId)
      .order('season_number', { ascending: true });

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/seasons/:id - Get single season with episodes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('seasons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get episodes for this season
    const { data: episodes } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('season_id', id)
      .order('episode_number', { ascending: true });

    const seasonWithEpisodes = {
      ...data,
      episodes: episodes || [],
    };

    res.json({ data: seasonWithEpisodes });
  } catch (error: any) {
    res.status(404).json({ error: 'Season not found' });
  }
});

// POST /api/seasons - Create new season (admin only)
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

    const seasonData = req.body;

    const { data, error } = await supabaseAdmin
      .from('seasons')
      .insert(seasonData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/seasons/:id - Update season (admin only)
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

    const seasonData = req.body;

    const { data, error } = await supabaseAdmin
      .from('seasons')
      .update(seasonData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/seasons/:id - Delete season (admin only)
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
      .from('seasons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ message: 'Season deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

