-- Devise MCP Gateway Database Schema Additions

-- 1. Create Private MCP Registry
CREATE TABLE mcp_registry (
    id              TEXT PRIMARY KEY,
    org_id          TEXT NOT NULL,
    server_name     TEXT NOT NULL,
    server_url      TEXT NOT NULL,
    transport       TEXT NOT NULL DEFAULT 'sse',
    status          TEXT NOT NULL DEFAULT 'pending',
    risk_score      INTEGER DEFAULT 0,
    scan_result     JSONB,
    permissions     TEXT[],
    version         TEXT,
    submitted_by    TEXT,
    approved_by     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Blockchain-based MCP Audit Ledger
CREATE TABLE mcp_audit_ledger (
    id              BIGSERIAL PRIMARY KEY,
    org_id          TEXT NOT NULL,
    event_type      TEXT NOT NULL,
    actor_id        TEXT NOT NULL,
    session_id      TEXT,
    tool_name       TEXT,
    request_payload JSONB,
    response_meta   JSONB,
    risk_score      INTEGER DEFAULT 0,
    threat_flags    TEXT[],
    duration_ms     INTEGER,
    status          TEXT NOT NULL,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    prev_hash       TEXT NOT NULL,
    hash            TEXT NOT NULL,
    merkle_root     TEXT,
    CONSTRAINT valid_hash CHECK (length(hash) = 64)
);

CREATE INDEX idx_audit_org_time ON mcp_audit_ledger(org_id, timestamp DESC);
CREATE INDEX idx_audit_actor ON mcp_audit_ledger(actor_id);
CREATE INDEX idx_audit_tool ON mcp_audit_ledger(tool_name);
CREATE INDEX idx_audit_risk ON mcp_audit_ledger(risk_score) WHERE risk_score >= 70;

-- 3. Modify profiles to map to new Auth0 identity
ALTER TABLE profiles ADD COLUMN auth0_sub TEXT UNIQUE;
