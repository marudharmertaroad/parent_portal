// src/services/api.ts (FINAL, CORRECTED VERSION)

import { supabase } from '../lib/supabase';
import { LoginCredentials, Student, FeeRecord, ExamRecord, Notice} from '../types';

class ApiService {
  
  async function login(credentials: LoginCredentials): Promise<Student> {
    try {
        const { data, error } = await supabase.functions.invoke('parent-login', {
            body: { 
                username: credentials.srNo, 
                dob: credentials.dob // Using dob as the password
            },
        });

        // --- DEBUG LOGGING ---
        console.log('API RESPONSE | Received from Edge Function:', data);
        // ---------------------

        if (error) {
            const errorMessage = error.context?.error?.message || error.message || "An unknown login error occurred.";
            throw new Error(errorMessage);
        }
        
        if (!data || !data.user_id) {
            // If the data is missing or doesn't have a user_id, stop the login.
            throw new Error("Login failed: Server did not return complete user data.");
        }
        
        return data as Student;

    } catch (err: any) {
        console.error("API Service Login Error:", err);
        throw new Error(err.message || "Failed to connect to the server.");
    }
}


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
        // We must also fetch the related subject marks
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
        // Map the subject marks
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
      // This is the corrected 'or' filter. It only checks for target_class.
      .or(`target_class.is.null,target_class.eq.${student.class}`);
      
    if (error) {
      console.error("API Error fetching notices:", error);
      throw new Error("Failed to fetch school notices.");
    }
    return data || [];
}
}
export const apiService = new ApiService();