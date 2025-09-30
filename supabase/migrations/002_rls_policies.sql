-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is active
CREATE OR REPLACE FUNCTION is_active_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view active profiles" ON profiles
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Skills policies (public read, admin write)
CREATE POLICY "Anyone can view skills" ON skills
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage skills" ON skills
    FOR ALL USING (is_admin(auth.uid()));

-- Tags policies (public read, admin write)
CREATE POLICY "Anyone can view tags" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON tags
    FOR ALL USING (is_admin(auth.uid()));

-- Classes policies (public read, admin write)
CREATE POLICY "Anyone can view classes" ON classes
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage classes" ON classes
    FOR ALL USING (is_admin(auth.uid()));

-- Projects policies
CREATE POLICY "Anyone can view public projects" ON projects
    FOR SELECT USING (visibility = 'public' AND archived = false);

CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Project members can view project" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = projects.id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all projects" ON projects
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Active users can create projects" ON projects
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id AND is_active_user(auth.uid())
    );

CREATE POLICY "Project owners can update their projects" ON projects
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update any project" ON projects
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Project owners can delete their projects" ON projects
    FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can delete any project" ON projects
    FOR DELETE USING (is_admin(auth.uid()));

-- Events policies
CREATE POLICY "Anyone can view public events" ON events
    FOR SELECT USING (visibility = 'public' AND archived = false);

CREATE POLICY "Event organizers can view their events" ON events
    FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can view all events" ON events
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Active users can create events" ON events
    FOR INSERT WITH CHECK (
        auth.uid() = organizer_id AND is_active_user(auth.uid())
    );

CREATE POLICY "Event organizers can update their events" ON events
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can update any event" ON events
    FOR UPDATE USING (is_admin(auth.uid()));

-- Notes policies
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can view public notes" ON notes
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Admins can view all notes" ON notes
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can create notes" ON notes
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND is_active_user(auth.uid())
    );

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can update any note" ON notes
    FOR UPDATE USING (is_admin(auth.uid()));

-- Profile skills policies
CREATE POLICY "Users can view profile skills" ON profile_skills
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own skills" ON profile_skills
    FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Admins can manage all profile skills" ON profile_skills
    FOR ALL USING (is_admin(auth.uid()));

-- Profile tags policies
CREATE POLICY "Users can view profile tags" ON profile_tags
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own tags" ON profile_tags
    FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Admins can manage all profile tags" ON profile_tags
    FOR ALL USING (is_admin(auth.uid()));

-- Profile classes policies
CREATE POLICY "Users can view profile classes" ON profile_classes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own classes" ON profile_classes
    FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Admins can manage all profile classes" ON profile_classes
    FOR ALL USING (is_admin(auth.uid()));

-- Project members policies
CREATE POLICY "Project members can view membership" ON project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm2 
            WHERE pm2.project_id = project_members.project_id 
            AND pm2.profile_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can manage members" ON project_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_members.project_id 
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all project members" ON project_members
    FOR ALL USING (is_admin(auth.uid()));

-- Project tags policies
CREATE POLICY "Anyone can view project tags" ON project_tags
    FOR SELECT USING (true);

CREATE POLICY "Project owners can manage project tags" ON project_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_tags.project_id 
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all project tags" ON project_tags
    FOR ALL USING (is_admin(auth.uid()));

-- Event attendees policies
CREATE POLICY "Event attendees can view attendance" ON event_attendees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM event_attendees ea2 
            WHERE ea2.event_id = event_attendees.event_id 
            AND ea2.profile_id = auth.uid()
        )
    );

CREATE POLICY "Event organizers can manage attendees" ON event_attendees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE id = event_attendees.event_id 
            AND organizer_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all event attendees" ON event_attendees
    FOR ALL USING (is_admin(auth.uid()));

-- Documents policies (admin only for now)
CREATE POLICY "Admins can manage documents" ON documents
    FOR ALL USING (is_admin(auth.uid()));

-- Document embeddings policies (admin only)
CREATE POLICY "Admins can manage document embeddings" ON document_embeddings
    FOR ALL USING (is_admin(auth.uid()));

-- Activity log policies (admin only)
CREATE POLICY "Admins can view activity log" ON activity_log
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert activity log" ON activity_log
    FOR INSERT WITH CHECK (true);
