// src/services/api.ts (The single, unified API service file)

import { supabase } from '../lib/supabase'; // Use your correct path to the supabase client
import { LoginCredentials, Student, FeeRecord, ExamRecord, Notice, Homework } from '../types'; // Import all types from your central file

class ApiService {
  /**
   * Logs in a student by verifying their SR No. and Date of Birth.
   * On success, it returns the full, correctly mapped Student object.
   */
  async login(credentials: LoginCredentials): Promise<Student> {
    const { rollNumber, dateOfBirth } = credentials;
    if (!rollNumber || !dateOfBirth) {
      throw new Error("SR Number and Date of Birth are required.");
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('sr_no', rollNumber.trim()) // Match database column
      .eq('dob', dateOfBirth)
      .single();

    if (error) {
      console.error("Login API Error:", error);
      // Provide a user-friendly error for the most common failure case
      if (error.code === 'PGRST116') { // "0 rows found"
        throw new Error("Invalid SR Number or Date of Birth. Please check your details.");
      }
      throw new Error("Could not verify credentials. Please try again later.");
    }

    // Map the database columns (snake_case) to our frontend Student type (camelCase)
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

  /**
   * Fetches all fee records for a specific student using their database ID.
   */
  async getFeeRecords(studentId: number): Promise<FeeRecord[]> {
    const { data, error } = await supabase
      .from('fee_records')
      .select('*')
      .eq('student_primary_id', studentId); // Use the foreign key

    if (error) {
      console.error("API Error fetching fees:", error);
      throw new Error("Failed to fetch fee records.");
    }
    
    // Map data to the FeeRecord type
    return (data || []).map(r => ({
        recordId: r.id,
        studentId: r.student_id, // This is the sr_no
        totalFees: r.total_fees,
        paidFees: r.paid_fees,
        pendingFees: r.pending_fees,
        discountFees: r.discount_fees,
        busFees: r.bus_fees,
        dueDate: r.due_date,
        status: r.pending_fees <= 0 ? 'Paid' : new Date(r.due_date) < new Date() ? 'Overdue' : 'Pending'
    }));
  }

  /**
   * Fetches all exam records for a specific student.
   */
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
        created_at: r.created_at, // Pass this along if needed
    }));
  }

  /**
   * Fetches all notices for a student's class or for everyone.
   */
  async getNotices(studentClass: string, medium: string): Promise<Notice[]> {
    try {
      // --- THIS IS THE CORRECTED QUERY ---
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        // Correct syntax for: (target_class is null) OR (target_class = 'Tenth' AND medium = 'English')
        .or(
          `target_class.is.null, and(target_class.eq.${studentClass}, medium.eq.${medium})`
        );
        
      if (error) {
        // We will now throw the specific Supabase error for better debugging
        throw error;
      }
      
      // Map the data to your Notice type
      return (data || []).map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        created_at: n.created_at,
        // ... add other Notice properties if needed
      }));

    } catch (error: any) {
      console.error("API Error fetching notices:", error);
      // Re-throw the error so the calling function knows it failed
      throw new Error("Failed to fetch notices.");
    }
};

// Create and export a single instance of the service for the whole app to use
export const apiService = new ApiService();