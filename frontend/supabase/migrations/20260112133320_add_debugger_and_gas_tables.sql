-- Add Debugger Runs and Gas Analyses tables
-- These tables store history for debugger and gas analysis features

-- ============================================
-- Debugger Runs History
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_debugger_runs (
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
    total_steps INTEGER DEFAULT 0,
    total_gas BIGINT DEFAULT 0,
    result JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentinel_debugger_runs_wallet ON sentinel_debugger_runs(wallet_address);
CREATE INDEX idx_sentinel_debugger_runs_project ON sentinel_debugger_runs(project_id);
CREATE INDEX idx_sentinel_debugger_runs_created ON sentinel_debugger_runs(created_at DESC);

-- ============================================
-- Gas Analyses History
-- ============================================
CREATE TABLE IF NOT EXISTS sentinel_gas_analyses (
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
    total_gas BIGINT DEFAULT 0,
    top_operation TEXT,
    top_function TEXT,
    suggestions_count INTEGER DEFAULT 0,
    result JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentinel_gas_analyses_wallet ON sentinel_gas_analyses(wallet_address);
CREATE INDEX idx_sentinel_gas_analyses_project ON sentinel_gas_analyses(project_id);
CREATE INDEX idx_sentinel_gas_analyses_created ON sentinel_gas_analyses(created_at DESC);

-- Also add result column to simulations for full result storage
ALTER TABLE sentinel_simulations ADD COLUMN IF NOT EXISTS result JSONB;
