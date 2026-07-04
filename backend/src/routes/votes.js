const express = require('express');
const pool = require('../db/pool');
const { verifyVoter, verifyAdmin } = require('../middleware/auth');
const { checkSiteEnabled } = require('../middleware/siteStatus');
const router = express.Router();

// Submit votes (voter submits full ballot at once)
// votes: [{ position_id, candidate_id }]  — candidate_id is null for a NO vote
// no_votes: [position_id]                 — positions where voter said NO (uncontested)
router.post('/', verifyVoter, checkSiteEnabled, async (req, res) => {
  const { votes = [], no_votes = [] } = req.body;
  const voter_id = req.voter.id;

  if (votes.length === 0 && no_votes.length === 0) {
    return res.status(400).json({ error: 'No votes provided' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock and check voter hasn't voted
    const voterCheck = await client.query('SELECT has_voted FROM voters WHERE id=$1 FOR UPDATE', [voter_id]);
    if (voterCheck.rows[0]?.has_voted) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'You have already voted' });
    }

    // Insert regular candidate votes
    for (const vote of votes) {
      const { position_id, candidate_id } = vote;
      if (!position_id || !candidate_id) continue;

      const check = await client.query(
        'SELECT id FROM candidates WHERE id=$1 AND position_id=$2',
        [candidate_id, position_id]
      );
      if (!check.rows.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Invalid candidate for position ${position_id}` });
      }

      await client.query(
        'INSERT INTO votes (voter_id, position_id, candidate_id) VALUES ($1, $2, $3)',
        [voter_id, position_id, candidate_id]
      );
    }

    // Insert NO votes for uncontested positions
    for (const position_id of no_votes) {
      await client.query(
        'INSERT INTO no_votes (voter_id, position_id) VALUES ($1, $2)',
        [voter_id, position_id]
      );
    }

    await client.query('UPDATE voters SET has_voted=TRUE WHERE id=$1', [voter_id]);
    await client.query('COMMIT');

    res.json({ message: 'Votes submitted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You have already voted for one of these positions' });
    }
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Admin: Get results (includes NO votes for uncontested positions)
router.get('/results', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id AS position_id,
        p.title AS position,
        c.id AS candidate_id,
        c.name AS candidate,
        c.photo_url,
        COUNT(v.id)::int AS votes
      FROM positions p
      LEFT JOIN candidates c ON c.position_id = p.id
      LEFT JOIN votes v ON v.candidate_id = c.id
      GROUP BY p.id, p.title, c.id, c.name, c.photo_url
      ORDER BY p.display_order, p.id, votes DESC
    `);

    // Get NO vote counts per position
    const { rows: noRows } = await pool.query(`
      SELECT position_id, COUNT(*)::int AS no_votes
      FROM no_votes
      GROUP BY position_id
    `);
    const noVoteMap = {};
    for (const r of noRows) noVoteMap[r.position_id] = r.no_votes;

    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.position_id]) {
        grouped[row.position_id] = {
          position_id: row.position_id,
          position: row.position,
          candidates: [],
          no_votes: noVoteMap[row.position_id] || 0,
        };
      }
      if (row.candidate_id) {
        grouped[row.position_id].candidates.push({
          candidate_id: row.candidate_id,
          candidate: row.candidate,
          photo_url: row.photo_url,
          votes: row.votes,
        });
      }
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get voter list (includes level)
router.get('/voters', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, matric_number, name, level, has_voted, verified, created_at FROM voters ORDER BY matric_number'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Add single voter (with level)
router.post('/voters', verifyAdmin, async (req, res) => {
  const { matric_number, name, level } = req.body;
  if (!matric_number || !name) return res.status(400).json({ error: 'Matric number and name required' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO voters (matric_number, name, level) VALUES ($1, $2, $3) RETURNING id, matric_number, name, level, has_voted',
      [matric_number.trim().toUpperCase(), name.trim(), level?.trim() || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Matric number already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Bulk add voters — accepts [{ matric_number, name, level }]
router.post('/voters/bulk', verifyAdmin, async (req, res) => {
  const { voters } = req.body;
  if (!voters?.length) return res.status(400).json({ error: 'No voters provided' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let added = 0, skipped = 0;
    for (const v of voters) {
      if (!v.matric_number || !v.name) { skipped++; continue; }
      try {
        await client.query(
          'INSERT INTO voters (matric_number, name, level) VALUES ($1, $2, $3) ON CONFLICT (matric_number) DO NOTHING',
          [v.matric_number.trim().toUpperCase(), v.name.trim(), v.level?.trim() || null]
        );
        added++;
      } catch { skipped++; }
    }
    await client.query('COMMIT');
    res.json({ message: `Added ${added} voters, skipped ${skipped} duplicates` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Admin: Delete voter
router.delete('/voters/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM voters WHERE id=$1', [req.params.id]);
    res.json({ message: 'Voter deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Reset voter's vote (emergency) — also clears no_votes
router.patch('/voters/:id/reset', verifyAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM votes WHERE voter_id=$1', [req.params.id]);
    await client.query('DELETE FROM no_votes WHERE voter_id=$1', [req.params.id]);
    await client.query('UPDATE voters SET has_voted=FALSE WHERE id=$1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'Voter vote reset' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
