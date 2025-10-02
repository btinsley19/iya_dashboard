-- Remove unused columns from profiles table
-- Run this in Supabase SQL Editor

-- Step 1: Check if columns exist and what data they contain
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('student_type', 'major', 'degree')
ORDER BY column_name;

-- Step 2: Check for any data in these columns (optional - for safety)
SELECT 
  COUNT(*) as total_rows,
  COUNT(student_type) as student_type_count,
  COUNT(major) as major_count,
  COUNT(degree) as degree_count
FROM profiles;

-- Step 3: Remove the columns (run these one by one)
-- Remove student_type column
ALTER TABLE profiles DROP COLUMN IF EXISTS student_type;

-- Remove major column  
ALTER TABLE profiles DROP COLUMN IF EXISTS major;

-- Remove degree column
ALTER TABLE profiles DROP COLUMN IF EXISTS degree;

-- Step 4: Verify the columns are removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('student_type', 'major', 'degree');

-- Step 5: Check the updated table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
