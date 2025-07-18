// src/services/api.ts (FINAL, CORRECTED VERSION)

import { createClient } from '@supabase/supabase-js';
import { LoginCredentials, Student, FeeRecord, ExamRecord, Notice } from '../types';

// Initialize the Supabase client here once.
// Make sure your .env file has these variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables (REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY) are not configured in your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class ApiService {
  async login(credentials: LoginCredentials): Promise<Student> {
  const { rollNumber, dateOfBirth } = credentials;
  console.log(`[API] Attempting login with sr_no: '${rollNumber}'`);

  if (!rollNumber || !dateOfBirth) {
    throw new Error("SR Number and Date of Birth are required.");
  }

  // This is the original logic that queries the students table directly.
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('sr_no', rollNumber.trim())
    .eq('dob', dateOfBirth)
    .single();

  if (error) {
    console.error("Login API Error:", error);
    throw new Error("Invalid SR Number or Date of Birth.");
  }
  if (!data) {
    throw new Error("No student record found for the provided credentials.");
  }
  
  // Assuming you have a mapping step, keep it as it was.
  // This is a generic mapping based on your previous code.
  const mappedStudent: Student = {
    id: data.id,
    name: data.name,
    class: data.class,
    srNo: data.sr_no,
    fatherName: data.father_name,
    motherName: data.mother_name,
    contact: data.contact,
    address: data.address,
    medium: data.medium,
    gender: data.gender,
    dob: data.dob,
    bus_route: data.bus_route,
    religion: data.religion,
    nicStudentId: data.nic_student_id,
    isRte: data.is_rte,
  };
  
  return mappedStudent;
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