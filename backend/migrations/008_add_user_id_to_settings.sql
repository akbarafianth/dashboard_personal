ALTER TABLE dashboard_settings DROP CONSTRAINT IF EXISTS dashboard_settings_id_check;
ALTER TABLE dashboard_settings ALTER COLUMN id TYPE BIGINT;
CREATE SEQUENCE IF NOT EXISTS dashboard_settings_id_seq;
SELECT setval('dashboard_settings_id_seq', COALESCE((SELECT MAX(id) FROM dashboard_settings), 0) + 1, false);
ALTER TABLE dashboard_settings ALTER COLUMN id SET DEFAULT nextval('dashboard_settings_id_seq');
ALTER TABLE dashboard_settings ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS dashboard_settings_user_id_idx
  ON dashboard_settings(user_id)
  WHERE user_id IS NOT NULL;
