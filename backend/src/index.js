require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const positionRoutes = require('./routes/positions');
const voteRoutes = require('./routes/votes');
const masterRoutes = require('./routes/master');

const app = express();

aapp.use(cors({
  origin: process.env.FRONTEND_URL || 'https://nunsa-election-nu.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/positions', positionRoutes);
app.use('/votes', voteRoutes);
app.use('/master', masterRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Local dev: listen normally
// Vercel: export the app as a serverless function
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Election API running on http://localhost:${PORT}`));
}

module.exports = app;
