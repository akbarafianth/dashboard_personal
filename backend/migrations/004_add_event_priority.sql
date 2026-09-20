-- 004 Add event priority
ALTER TABLE events ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
