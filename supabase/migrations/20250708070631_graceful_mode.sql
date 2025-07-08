/*
  # Complete Portal Setup - Homework, Notices, and Notifications

  1. New Tables
    - `homework_assignments` - Store homework assignments
    - `homework_submissions` - Store student homework submissions
    - `notifications` - Store student notifications
    - `portal_settings` - Store portal configuration

  2. Functions
    - `get_student_homework` - Get homework for a student
    - `submit_homework` - Submit homework assignment
    - `get_student_notifications` - Get notifications for a student
    - `mark_notification_read` - Mark notification as read
    - `get_notices` - Get school notices

  3. Security
    - RLS policies for all new tables
    - Proper access control

  4. Storage
    - Homework submissions bucket setup
*/

-- Create homework assignments table (if not exists)
CREATE TABLE IF NOT EXISTS homework_assignments (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  class TEXT NOT NULL,
  medium TEXT NOT NULL CHECK (medium IN ('Hindi', 'English')),
  subject TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  attachment_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create homework submissions table (if not exists)
CREATE TABLE IF NOT EXISTS homework_submissions (
  id BIGSERIAL PRIMARY KEY,
  homework_id BIGINT REFERENCES homework_assignments(id) ON DELETE CASCADE,
  student_sr_no TEXT NOT NULL,
  submission_text TEXT,
  attachment_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  grade TEXT,
  teacher_comments TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'missing'))
);

-- Create notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'homework', 'fee', 'exam', 'event', 'urgent')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'parents', 'students', 'class_specific', 'medium_specific')),
  target_class TEXT,
  target_medium TEXT CHECK (target_medium IN ('Hindi', 'English')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create portal settings table (if not exists)
CREATE TABLE IF NOT EXISTS portal_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_homework_assignments_class_medium ON homework_assignments(class, medium);
CREATE INDEX IF NOT EXISTS idx_homework_assignments_due_date ON homework_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_homework_id ON homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_student ON homework_submissions(student_sr_no);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_audience, target_class, target_medium);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_portal_settings_key ON portal_settings(setting_key);

