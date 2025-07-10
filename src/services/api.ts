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
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      // This gets notices for ALL or for the student's SPECIFIC class.
      .or(`target_class.is.null,target_class.eq.${studentClass}`);
      
    if (error) {
      console.error("API Error fetching notices:", error);
      throw new Error("Failed to fetch school notices.");
    }
    return data || [];
  }

  // --- NEW, CORRECT getNotifications FUNCTION ---
  async getNotifications(student: Student): Promise<Notification[]> {
    // Safety check to ensure we have a valid student object
    if (!student || !student.class || !student.medium || !student.srNo) {
        console.warn("getNotifications called without complete student data. Returning empty array.");
        return [];
    }

    try {
        // We will make three simple, separate queries and combine the results.
        // This is much more reliable than one complex .or() filter.

        // Query 1: Get notifications for 'all'
        const allPromise = supabase
            .from('notifications')
            .select('*')
            .eq('target_audience', 'all');

        // Query 2: Get notifications for the student's specific class and medium
        const classPromise = supabase
            .from('notifications')
            .select('*')
            .eq('target_audience', 'class_specific')
            .eq('target_class', student.class)
            .eq('target_medium', student.medium);

        // Query 3: Get notifications for this specific student by their SR number
        const studentPromise = supabase
            .from('notifications')
            .select('*')
            .eq('target_audience', 'student_specific')
            .eq('target_student_sr_no', student.srNo);

        // Run all three queries at the same time
        const [allRes, classRes, studentRes] = await Promise.all([allPromise, classPromise, studentPromise]);

        // Check for errors in any of the queries
        if (allRes.error) throw allRes.error;
        if (classRes.error) throw classRes.error;
        if (studentRes.error) throw studentRes.error;

        // Combine the results from all three queries
        const combinedData = [
            ...(allRes.data || []),
            ...(classRes.data || []),
            ...(studentRes.data || [])
        ];

        // Remove duplicate notifications (in case one was sent multiple ways)
        const uniqueNotifications = Array.from(new Map(combinedData.map(item => [item.id, item])).values());
        
        // Sort by creation date
        uniqueNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Map the final, unique data to our frontend Notification type
        return uniqueNotifications.map((n): Notification => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            created_at: n.created_at,
            read: false, // Default to unread
            // Add other properties as needed
        }));

    } catch (error: any) {
        console.error("API Error fetching notifications:", error);
        throw new Error("Failed to fetch personal notifications.");
    }
}


// <-- The class now correctly ends here

// Create and export a single instance of the service for the whole app to use
export const apiService = new ApiService();