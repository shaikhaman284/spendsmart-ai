-- Round 2 Migration: Add persistent audit storage with pricing snapshot
-- Run this after the existing schema.sql

-- Add new columns to audits table
ALTER TABLE audits
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS input_stack JSONB,
  ADD COLUMN IF NOT EXISTS output_result JSONB,
  ADD COLUMN IF NOT EXISTS pricing_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT false;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_audits_user_email ON audits(user_email);
CREATE INDEX IF NOT EXISTS idx_audits_unsubscribed ON audits(unsubscribed);
CREATE INDEX IF NOT EXISTS idx_audits_notified_at ON audits(notified_at);

-- Allow service role to update audits (for unsubscribe + notified_at)
CREATE POLICY IF NOT EXISTS "Allow service role to update audits"
  ON audits FOR UPDATE
  USING (true);

-- Comment: created_at already exists from the original schema.
-- user_email: populated when lead submits email (via /api/leads)
-- input_stack: the FormData object submitted
-- output_result: the AuditResult[] array
-- pricing_snapshot: copy of PRICING_DATA at time of audit creation
-- notified_at: last time a re-audit notification email was sent
-- unsubscribed: set to true when user clicks the unsubscribe link
