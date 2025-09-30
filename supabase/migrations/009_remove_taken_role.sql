-- Remove 'taken' from class_role enum and update existing data
-- First, update all 'taken' roles to 'mentor' (or another appropriate role)
UPDATE profile_classes SET role = 'mentor' WHERE role = 'taken';

-- Drop the old enum type
DROP TYPE class_role;

-- Create new enum type without 'taken'
CREATE TYPE class_role AS ENUM ('ta', 'mentor');

-- Update the table to use the new enum
ALTER TABLE profile_classes ALTER COLUMN role TYPE class_role USING role::text::class_role;

-- Update the default value
ALTER TABLE profile_classes ALTER COLUMN role SET DEFAULT 'mentor';
