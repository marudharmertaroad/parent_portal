// src/services/api.ts (FINAL, CORRECTED VERSION)

import { createClient } from '@supabase/supabase-js';
import { LoginCredentials, Student, FeeRecord, ExamRecord, Notice } from '../types';

// Initialize the Supabase client here once.
// Make sure your .env file has these variables.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables (REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY) are not configured in your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class ApiService {

  /**
   * This is the new, correct login function.
   * It calls our secure Edge Function instead of querying the database directly.
   */
  async login(credentials: LoginCredentials): Promise<Student> {
  const { rollNumber, dateOfBirth } = credentials;
  console.log(`[API] Attempting to authenticate student with sr_no: '${rollNumber}'`);

  if (!rollNumber || !dateOfBirth) {
    throw new Error("SR Number and Date of Birth are required.");
  }

  // Step 1: Construct the unique email and password for Supabase Auth
  const loginEmail = `${rollNumber.trim()}@student.schoolerp`;
  const loginPassword = dateOfBirth;

  // Step 2: Call Supabase's built-in signIn method
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: loginPassword,
  });

  if (authError) {
    console.error("Authentication API Error:", authError.message);
    throw new Error("Invalid SR Number or Date of Birth.");
  }
  if (!authData.user) {
    throw new Error("Login failed, user data not returned.");
  }
  
  const user = authData.user;
  console.log(`[API] Auth successful for user ID: ${user.id}`);

  // Step 3: Now that authentication is successful, fetch the full student profile.
  const { data: studentProfile, error: profileError } = await supabase
    .from('students')
    .select('*')
    .eq('sr_no', rollNumber.trim())
    .single();

  if (profileError || !studentProfile) {
    console.error("[API] Auth successful, but could not fetch student profile.", profileError);
    throw new Error("Could not find student record after successful login.");
  }

  // Step 4: Combine the student profile with the user ID and return it.
  // This is the crucial step that adds the user_id to the student object.
  const studentWithAuth: Student = {
    ...studentProfile,
    user_id: user.id // Add the user_id here!
  };

  return studentWithAuth;
}

  // --- YOUR OTHER API FUNCTIONS REMAIN THE SAME ---

  async getFeeRecords(studentId: number): Promise<FeeRecord[]> {
    const { data, error } = await supabase.from('fee_records').select('*').eq('student_primary_id', studentId);
    if (error) throw error;
    return (data || []).map(r => ({
      recordId: r.id,
      totalFees: r.total_fees,
      paidFees: r.paid_fees,
      pendingFees: r.pending_fees,
      discountFees: r.discount_fees,
      busFees: r.bus_fees,
      dueDate: r.due_date,
      status: r.pending_fees <= 0 ? 'Paid' : new Date(r.due_date) < new Date() ? 'Overdue' : 'Pending'
    }));
  }

  async getExamRecords(studentId: number): Promise<ExamRecord[]> {
    const { data, error } = await supabase
        .from('exam_records')
        .select('*, subject_marks(*)') 
        .eq('student_primary_id', studentId)
        .order('exam_date', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(r => ({
        id: r.id,
        examType: r.exam_type,
        totalMarks: r.total_marks,
        obtainedMarks: r.obtained_marks,
        percentage: r.percentage,
        grade: r.grade,
        examDate: r.exam_date,
        subjects: (r.subject_marks || []).map(sm => ({
            subject: sm.subject,
            maxMarks: sm.max_marks,
            obtainedMarks: sm.obtained_marks,
            grade: sm.grade,
        }))
    }));
  }
 
  async getNotices(student: Student): Promise<Notice[]> {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .or(`target_class.is.null,target_class.eq.${student.class}`);
      
    if (error) {
      console.error("API Error fetching notices:", error);
      throw new Error("Failed to fetch school notices.");
    }
    return data || [];
  }
}

export const apiService = new ApiService();