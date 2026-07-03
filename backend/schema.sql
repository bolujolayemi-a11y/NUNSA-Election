-- Election Database Schema

CREATE TABLE IF NOT EXISTS voters (
  id SERIAL PRIMARY KEY,
  matric_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(20),
  has_voted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  position_id INT REFERENCES positions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  voter_id INT REFERENCES voters(id),
  position_id INT REFERENCES positions(id),
  candidate_id INT REFERENCES candidates(id),
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(voter_id, position_id)
);

-- Tracks NO votes for uncontested positions
CREATE TABLE IF NOT EXISTS no_votes (
  id SERIAL PRIMARY KEY,
  voter_id INT REFERENCES voters(id),
  position_id INT REFERENCES positions(id),
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(voter_id, position_id)
);

-- Admin table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System settings (site on/off switch, controlled by master)
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO system_settings (key, value) VALUES ('site_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

INSERT INTO admins (username, password_hash) VALUES
  ('nunsa_admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') -- password: 'NunsaElections2026'
ON CONFLICT DO NOTHING;

-- Migration: add level column if upgrading existing DB
ALTER TABLE voters ADD COLUMN IF NOT EXISTS level VARCHAR(20);
