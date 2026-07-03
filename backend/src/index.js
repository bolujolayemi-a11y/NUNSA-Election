require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const positionRoutes = require('./routes/positions');
const voteRoutes = require('./routes/votes');
const masterRoutes = require('./routes/master');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/master', masterRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Local dev: listen normally
// Vercel: export the app as a serverless function
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Election API running on http://localhost:${PORT}`));
}

module.exports = app;
