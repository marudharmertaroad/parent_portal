// src/services/api.ts (FINAL, CORRECTED VERSION)

import { supabase } from '../lib/supabase';
import { LoginCredentials, Student, FeeRecord, ExamRecord, Notice } from '../types';

class ApiService {
  
  async login(credentials: LoginCredentials): Promise<Student> {
    const { rollNumber, dateOfBirth } = credentials;
    if (!rollNumber || !dateOfBirth) throw new Error("SR Number and Date of Birth are required.");

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

    // Map database columns to our frontend Student type
    return {
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
  
  // --- FIX: This function is now correctly placed INSIDE the ApiService class ---
  async getNotices(studentClass: string, medium: string): Promise<Notice[]> {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .or(`target_class.is.null,target_class.eq.${studentClass}`);
        
      if (error) throw error;
      
      return (data || []).map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        created_at: n.created_at,
      }));

    } catch (error: any) {
      console.error("API Error fetching notices:", error);
      throw new Error("Failed to fetch notices.");
    }
  }
  async getNotifications(student: Student): Promise<Notification[]> {
    // Safety check
    if (!student || !student.class || !student.medium || !student.srNo) {
        return [];
    }

    try {
        // --- THIS IS THE CORRECTED QUERY ---
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            // The .or() filter finds rows that match ANY of these conditions:
            .or(
                // 1. Where the audience is 'all'
                'target_audience.eq.all',
                // 2. OR where it's for this student's specific class AND medium
                `and(target_audience.eq.class_specific,target_class.eq.${student.class},target_medium.eq.${student.medium})`,
                // 3. OR where it's for this student's specific SR Number
                `and(target_audience.eq.student_specific,target_student_sr_no.eq.${student.srNo})`
            )
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Map the data to your Notification type
        return (data || []).map((n): Notification => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            target_audience: n.target_audience,
            created_at: n.created_at,
            // Add other properties if they exist in your type/table
        }));

    } catch (error: any) {
        console.error("API Error fetching notifications:", error);
        throw new Error("Failed to fetch personal notifications.");
    }
}

}
// <-- The class now correctly ends here

// Create and export a single instance of the service for the whole app to use
export const apiService = new ApiService();