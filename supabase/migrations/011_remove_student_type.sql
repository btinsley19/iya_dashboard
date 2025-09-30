-- Remove student_type column and related index from profiles table

-- Drop the index first
DROP INDEX IF EXISTS idx_profiles_student_type;

-- Drop the column
ALTER TABLE profiles DROP COLUMN IF EXISTS student_type;
