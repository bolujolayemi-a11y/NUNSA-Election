const express = require('express');
const pool = require('../db/pool');
const { verifyMaster } = require('../middleware/auth');
const router = express.Router();

// Public: anyone can check whether the site is enabled (used by login pages to show lock screen)
router.get('/site-status', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT value FROM system_settings WHERE key='site_enabled'");
    const enabled = rows.length ? rows[0].value === 'true' : true;
    res.json({ site_enabled: enabled });
  } catch (err) {
    res.json({ site_enabled: true }); // fail open
  }
});

// Master: toggle site on/off
router.put('/site-status', verifyMaster, async (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') return res.status(400).json({ error: '"enabled" must be true or false' });

  try {
    await pool.query(
      `INSERT INTO system_settings (key, value, updated_at) VALUES ('site_enabled', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [enabled ? 'true' : 'false']
    );
    res.json({ site_enabled: enabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Master: overall stats
router.get('/stats', verifyMaster, async (req, res) => {
  try {
    const [voters, votedVoters, candidates, positions, admins] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM voters'),
      pool.query('SELECT COUNT(*)::int AS count FROM voters WHERE has_voted = TRUE'),
      pool.query('SELECT COUNT(*)::int AS count FROM candidates'),
      pool.query('SELECT COUNT(*)::int AS count FROM positions'),
      pool.query('SELECT COUNT(*)::int AS count FROM admins'),
    ]);

    res.json({
      total_voters: voters.rows[0].count,
      votes_cast: votedVoters.rows[0].count,
      total_candidates: candidates.rows[0].count,
      total_positions: positions.rows[0].count,
      total_admins: admins.rows[0].count,
      turnout_pct: voters.rows[0].count > 0
        ? Math.round((votedVoters.rows[0].count / voters.rows[0].count) * 100)
        : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
