-- Add cohort column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cohort TEXT;

-- Create index for cohort field
CREATE INDEX IF NOT EXISTS idx_profiles_cohort ON profiles(cohort);
