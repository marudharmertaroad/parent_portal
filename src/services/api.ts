// src/services/api.ts (FINAL AND COMPLETE VERSION)

import { supabase } from '../lib/supabase';
import { LoginCredentials, Student, FeeRecord, ExamRecord, Notice, Homework } from '../types';

// Define the shape of the API response for consistency
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  
  // --- The Login Function (already corrected) ---
  async login(credentials: LoginCredentials): Promise<Student> {
    const { rollNumber, dateOfBirth } = credentials;
    if (!rollNumber || !dateOfBirth) {
      throw new Error("SR Number and Date of Birth are required.");
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('sr_no', rollNumber.trim())
      .eq('dob', dateOfBirth)
      .single();

    if (error) {
      console.error("Login API Error:", error);
      if (error.code === 'PGRST116') {
        throw new Error("Invalid SR Number or Date of Birth.");
      }
      throw new Error("Could not verify credentials.");
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

  // --- Data Fetching Functions ---

  async getFeeRecords(studentId: number): Promise<FeeRecord[]> {
    const { data, error } = await supabase
      .from('fee_records')
      .select('*')
      .eq('student_primary_id', studentId);

    if (error) {
      console.error("API Error fetching fees:", error);
      throw new Error("Failed to fetch fee records.");
    }
    
    return (data || []).map(r => ({
        recordId: r.id,
        studentId: r.student_id,
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
        .select('*')
        .eq('student_primary_id', studentId)
        .order('exam_date', { ascending: false });

    if (error) {
        console.error("API Error fetching exams:", error);
        throw new Error("Failed to fetch exam records.");
    }

    return (data || []).map(r => ({
        id: r.id,
        studentId: r.student_id,
        examType: r.exam_type,
        totalMarks: r.total_marks,
        obtainedMarks: r.obtained_marks,
        percentage: r.percentage,
        grade: r.grade,
        examDate: r.exam_date,
        created_at: r.created_at,
    }));
  }
  
  // --- THIS IS THE CORRECTED getNotices FUNCTION, PLACED INSIDE THE CLASS ---
  async getNotices(studentClass: string, medium: string): Promise<Notice[]> {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .or(`target_class.is.null,and(target_class.eq.${studentClass},medium.eq.${medium})`);
        
      if (error) {
        throw error;
      }
      
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
}

// Create and export a single instance of the service for the whole app to use
export const apiService = new ApiService();