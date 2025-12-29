-- Initial database schema for Sentinel

-- Users table (linked to Clerk auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for Clerk ID lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    network VARCHAR(50) DEFAULT 'testnet',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user's projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    sender VARCHAR(66) NOT NULL,
    module_address VARCHAR(66) NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    function_name VARCHAR(255) NOT NULL,
    args JSONB,
    type_args JSONB,
    result JSONB NOT NULL,
    success BOOLEAN NOT NULL,
    gas_used BIGINT,
    network VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for simulations
CREATE INDEX IF NOT EXISTS idx_simulations_project_id ON simulations(project_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_created_at ON simulations(created_at DESC);

-- Prover runs table
CREATE TABLE IF NOT EXISTS prover_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    module_name VARCHAR(255) NOT NULL,
    move_code TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    duration_ms BIGINT,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for prover runs
CREATE INDEX IF NOT EXISTS idx_prover_runs_project_id ON prover_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_prover_runs_user_id ON prover_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_prover_runs_created_at ON prover_runs(created_at DESC);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Index for API key lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to users
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Apply updated_at trigger to projects
CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
