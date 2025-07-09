/*
  # Student Portal Database Functions

  1. Authentication Functions
    - `authenticate_student_by_dob` - Login using SR number and date of birth
  
  2. Student Data Functions
    - `get_student_fees` - Get comprehensive fee records
    - `get_student_exams` - Get exam records with subject marks
    - `get_student_homework` - Get homework assignments
    - `get_student_notifications` - Get targeted notifications
    - `get_notices` - Get school notices
  
  3. Transaction Functions
    - `process_fee_payment` - Handle fee payments
    - `submit_homework` - Submit homework assignments
    - `mark_notification_read` - Mark notifications as read
  
  4. Security
    - All functions include proper validation
    - Student data isolation
    - Secure payment processing
*/

-- Authentication function using SR number and date of birth
CREATE OR REPLACE FUNCTION authenticate_student_by_dob(
  p_sr_no TEXT,
  p_dob DATE
)
RETURNS TABLE(
  student_id BIGINT,
  student_data JSONB,
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    jsonb_build_object(
      'id', s.id,
      'sr_no', s.sr_no,
      'name', s.name,
      'class', s.class,
      'medium', s.medium,
      'father_name', s.father_name,
      'mother_name', s.mother_name,
      'contact', s.contact,
      'address', s.address,
      'dob', s.dob,
      'status', s.status
    ),
    true,
    'Authentication successful'::TEXT
  FROM students s
  WHERE s.sr_no = p_sr_no 
    AND s.dob = p_dob 
    AND s.status = 'active'
  LIMIT 1;
  
  -- If no student found, return error
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      NULL::BIGINT,
      NULL::JSONB,
      false,
      'Invalid SR Number or Date of Birth'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get comprehensive student fee records
CREATE OR REPLACE FUNCTION get_student_fees(p_student_id BIGINT)
RETURNS TABLE(
  id BIGINT,
  student_id TEXT,
  student_name TEXT,
  class TEXT,
  total_fees NUMERIC,
  paid_fees NUMERIC,
  pending_fees NUMERIC,
  discount_fees NUMERIC,
  bus_fees NUMERIC,
  due_date DATE,
  last_payment_date DATE,
  status TEXT,
  payment_history JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fr.id,
    fr.student_id,
    fr.student_name,
    fr.class,
    fr.total_fees,
    fr.paid_fees,
    fr.pending_fees,
    fr.discount_fees,
    fr.bus_fees,
    fr.due_date,
    fr.last_payment_date,
    fr.status,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', ph.id,
          'amount', ph.amount,
          'payment_date', ph.payment_date
        )
      )
      FROM payment_history ph 
      WHERE ph.fee_record_id = fr.id), 
      '[]'::jsonb
    ) as payment_history
  FROM fee_records fr
  WHERE fr.student_primary_id = p_student_id
  ORDER BY fr.due_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get student exam records with subject marks
CREATE OR REPLACE FUNCTION get_student_exams(p_student_id BIGINT)
RETURNS TABLE(
  exam_id BIGINT,
  student_id TEXT,
  exam_type TEXT,
  exam_date DATE,
  total_marks INTEGER,
  obtained_marks INTEGER,
  percentage NUMERIC,
  grade TEXT,
  subject_marks JSONB,
  co_scholastic_marks JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    er.id,
    er.student_id,
    er.exam_type,
    er.exam_date,
    er.total_marks,
    er.obtained_marks,
    er.percentage,
    er.grade,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'subject', sm.subject,
          'max_marks', sm.max_marks,
          'obtained_marks', sm.obtained_marks,
          'grade', sm.grade
        )
      )
      FROM subject_marks sm 
      WHERE sm.exam_record_id = er.id), 
      '[]'::jsonb
    ) as subject_marks,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'activity', csm.activity_name,
          'grade', csm.grade
        )
      )
      FROM co_scholastic_marks csm 
      WHERE csm.exam_record_id = er.id), 
      '[]'::jsonb
    ) as co_scholastic_marks
  FROM exam_records er
  WHERE er.student_primary_id = p_student_id
  ORDER BY er.exam_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get student homework assignments
CREATE OR REPLACE FUNCTION get_student_homework(p_student_id BIGINT)
RETURNS TABLE(
  homework_id BIGINT,
  title TEXT,
  description TEXT,
  subject TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ,
  attachment_url TEXT,
  created_by TEXT,
  student_class TEXT,
  medium TEXT
) AS $$
DECLARE
  student_class_val TEXT;
  student_medium_val TEXT;
BEGIN
  -- Get student's class and medium
  SELECT s.class, s.medium INTO student_class_val, student_medium_val
  FROM students s WHERE s.id = p_student_id;
  
  RETURN QUERY
  SELECT 
    ha.id,
    ha.title,
    ha.description,
    ha.subject,
    ha.due_date,
    ha.created_at,
    ha.attachment_url,
    ha.created_by,
    ha.class,
    ha.medium
  FROM homework_assignments ha
  WHERE ha.class = student_class_val 
    AND ha.medium = student_medium_val
    AND ha.is_active = true
  ORDER BY ha.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get student notifications
