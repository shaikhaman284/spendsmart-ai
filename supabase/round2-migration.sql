-- Round 2 Migration: Add columns for re-audit functionality
-- Run this migration in your Supabase SQL editor

-- Add new columns to audits table
ALTER TABLE audits
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS input_stack JSONB,
ADD COLUMN IF NOT EXISTS output_result JSONB,
ADD COLUMN IF NOT EXISTS pricing_snapshot JSONB,
ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT false;

-- Add index on user_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_audits_user_email ON audits(user_email);

-- Add index on unsubscribed for filtering
CREATE INDEX IF NOT EXISTS idx_audits_unsubscribed ON audits(unsubscribed);

-- Add index on notified_at for tracking notifications
CREATE INDEX IF NOT EXISTS idx_audits_notified_at ON audits(notified_at);

-- Update RLS policies if needed (allow reading by audit ID)
-- Existing policies should still work, but verify in Supabase dashboard
