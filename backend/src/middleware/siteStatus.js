const pool = require('../db/pool');

// Blocks the request if the master has disabled the site.
// Used only on voter-facing routes (login, vote submission).
const checkSiteEnabled = async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT value FROM system_settings WHERE key='site_enabled'");
    const enabled = rows.length ? rows[0].value === 'true' : true;

    if (!enabled) {
      return res.status(503).json({
        error: 'Voting is currently closed. Please check back later.',
        site_disabled: true,
      });
    }
    next();
  } catch (err) {
    console.error(err);
    // Fail open on DB error so a settings issue doesn't lock everyone out unexpectedly
    next();
  }
};

module.exports = { checkSiteEnabled };
