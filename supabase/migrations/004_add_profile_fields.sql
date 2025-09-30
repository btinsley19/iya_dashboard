-- Add new fields to profiles table for enhanced profile functionality

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS hometown TEXT,
ADD COLUMN IF NOT EXISTS cohort TEXT,
ADD COLUMN IF NOT EXISTS student_type TEXT CHECK (student_type IN ('undergraduate', 'graduate', 'faculty', 'staff', 'alumni')),
ADD COLUMN IF NOT EXISTS modality TEXT CHECK (modality IN ('in-person', 'online', 'hybrid')),
ADD COLUMN IF NOT EXISTS degree TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_hometown ON profiles(hometown);
CREATE INDEX IF NOT EXISTS idx_profiles_cohort ON profiles(cohort);
CREATE INDEX IF NOT EXISTS idx_profiles_student_type ON profiles(student_type);
CREATE INDEX IF NOT EXISTS idx_profiles_modality ON profiles(modality);
CREATE INDEX IF NOT EXISTS idx_profiles_degree ON profiles(degree);

-- Update the links JSONB structure to support new fields
-- This will be handled in the application layer, but we can add a comment
COMMENT ON COLUMN profiles.links IS 'JSONB field containing: linkedin, resume, canTeach, wantToLearn, favoriteTools, contentIngestion, activities, hobbies, sports, freetime';
