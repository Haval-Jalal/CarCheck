-- Migration: 003_subscriptions
-- Description: Subscription tiers and billing

-- UP
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'free',
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    external_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX ix_subscriptions_user_active ON subscriptions(user_id, is_active);

-- DOWN
-- DROP TABLE IF EXISTS subscriptions;
