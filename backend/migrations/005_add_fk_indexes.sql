-- Menambahkan indeks untuk foreign key agar operasi JOIN dan filtering lebih cepat
-- Indeks ini bermanfaat karena ON DELETE CASCADE akan mencari record child berdasarkan subject_id

CREATE INDEX IF NOT EXISTS tasks_subject_id_idx ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS events_subject_id_idx ON events(subject_id);
CREATE INDEX IF NOT EXISTS notes_subject_id_idx ON notes(subject_id);

-- Menambahkan indeks untuk kolom status di tabel tasks karena sering difilter di dashboard
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
