-- Migration: 002_refresh_tokens
-- Description: Add refresh_tokens table for JWT token rotation
-- Date: 2026-02-12
-- Reversible: Yes

-- =====================
-- UP
-- =====================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- =====================
-- DOWN (rollback)
-- =====================
-- DROP TABLE IF EXISTS refresh_tokens;
