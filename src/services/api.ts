// src/services/api.ts

import { supabase } from '../lib/supabase'; // Make sure this path is correct
import { LoginCredentials, Student, FeeRecord, ExamRecord, Homework, Notice } from '../types';

class ApiService {
  
  // --- The Login Function ---
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

    if (error || !data) {
      console.error("Login API Error:", error);
      throw new Error("Invalid credentials or student not found.");
    }

    // Map database snake_case to our frontend camelCase Student type
    return {
      id: data.id,
      srNo: data.sr_no,
      name: data.name,
      class: data.class,
      medium: data.medium,
      fatherName: data.father_name,
      motherName: data.mother_name,
      contact: data.contact,
      address: data.address,
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
    if (error) throw error;
    // Map data to FeeRecord type
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
        .select('*')
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
        examDate: r.exam_date
    }));
  }
  
  // Note: HomeworkSection will have its own fetch logic, so we don't need one here.

  async getNotices(studentClass: string, medium: string): Promise<Notice[]> {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .or(`target_class.is.null,and(target_class.eq.${studentClass},medium.eq.${medium})`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

export const apiService = new ApiService();