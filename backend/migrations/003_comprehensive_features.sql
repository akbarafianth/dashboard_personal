-- Comprehensive Enhancements Migration

-- 1. Tasks: Add is_recurring, reminder_time
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_time TIMESTAMPTZ;

-- 2. Events: Add location, is_all_day
ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Notes: Add tags, is_pinned
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. Subjects: Add color_theme
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'blue';
