const express = require('express');
const pool = require('../db/pool');
const { verifyVoter, verifyAdmin } = require('../middleware/auth');
const { upload, uploadPhoto, deletePhoto } = require('../lib/storage');
const router = express.Router();

// GET all positions with their candidates (for voters)
router.get('/', verifyVoter, async (req, res) => {
  try {
    const positions = await pool.query('SELECT * FROM positions ORDER BY display_order, id');
    const candidates = await pool.query('SELECT * FROM candidates ORDER BY name');
    const data = positions.rows.map((pos) => ({
      ...pos,
      candidates: candidates.rows.filter((c) => c.position_id === pos.id),
    }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: GET all positions with candidates
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const positions = await pool.query('SELECT * FROM positions ORDER BY display_order, id');
    const candidates = await pool.query('SELECT * FROM candidates ORDER BY name');
    const data = positions.rows.map((pos) => ({
      ...pos,
      candidates: candidates.rows.filter((c) => c.position_id === pos.id),
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create position
router.post('/', verifyAdmin, async (req, res) => {
  const { title, description, display_order } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO positions (title, description, display_order) VALUES ($1, $2, $3) RETURNING *',
      [title, description || null, display_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update position
router.put('/:id', verifyAdmin, async (req, res) => {
  const { title, description, display_order } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE positions SET title=$1, description=$2, display_order=$3 WHERE id=$4 RETURNING *',
      [title, description, display_order, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Position not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete position (also cleans up photos)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT photo_url FROM candidates WHERE position_id=$1', [req.params.id]);
    await Promise.all(rows.map(r => deletePhoto(r.photo_url)));
    await pool.query('DELETE FROM positions WHERE id=$1', [req.params.id]);
    res.json({ message: 'Position deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Add candidate
router.post('/candidates', verifyAdmin, upload.single('photo'), async (req, res) => {
  const { position_id, name, bio } = req.body;
  if (!position_id || !name) return res.status(400).json({ error: 'Position and name are required' });

  let photo_url = null;
  try {
    photo_url = await uploadPhoto(req.file);
    const { rows } = await pool.query(
      'INSERT INTO candidates (position_id, name, photo_url, bio) VALUES ($1, $2, $3, $4) RETURNING *',
      [position_id, name, photo_url, bio || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (photo_url) await deletePhoto(photo_url);
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update candidate
router.put('/candidates/:id', verifyAdmin, upload.single('photo'), async (req, res) => {
  const { name, bio, position_id, removePhoto } = req.body;
  try {
    const existing = await pool.query('SELECT photo_url FROM candidates WHERE id=$1', [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Candidate not found' });

    const currentPhotoUrl = existing.rows[0].photo_url;
    let query, params;

    if (req.file) {
      const newUrl = await uploadPhoto(req.file);
      await deletePhoto(currentPhotoUrl);
      query = 'UPDATE candidates SET name=$1, bio=$2, position_id=$3, photo_url=$4 WHERE id=$5 RETURNING *';
      params = [name, bio, position_id, newUrl, req.params.id];
    } else if (removePhoto === 'true') {
      await deletePhoto(currentPhotoUrl);
      query = 'UPDATE candidates SET name=$1, bio=$2, position_id=$3, photo_url=NULL WHERE id=$4 RETURNING *';
      params = [name, bio, position_id, req.params.id];
    } else {
      query = 'UPDATE candidates SET name=$1, bio=$2, position_id=$3 WHERE id=$4 RETURNING *';
      params = [name, bio, position_id, req.params.id];
    }

    const { rows } = await pool.query(query, params);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete candidate
router.delete('/candidates/:id', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT photo_url FROM candidates WHERE id=$1', [req.params.id]);
    if (rows.length && rows[0].photo_url) await deletePhoto(rows[0].photo_url);
    await pool.query('DELETE FROM candidates WHERE id=$1', [req.params.id]);
    res.json({ message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
