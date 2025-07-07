-- Update the authentication function to use SR Number and Date of Birth
CREATE OR REPLACE FUNCTION authenticate_student(p_sr_no TEXT, p_dob DATE)
RETURNS TABLE(
  student_id BIGINT,
  student_data JSONB,
  success BOOLEAN,
  message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_record RECORD;
BEGIN
  -- Find student by SR number and date of birth
  SELECT * INTO student_record
  FROM students 
  WHERE sr_no = p_sr_no AND dob = p_dob AND status = 'active';
  
  IF student_record IS NULL THEN
    RETURN QUERY SELECT 
      NULL::BIGINT,
      NULL::JSONB,
      FALSE,
      'Invalid SR Number or Date of Birth. Please check your credentials.'::TEXT;
    RETURN;
  END IF;
  
  -- Return student data
  RETURN QUERY SELECT 
    student_record.id,
    jsonb_build_object(
      'id', student_record.id,
      'name', student_record.name,
      'class', student_record.class,
      'sr_no', student_record.sr_no,
      'nic_student_id', student_record.nic_student_id,
      'medium', student_record.medium,
      'father_name', student_record.father_name,
      'mother_name', student_record.mother_name,
      'gender', student_record.gender,
      'dob', student_record.dob,
      'contact', student_record.contact,
      'address', student_record.address,
      'bus_route', student_record.bus_route,
      'religion', student_record.religion,
      'is_rte', student_record.is_rte,
      'status', student_record.status
    ),
    TRUE,
    'Login successful'::TEXT;
END;
$$;

-- Create index for better performance on SR number and DOB lookup
CREATE INDEX IF NOT EXISTS idx_students_sr_no_dob ON students(sr_no, dob);

-- Update the function call signature in the API service
COMMENT ON FUNCTION authenticate_student(TEXT, DATE) IS 'Authenticates student using SR Number and Date of Birth';