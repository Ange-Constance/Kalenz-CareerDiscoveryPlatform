-- KarrerLenz Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    github_id VARCHAR(255) UNIQUE,
    github_username VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50),
    content_type VARCHAR(50),
    raw_text TEXT,
    extracted_data JSONB,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    competencies JSONB,
    narrative TEXT,
    top_career VARCHAR(100),
    career_matches JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    analysis_id INT REFERENCES analyses(id) ON DELETE CASCADE,
    role VARCHAR(20),
    content TEXT,
    context_step VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_evidence_user_id ON evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);

-- CV-based career analyses (new ML pipeline)
CREATE TABLE IF NOT EXISTS career_analyses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    predicted_career VARCHAR(100),
    confidence_scores JSONB,
    narrative TEXT,
    cv_filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_career_analyses_user_id ON career_analyses(user_id);

-- Extensions for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Admin flag on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

UPDATE users SET is_admin = FALSE
WHERE email = 'constance.nimuhire@gmail.com';

UPDATE users SET is_admin = TRUE
WHERE email = 'angeconstance400@gmail.com';

-- GitHub analyses table
CREATE TABLE IF NOT EXISTS github_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    github_username VARCHAR(255),
    repos_analyzed INTEGER DEFAULT 0,
    combined_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Certificate analyses table
CREATE TABLE IF NOT EXISTS certificate_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    extracted_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Extended career_analyses for combined input
ALTER TABLE career_analyses
    ADD COLUMN IF NOT EXISTS input_sources JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS github_username VARCHAR(255),
    ADD COLUMN IF NOT EXISTS certificate_filename VARCHAR(255),
    ADD COLUMN IF NOT EXISTS roadmap JSONB,
    ADD COLUMN IF NOT EXISTS analysis_version VARCHAR(10) DEFAULT 'v3',
    ADD COLUMN IF NOT EXISTS key_skills JSONB DEFAULT '[]';

-- Roadmaps table (career_analyses.id is SERIAL/INTEGER)
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    analysis_id INTEGER REFERENCES career_analyses(id) ON DELETE CASCADE,
    career VARCHAR(100),
    roadmap_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_analysis_id ON roadmaps(analysis_id);

-- Link chat to career analysis sessions
ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS career_analysis_id INTEGER REFERENCES career_analyses(id),
    ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_chat_career_analysis_id ON chat_messages(career_analysis_id);

-- Admin metrics cache
CREATE TABLE IF NOT EXISTS admin_metrics_cache (
    id SERIAL PRIMARY KEY,
    metric_key VARCHAR(100) UNIQUE,
    metric_value JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);
