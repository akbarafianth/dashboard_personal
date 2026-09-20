CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  lecturer TEXT,
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  key_takeaways TEXT,
  schedule_day TEXT,
  schedule_time TEXT,
  room_or_link TEXT,
  attachment_url TEXT,
  grade TEXT,
  color_theme TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_hours NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (estimated_hours >= 0),
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'event',
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  attachment_url TEXT,
  tags TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  display_name TEXT NOT NULL DEFAULT 'Akbar Ariffianto',
  semester TEXT NOT NULL DEFAULT 'Semester Ganjil 2026/2027',
  gpa NUMERIC(3,2) NOT NULL DEFAULT 3.73 CHECK (gpa >= 0 AND gpa <= 4),
  study_phase TEXT NOT NULL DEFAULT 'Semester 3',
  active_credits INTEGER NOT NULL DEFAULT 0 CHECK (active_credits >= 0),
  focus_text TEXT,
  pomodoro_cycles INTEGER NOT NULL DEFAULT 0 CHECK (pomodoro_cycles >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO dashboard_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS tasks_deadline_pending_idx
  ON tasks (deadline)
  WHERE status NOT IN ('completed', 'cancelled');
CREATE INDEX IF NOT EXISTS events_event_date_idx ON events (event_date);
CREATE INDEX IF NOT EXISTS subjects_created_at_idx ON subjects (created_at DESC);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes (created_at DESC);
CREATE INDEX IF NOT EXISTS tasks_subject_id_idx ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS events_subject_id_idx ON events(subject_id);
CREATE INDEX IF NOT EXISTS notes_subject_id_idx ON notes(subject_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