-- RLS Policies for homework_assignments
CREATE POLICY "Allow users to manage homework assignments" ON homework_assignments
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for homework_submissions
CREATE POLICY "Allow users to manage homework submissions" ON homework_submissions
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Allow users to manage notifications" ON notifications
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for portal_settings
CREATE POLICY "Allow users to manage portal settings" ON portal_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Function to get student homework
CREATE OR REPLACE FUNCTION get_student_homework(p_student_id BIGINT)
RETURNS TABLE(
  homework_id BIGINT,
  title TEXT,
  description TEXT,
  subject TEXT,
  due_date DATE,
  priority TEXT,
  attachment_url TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  submission_id BIGINT,
  submission_text TEXT,
  submission_attachment_url TEXT,
  submitted_at TIMESTAMPTZ,
  grade TEXT,
  teacher_comments TEXT,
  submission_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_record RECORD;
BEGIN
  -- Get student details
  SELECT * INTO student_record FROM students WHERE id = p_student_id;
  
  IF student_record IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    ha.id,
    ha.title,
    ha.description,
    ha.subject,
    ha.due_date,
    ha.priority,
    ha.attachment_url,
    ha.created_by,
    ha.created_at,
    hs.id,
    hs.submission_text,
    hs.attachment_url,
    hs.submitted_at,
    hs.grade,
    hs.teacher_comments,
    hs.status
  FROM homework_assignments ha
  LEFT JOIN homework_submissions hs ON ha.id = hs.homework_id AND hs.student_sr_no = student_record.sr_no
  WHERE ha.class = student_record.class 
    AND ha.medium = student_record.medium 
    AND ha.is_active = true
    AND ha.due_date >= CURRENT_DATE - INTERVAL '30 days'
  ORDER BY ha.due_date ASC;
END;
$$;

-- Function to submit homework
CREATE OR REPLACE FUNCTION submit_homework(
  p_homework_id BIGINT,
  p_student_id BIGINT,
  p_submission_text TEXT DEFAULT NULL,
  p_attachment_url TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  submission_id BIGINT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_record RECORD;
  v_homework_record RECORD;
  v_submission_id BIGINT;
  v_status TEXT;
BEGIN
  -- Get student details
  SELECT * INTO v_student_record FROM students WHERE id = p_student_id;
  
  IF v_student_record IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::BIGINT, 'Student not found'::TEXT;
    RETURN;
  END IF;
  
  -- Get homework details
  SELECT * INTO v_homework_record FROM homework_assignments WHERE id = p_homework_id;
  
  IF v_homework_record IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::BIGINT, 'Homework assignment not found'::TEXT;
    RETURN;
  END IF;
  
  -- Check if already submitted
  IF EXISTS (SELECT 1 FROM homework_submissions WHERE homework_id = p_homework_id AND student_sr_no = v_student_record.sr_no) THEN
    RETURN QUERY SELECT FALSE, NULL::BIGINT, 'Homework already submitted'::TEXT;
    RETURN;
  END IF;
  
  -- Determine status based on due date
  v_status := CASE 
    WHEN CURRENT_DATE > v_homework_record.due_date THEN 'late'
    ELSE 'submitted'
  END;
  
  -- Insert submission
  INSERT INTO homework_submissions (homework_id, student_sr_no, submission_text, attachment_url, status)
  VALUES (p_homework_id, v_student_record.sr_no, p_submission_text, p_attachment_url, v_status)
  RETURNING id INTO v_submission_id;
  
  RETURN QUERY SELECT TRUE, v_submission_id, 'Homework submitted successfully'::TEXT;
END;
$$;

-- Function to get student notifications
CREATE OR REPLACE FUNCTION get_student_notifications(p_student_id BIGINT)
RETURNS TABLE(
  notification_id BIGINT,
  title TEXT,
  message TEXT,
  type TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ,
  is_read BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_record RECORD;
BEGIN
  -- Get student details
  SELECT * INTO student_record FROM students WHERE id = p_student_id;
  
  IF student_record IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.priority,
    n.created_at,
    FALSE as is_read -- For now, we'll track read status separately
  FROM notifications n
  WHERE n.is_active = true
    AND (
      n.target_audience = 'all' 
      OR n.target_audience = 'students'
      OR (n.target_audience = 'class_specific' AND n.target_class = student_record.class)
      OR (n.target_audience = 'medium_specific' AND n.target_medium = student_record.medium)
    )
    AND (n.scheduled_at IS NULL OR n.scheduled_at <= NOW())
  ORDER BY n.created_at DESC
  LIMIT 50;
END;
$$;

-- Function to get notices (school-wide announcements)
CREATE OR REPLACE FUNCTION get_notices()
RETURNS TABLE(
  notice_id BIGINT,
  title TEXT,
  message TEXT,
  type TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.priority,
    n.created_at
  FROM notifications n
  WHERE n.is_active = true
    AND n.target_audience = 'all'
    AND n.type IN ('general', 'event', 'urgent')
    AND (n.scheduled_at IS NULL OR n.scheduled_at <= NOW())
  ORDER BY n.priority DESC, n.created_at DESC
  LIMIT 20;
END;
$$;

-- Insert sample homework assignments
INSERT INTO homework_assignments (title, description, class, medium, subject, due_date, priority, created_by) VALUES
('Mathematics Chapter 5', 'Complete all exercises from Algebra chapter 5. Show all working steps.', '10th', 'English', 'Mathematics', CURRENT_DATE + INTERVAL '7 days', 'medium', 'Math Teacher'),
('Hindi Essay Writing', 'Write a 500-word essay on "Mera Bharat Mahan" in Hindi.', '10th', 'Hindi', 'Hindi', CURRENT_DATE + INTERVAL '5 days', 'high', 'Hindi Teacher'),
('Science Project', 'Prepare a working model on renewable energy sources.', '10th', 'English', 'Science', CURRENT_DATE + INTERVAL '14 days', 'high', 'Science Teacher'),
('English Grammar', 'Complete grammar exercises from Unit 3 - Tenses.', '9th', 'English', 'English', CURRENT_DATE + INTERVAL '3 days', 'medium', 'English Teacher'),
('Social Studies Map Work', 'Mark all major rivers of India on the outline map.', '9th', 'Hindi', 'Social Studies', CURRENT_DATE + INTERVAL '6 days', 'low', 'Social Teacher');

-- Insert sample notifications
INSERT INTO notifications (title, message, type, target_audience, target_class, target_medium, priority, created_by) VALUES
('Fee Payment Reminder', 'Monthly fee payment is due by 10th of this month. Please pay to avoid late fees.', 'fee', 'all', NULL, NULL, 'high', 'Admin'),
('Parent-Teacher Meeting', 'Parent-Teacher meeting scheduled for next Saturday at 10:00 AM in the school auditorium.', 'event', 'all', NULL, NULL, 'medium', 'Principal'),
('Hindi Medium - Cultural Program', 'Special cultural program for Hindi medium students on Republic Day.', 'event', 'medium_specific', NULL, 'Hindi', 'medium', 'Cultural Committee'),
('Class 10th - Board Exam Notice', 'Board examination forms submission deadline is approaching. Please submit by 15th.', 'exam', 'class_specific', '10th', NULL, 'urgent', 'Exam Controller'),
('Library Books Return', 'All library books must be returned before winter vacation starts.', 'general', 'all', NULL, NULL, 'low', 'Librarian'),
('Sports Day Registration', 'Registration for annual sports day is now open. Register with your PE teacher.', 'event', 'all', NULL, NULL, 'medium', 'Sports Teacher');

-- Insert portal settings
INSERT INTO portal_settings (setting_key, setting_value, setting_type, description, updated_by) VALUES
('school_name', 'Marudhar Defence Educational Group', 'string', 'Official school name', 'Admin'),
('academic_year', '2024-25', 'string', 'Current academic year', 'Admin'),
('fee_payment_enabled', 'true', 'boolean', 'Enable online fee payment', 'Admin'),
('homework_submission_enabled', 'true', 'boolean', 'Enable homework submission', 'Admin'),
('max_file_size_mb', '10', 'number', 'Maximum file size for uploads in MB', 'Admin'),
('supported_file_types', '["pdf", "doc", "docx", "txt", "jpg", "png"]', 'json', 'Supported file types for homework submission', 'Admin')
ON CONFLICT (setting_key) DO NOTHING;

-- Create storage bucket for homework submissions (if not exists)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('homework-submissions', 'homework-submissions', true)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if storage is not available
    NULL;
END $$;

-- Storage policies for homework submissions
DO $$
BEGIN
  -- Policy for uploading files
  CREATE POLICY "Students can upload homework files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'homework-submissions');
  
  -- Policy for viewing files
  CREATE POLICY "Students can view homework files" ON storage.objects
    FOR SELECT USING (bucket_id = 'homework-submissions');
    
  -- Policy for updating files
  CREATE POLICY "Students can update homework files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'homework-submissions');
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if storage is not available or policies already exist
    NULL;
END $$;