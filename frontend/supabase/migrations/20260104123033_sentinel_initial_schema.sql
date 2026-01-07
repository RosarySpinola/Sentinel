-- Sentinel Database Schema
-- All tables prefixed with sentinel_
-- No RLS - using service role key

-- ============================================
-- Users (linked to wallet address)
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_users (
    wallet_address TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- ============================================
-- Projects
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL REFERENCES sentinel_users(wallet_address) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    network TEXT DEFAULT 'testnet',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentinel_projects_wallet ON sentinel_projects(wallet_address);

-- ============================================
-- Simulations History
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL REFERENCES sentinel_users(wallet_address) ON DELETE CASCADE,
    project_id UUID REFERENCES sentinel_projects(id) ON DELETE SET NULL,

    -- Request details
    network TEXT NOT NULL,
    sender_address TEXT NOT NULL,
    module_address TEXT NOT NULL,
    module_name TEXT NOT NULL,
    function_name TEXT NOT NULL,
    type_arguments JSONB DEFAULT '[]',
    arguments JSONB DEFAULT '[]',

    -- Result
    success BOOLEAN NOT NULL,
    gas_used BIGINT,
    vm_status TEXT,
    state_changes JSONB DEFAULT '[]',
    events JSONB DEFAULT '[]',
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentinel_simulations_wallet ON sentinel_simulations(wallet_address);
CREATE INDEX idx_sentinel_simulations_project ON sentinel_simulations(project_id);
CREATE INDEX idx_sentinel_simulations_created ON sentinel_simulations(created_at DESC);

-- ============================================
-- Prover Runs History
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_prover_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL REFERENCES sentinel_users(wallet_address) ON DELETE CASCADE,
    project_id UUID REFERENCES sentinel_projects(id) ON DELETE SET NULL,

    -- Request details
    code TEXT NOT NULL,
    modules JSONB DEFAULT '[]',

    -- Result
    status TEXT NOT NULL, -- 'passed', 'failed', 'timeout', 'error'
    duration_ms INTEGER,
    results JSONB DEFAULT '{}',
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentinel_prover_runs_wallet ON sentinel_prover_runs(wallet_address);
CREATE INDEX idx_sentinel_prover_runs_project ON sentinel_prover_runs(project_id);
CREATE INDEX idx_sentinel_prover_runs_created ON sentinel_prover_runs(created_at DESC);

-- ============================================
-- API Keys
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL REFERENCES sentinel_users(wallet_address) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- hashed API key
    key_prefix TEXT NOT NULL, -- first 8 chars for display
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentinel_api_keys_wallet ON sentinel_api_keys(wallet_address);
CREATE INDEX idx_sentinel_api_keys_hash ON sentinel_api_keys(key_hash);

-- ============================================
-- Teams
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_wallet TEXT NOT NULL REFERENCES sentinel_users(wallet_address) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentinel_teams_owner ON sentinel_teams(owner_wallet);

-- ============================================
-- Team Members
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES sentinel_teams(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL REFERENCES sentinel_users(wallet_address) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(team_id, wallet_address)
);

CREATE INDEX idx_sentinel_team_members_team ON sentinel_team_members(team_id);
CREATE INDEX idx_sentinel_team_members_wallet ON sentinel_team_members(wallet_address);

-- ============================================
-- Team Invites
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES sentinel_teams(id) ON DELETE CASCADE,
    invite_token TEXT NOT NULL UNIQUE,
    invited_by TEXT NOT NULL REFERENCES sentinel_users(wallet_address) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    used_by TEXT REFERENCES sentinel_users(wallet_address),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentinel_team_invites_token ON sentinel_team_invites(invite_token);
CREATE INDEX idx_sentinel_team_invites_team ON sentinel_team_invites(team_id);

-- ============================================
-- Updated At Trigger
-- ============================================
CREATE OR REPLACE FUNCTION sentinel_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sentinel_users_updated_at
    BEFORE UPDATE ON sentinel_users
    FOR EACH ROW EXECUTE FUNCTION sentinel_update_updated_at();

CREATE TRIGGER sentinel_projects_updated_at
    BEFORE UPDATE ON sentinel_projects
    FOR EACH ROW EXECUTE FUNCTION sentinel_update_updated_at();

CREATE TRIGGER sentinel_teams_updated_at
    BEFORE UPDATE ON sentinel_teams
    FOR EACH ROW EXECUTE FUNCTION sentinel_update_updated_at();
