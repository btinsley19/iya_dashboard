-- Fix projects table DELETE policies to prevent infinite recursion
-- Add missing DELETE policies for projects table

CREATE POLICY "Project owners can delete their projects" ON projects
    FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can delete any project" ON projects
    FOR DELETE USING (is_admin(auth.uid()));

-- Fix infinite recursion in project_members policies
-- Drop the problematic policy that references itself
DROP POLICY IF EXISTS "Project members can view membership" ON project_members;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Users can view their own project memberships" ON project_members
    FOR SELECT USING (auth.uid() = profile_id);

-- Fix infinite recursion in event_attendees policies
-- Drop the problematic policy that references itself
DROP POLICY IF EXISTS "Event attendees can view attendance" ON event_attendees;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Users can view their own event attendance" ON event_attendees
    FOR SELECT USING (auth.uid() = profile_id);
