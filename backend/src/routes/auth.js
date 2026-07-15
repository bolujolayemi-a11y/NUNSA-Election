const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { checkSiteEnabled } = require('../middleware/siteStatus');
const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || 'election_secret';

// 1. Voter Login (Includes Accreditation Check)
router.post('/voter/login', checkSiteEnabled, async (req, res) => {
  const { matric_number } = req.body;
  if (!matric_number) return res.status(400).json({ error: 'Matric number is required' });

  try {
    const matric = matric_number.trim().toUpperCase();
    const { rows } = await pool.query('SELECT * FROM voters WHERE UPPER(matric_number) = $1', [matric]);

    if (!rows.length) {
      return res.status(403).json({ error: 'Not registered.', not_registered: true });
    }

    const voter = rows[0];

    // Accreditation Check
    if (!voter.verified) {
      return res.status(403).json({ 
        error: 'You have not been accredited yet. Please see the verification desk.' 
      });
    }

    const token = jwt.sign(
      { id: voter.id, matric_number: voter.matric_number, name: voter.name, role: 'voter' },
      SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      voter: { id: voter.id, name: voter.name, matric_number: voter.matric_number, level: voter.level, has_voted: voter.has_voted },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Voter Lookup (Used by Accreditation Desk)
router.get('/voter/lookup', verifyAdmin, async (req, res) => {
  const matric = (req.query.matric || '').trim().toUpperCase();
  if (!matric) return res.status(400).json({ error: 'Matric number required' });

  try {
    const { rows } = await pool.query(
      'SELECT name, level, verified FROM voters WHERE UPPER(matric_number) = $1',
      [matric]
    );
    if (!rows.length) return res.status(404).json({ error: 'Voter not found' });
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Mark Voter Verified (Accreditation Action)
router.patch('/voter/verify/:matric', verifyAdmin, async (req, res) => {
  const matric = decodeURIComponent(req.params.matric);
  
  try {
    const result = await pool.query(
      'UPDATE voters SET verified = true WHERE UPPER(matric_number) = $1 RETURNING *',
      [matric.toUpperCase()]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Voter not found' });
    res.json({ message: 'Voter accredited successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add this to routes/auth.js
router.patch('/voters/:id/toggle-verify', async (req, res) => {
  const { id } = req.params;
  const { verified } = req.body; // Incoming boolean

  try {
    const result = await pool.query(
      'UPDATE voters SET verified = $1 WHERE id = $2 RETURNING *',
      [verified, id]
    );
    
    if (result.rowCount === 0) return res.status(404).json({ error: 'Voter not found' });
    
    res.json({ message: 'Status updated successfully', voter: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const { rows } = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: rows[0].id, username, role: 'admin' }, SECRET, { expiresIn: '8h' });
    res.json({ token, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Master (owner) login — checked against .env, no DB lookup
router.post('/master/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const MASTER_EMAIL = process.env.MASTER_EMAIL;
  const MASTER_PASSWORD = process.env.MASTER_PASSWORD;

  if (!MASTER_EMAIL || !MASTER_PASSWORD) {
    return res.status(500).json({ error: 'Master account not configured on the server' });
  }

  if (email.trim().toLowerCase() !== MASTER_EMAIL.trim().toLowerCase() || password !== MASTER_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email: MASTER_EMAIL, role: 'master' }, SECRET, { expiresIn: '4h' });
  res.json({ token, email: MASTER_EMAIL });
});

module.exports = router;