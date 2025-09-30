-- Add instructors field to classes table
ALTER TABLE classes ADD COLUMN instructors TEXT;

-- Update the unique constraint to not include term and year since we're consolidating by course
ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_school_code_term_year_key;
ALTER TABLE classes ADD CONSTRAINT classes_school_code_key UNIQUE(school, code);
