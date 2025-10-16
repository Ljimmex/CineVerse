import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/episodes/season/:seasonId - Get all episodes for a season
router.get('/season/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('episodes_with_details')
      .select('*')
      .eq('season_id', seasonId)
      .eq('published', true)
      .order('episode_number', { ascending: true });

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/episodes/series/:seriesId - Get all episodes for a series
router.get('/series/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('episodes_with_details')
      .select('*')
      .eq('series_id', seriesId)
      .eq('published', true)
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true });

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/episodes/:id - Get single episode
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('episodes_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(404).json({ error: 'Episode not found' });
  }
});

// GET /api/episodes/:id/next - Get next episode
router.get('/:id/next', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current episode
    const { data: currentEpisode, error: currentError } = await supabaseAdmin
      .from('episodes')
      .select('season_id, series_id, episode_number')
      .eq('id', id)
      .single();

    if (currentError) throw currentError;

    // Try to find next episode in same season
    let { data: nextEpisode, error } = await supabaseAdmin
      .from('episodes_with_details')
      .select('*')
      .eq('season_id', currentEpisode.season_id)
      .eq('published', true)
      .gt('episode_number', currentEpisode.episode_number)
      .order('episode_number', { ascending: true })
      .limit(1)
      .single();

    // If no next episode in season, try first episode of next season
    if (error && error.code === 'PGRST116') {
      const { data: currentSeason } = await supabaseAdmin
        .from('seasons')
        .select('season_number')
        .eq('id', currentEpisode.season_id)
        .single();

      if (currentSeason) {
        const { data: nextSeason } = await supabaseAdmin
          .from('seasons')
          .select('id')
          .eq('series_id', currentEpisode.series_id)
          .gt('season_number', currentSeason.season_number)
          .order('season_number', { ascending: true })
          .limit(1)
          .single();

        if (nextSeason) {
          const { data: firstEpisode } = await supabaseAdmin
            .from('episodes_with_details')
            .select('*')
            .eq('season_id', nextSeason.id)
            .eq('published', true)
            .order('episode_number', { ascending: true })
            .limit(1)
            .single();

          nextEpisode = firstEpisode;
        }
      }
    }

    res.json({ data: nextEpisode || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/episodes - Create new episode (admin only)
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

    const episodeData = req.body;

    const { data, error } = await supabaseAdmin
      .from('episodes')
      .insert(episodeData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/episodes/:id - Update episode (admin only)
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

    const episodeData = req.body;

    const { data, error } = await supabaseAdmin
      .from('episodes')
      .update(episodeData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/episodes/:id - Delete episode (admin only)
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
      .from('episodes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ message: 'Episode deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

