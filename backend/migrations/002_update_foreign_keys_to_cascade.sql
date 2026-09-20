-- Update Foreign Key Constraints to ON DELETE CASCADE

-- Tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_subject_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_subject_id_fkey 
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;

-- Events
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_subject_id_fkey;
ALTER TABLE events ADD CONSTRAINT events_subject_id_fkey 
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;

-- Notes
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_subject_id_fkey;
ALTER TABLE notes ADD CONSTRAINT notes_subject_id_fkey 
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
