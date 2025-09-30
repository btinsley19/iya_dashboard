-- Remove status field from classes display and update data structure
-- This migration removes the status concept entirely from classes

-- Update existing data to remove status references
-- Since we're removing status, we'll keep the role-based system (ta, mentor)
-- and remove the status field from the UI logic
