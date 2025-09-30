-- Update profiles table to use unified hobbiesAndSports field
-- This migration consolidates the separate activities, hobbies, sports, freetime fields
-- into a single hobbiesAndSports array in the links JSONB column

-- Update the comment on the links column to reflect the new structure
COMMENT ON COLUMN profiles.links IS 'JSONB field containing: linkedin, resume, canTeach, wantToLearn, favoriteTools, contentIngestion, hobbiesAndSports';

-- Note: The actual data migration from separate fields to hobbiesAndSports
-- will be handled in the application layer during the next profile update
-- This ensures backward compatibility and smooth transition

-- Add a function to help with data migration (optional - can be used for manual migration if needed)
CREATE OR REPLACE FUNCTION migrate_hobbies_sports_data()
RETURNS void AS $$
BEGIN
  -- This function can be used to manually migrate existing data if needed
  -- It combines activities, hobbies, sports, freetime into hobbiesAndSports
  UPDATE profiles 
  SET links = jsonb_set(
    COALESCE(links, '{}'::jsonb),
    '{hobbiesAndSports}',
    COALESCE(links->'activities', '[]'::jsonb) || 
    COALESCE(links->'hobbies', '[]'::jsonb) || 
    COALESCE(links->'sports', '[]'::jsonb) || 
    COALESCE(links->'freetime', '[]'::jsonb)
  )
  WHERE links ? 'activities' OR links ? 'hobbies' OR links ? 'sports' OR links ? 'freetime';
  
  -- Remove the old separate fields after migration
  UPDATE profiles 
  SET links = links - 'activities' - 'hobbies' - 'sports' - 'freetime'
  WHERE links ? 'activities' OR links ? 'hobbies' OR links ? 'sports' OR links ? 'freetime';
END;
$$ LANGUAGE plpgsql;

-- Note: The migration function is created but not automatically executed
-- This allows for controlled migration when ready
