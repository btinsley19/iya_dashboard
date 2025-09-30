-- Seed script for initial data
-- Run this after setting up the database schema

-- Insert initial skills
INSERT INTO skills (name, description) VALUES
('React', 'JavaScript library for building user interfaces'),
('TypeScript', 'Typed superset of JavaScript'),
('Node.js', 'JavaScript runtime for server-side development'),
('Python', 'High-level programming language'),
('Machine Learning', 'AI technique for pattern recognition'),
('Data Science', 'Interdisciplinary field for extracting insights from data'),
('Web Development', 'Building websites and web applications'),
('Mobile Development', 'Creating mobile applications'),
('UI/UX Design', 'User interface and user experience design'),
('Database Design', 'Designing and managing database systems'),
('DevOps', 'Development and operations practices'),
('Cloud Computing', 'Computing services delivered over the internet'),
('Cybersecurity', 'Protecting digital systems and data'),
('Blockchain', 'Distributed ledger technology'),
('Game Development', 'Creating video games'),
('AR/VR', 'Augmented and Virtual Reality development')
ON CONFLICT (name) DO NOTHING;

-- Insert initial tags
INSERT INTO tags (name, description) VALUES
('Frontend', 'Client-side development'),
('Backend', 'Server-side development'),
('Full Stack', 'Both frontend and backend development'),
('AI/ML', 'Artificial Intelligence and Machine Learning'),
('Data Analytics', 'Analyzing data to extract insights'),
('Startups', 'Entrepreneurship and startup culture'),
('Open Source', 'Open source software development'),
('Research', 'Academic and industry research'),
('Hackathons', 'Coding competitions and events'),
('Internships', 'Work experience opportunities'),
('Career Development', 'Professional growth and advancement'),
('Networking', 'Building professional connections'),
('Mentoring', 'Teaching and guiding others'),
('Collaboration', 'Working with others on projects'),
('Innovation', 'Creating new solutions and ideas'),
('Technology', 'General technology topics')
ON CONFLICT (name) DO NOTHING;

-- Insert initial classes
INSERT INTO classes (school, code, title, term, year, description) VALUES
('USC', 'CSCI 103', 'Object-Oriented Programming', 'Fall', 2024, 'Introduction to object-oriented programming concepts'),
('USC', 'CSCI 104', 'Data Structures and Algorithms', 'Spring', 2025, 'Fundamental data structures and algorithm analysis'),
('USC', 'CSCI 201', 'Introduction to Software Engineering', 'Fall', 2024, 'Software development lifecycle and practices'),
('USC', 'CSCI 310', 'Mobile App Development', 'Spring', 2025, 'Building mobile applications for iOS and Android'),
('USC', 'CSCI 567', 'Machine Learning', 'Fall', 2024, 'Introduction to machine learning algorithms and applications'),
('USC', 'CSCI 585', 'Database Systems', 'Spring', 2025, 'Database design, implementation, and management'),
('USC', 'CSCI 571', 'Web Technologies', 'Fall', 2024, 'Modern web development technologies and frameworks'),
('USC', 'CSCI 544', 'Applied Natural Language Processing', 'Spring', 2025, 'NLP techniques and applications'),
('USC', 'CSCI 526', 'Advanced Mobile Devices and Game Consoles', 'Fall', 2024, 'Advanced mobile and game development'),
('USC', 'CSCI 599', 'Special Topics in Computer Science', 'Spring', 2025, 'Current topics in computer science research')
ON CONFLICT (school, code, term, year) DO NOTHING;

-- Create a demo admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'your-admin-user-id' with the actual UUID from auth.users
-- INSERT INTO profiles (id, full_name, email, status, role) VALUES
-- ('your-admin-user-id', 'Admin User', 'admin@usc.edu', 'active', 'admin');

-- Create some sample projects (these will be created by users, but here's an example structure)
-- INSERT INTO projects (title, summary, description, owner_id, visibility) VALUES
-- ('USC Course Planner', 'A web application to help students plan their course schedules', 'Built with React and Node.js, this app helps USC students visualize their academic path and plan their semesters effectively.', 'your-user-id', 'public');

-- Create some sample events
INSERT INTO events (title, description, start_time, end_time, location, organizer_id, visibility) VALUES
('Tech Career Fair 2025', 'Annual technology career fair featuring top companies', '2025-02-15 10:00:00+00', '2025-02-15 16:00:00+00', 'USC Campus - Trousdale Parkway', '00000000-0000-0000-0000-000000000000', 'public'),
('HackSC 2025', 'USC''s premier hackathon event', '2025-03-20 18:00:00+00', '2025-03-22 18:00:00+00', 'USC Campus - Various Locations', '00000000-0000-0000-0000-000000000000', 'public'),
('AI/ML Workshop', 'Hands-on workshop on machine learning with Python', '2025-01-25 14:00:00+00', '2025-01-25 17:00:00+00', 'USC Campus - SAL 101', '00000000-0000-0000-0000-000000000000', 'public'),
('Startup Pitch Competition', 'Student startup pitch competition with prizes', '2025-04-10 19:00:00+00', '2025-04-10 22:00:00+00', 'USC Campus - Annenberg Auditorium', '00000000-0000-0000-0000-000000000000', 'public')
ON CONFLICT DO NOTHING;

-- Create the match_documents function for semantic search
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  entity_type entity_type,
  entity_id uuid,
  title text,
  content_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.entity_type,
    d.entity_id,
    d.title,
    d.content_text,
    1 - (de.embedding <=> query_embedding) as similarity
  FROM documents d
  JOIN document_embeddings de ON d.id = de.doc_id
  WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_gin ON profiles USING gin(to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS idx_projects_title_gin ON projects USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_events_title_gin ON events USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_classes_title_gin ON classes USING gin(to_tsvector('english', title));

-- Create a function to automatically create document embeddings when profiles are updated
CREATE OR REPLACE FUNCTION create_profile_document()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called from the application layer
  -- For now, we'll just log the change
  INSERT INTO activity_log (entity_type, entity_id, action, metadata)
  VALUES ('profile', NEW.id, 'profile_updated', jsonb_build_object('updated_at', NOW()));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS profile_document_trigger ON profiles;
CREATE TRIGGER profile_document_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_document();