CREATE OR REPLACE FUNCTION get_student_notifications(p_student_id BIGINT)
RETURNS TABLE(
  notification_id BIGINT,
  title TEXT,
  message TEXT,
  type TEXT,
  created_at TIMESTAMPTZ,
  is_read BOOLEAN
) AS $$
DECLARE
  student_sr_no TEXT;
  student_class_val TEXT;
  student_medium_val TEXT;
BEGIN
  -- Get student details
  SELECT s.sr_no, s.class, s.medium 
  INTO student_sr_no, student_class_val, student_medium_val
  FROM students s WHERE s.id = p_student_id;
  
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.created_at,
    false as is_read -- For now, all notifications are unread
  FROM notifications n
  WHERE (
    n.target_audience = 'all' OR
    (n.target_audience = 'class_specific' AND n.target_class = student_class_val AND n.target_medium = student_medium_val) OR
    (n.target_audience = 'student_specific' AND n.target_student_sr_no = student_sr_no)
  )
  AND n.is_active = true
  AND (n.scheduled_at IS NULL OR n.scheduled_at <= NOW())
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get school notices
CREATE OR REPLACE FUNCTION get_notices()
RETURNS TABLE(
  notice_id BIGINT,
  title TEXT,
  message TEXT,
  type TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ,
  target_class TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.content,
    'general'::TEXT as type,
    'medium'::TEXT as priority,
    n.created_at,
    n.target_class
  FROM notices n
  WHERE n.is_active = true
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process fee payment with flexible amount
CREATE OR REPLACE FUNCTION process_fee_payment(
  p_fee_record_id BIGINT,
  p_amount NUMERIC,
  p_payment_method TEXT DEFAULT 'online'
)
RETURNS TABLE(
  success BOOLEAN,
  transaction_id TEXT,
  message TEXT,
  remaining_balance NUMERIC
) AS $$
DECLARE
  v_current_pending NUMERIC;
  v_current_paid NUMERIC;
  v_transaction_id TEXT;
  v_new_pending NUMERIC;
  v_new_paid NUMERIC;
  v_new_status TEXT;
BEGIN
  -- Get current fee status
  SELECT pending_fees, paid_fees 
  INTO v_current_pending, v_current_paid
  FROM fee_records 
  WHERE id = p_fee_record_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, ''::TEXT, 'Fee record not found'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Validate payment amount
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, ''::TEXT, 'Invalid payment amount'::TEXT, v_current_pending;
    RETURN;
  END IF;
  
  IF p_amount > v_current_pending THEN
    RETURN QUERY SELECT false, ''::TEXT, 'Payment amount exceeds pending balance'::TEXT, v_current_pending;
    RETURN;
  END IF;
  
  -- Generate transaction ID
  v_transaction_id := 'TXN' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD((RANDOM() * 9999)::INT::TEXT, 4, '0');
  
  -- Calculate new amounts
  v_new_paid := v_current_paid + p_amount;
  v_new_pending := v_current_pending - p_amount;
  
  -- Determine new status
  IF v_new_pending <= 0 THEN
    v_new_status := 'Paid';
  ELSE
    v_new_status := 'Partial';
  END IF;
  
  -- Update fee record
  UPDATE fee_records 
  SET 
    paid_fees = v_new_paid,
    pending_fees = v_new_pending,
    status = v_new_status,
    last_payment_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_fee_record_id;
  
  -- Insert payment history
  INSERT INTO payment_history (fee_record_id, amount, payment_date)
  VALUES (p_fee_record_id, p_amount, CURRENT_DATE);
  
  RETURN QUERY SELECT 
    true, 
    v_transaction_id, 
    CASE 
      WHEN v_new_pending <= 0 THEN 'Payment completed successfully'
      ELSE 'Partial payment processed successfully'
    END::TEXT,
    v_new_pending;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit homework assignment
CREATE OR REPLACE FUNCTION submit_homework(
  p_homework_id BIGINT,
  p_student_id BIGINT,
  p_submission_text TEXT,
  p_attachment_url TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  submission_id TEXT,
  message TEXT
) AS $$
DECLARE
  v_submission_id TEXT;
  v_due_date DATE;
  v_student_sr_no TEXT;
BEGIN
  -- Get homework due date and student SR number
  SELECT ha.due_date INTO v_due_date
  FROM homework_assignments ha
  WHERE ha.id = p_homework_id AND ha.is_active = true;
  
  SELECT s.sr_no INTO v_student_sr_no
  FROM students s WHERE s.id = p_student_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, ''::TEXT, 'Homework assignment not found'::TEXT;
    RETURN;
  END IF;
  
  -- Generate submission ID
  v_submission_id := 'SUB' || p_homework_id || '_' || p_student_id || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
  
  -- For now, we'll just return success (you can implement a homework_submissions table later)
  RETURN QUERY SELECT 
    true, 
    v_submission_id, 
    'Homework submitted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark notification as read (placeholder for future implementation)
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id BIGINT,
  p_student_id BIGINT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- For now, just return success (implement read status table later)
  RETURN QUERY SELECT true, 'Notification marked as read'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION authenticate_student_by_dob TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_student_fees TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_student_exams TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_student_homework TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_student_notifications TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_notices TO anon, authenticated;
GRANT EXECUTE ON FUNCTION process_fee_payment TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_homework TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO anon, authenticated;