// 1. Import the single, centralized Supabase client
import { supabase } from '../utils/supabaseClient'; 
import { LoginCredentials, Student, FeeRecord, ExamRecord, Notice } from '../types';

class ApiService {
  // 2. This is now the ONLY login function. It contains all the DB logic.
  async getStudentBySrNo(srNo: string): Promise<Student> {
    console.log(`[API] Refreshing data for sr_no: '${srNo}'`);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('sr_no', srNo)
      .single();

    if (error || !data) {
      console.error("API Error refreshing student data:", error);
      throw new Error("Could not find student to refresh.");
    }

    // Reuse the exact same mapping logic from your login function
    const mappedStudent: Student = {
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
      category: data.category,
      nicStudentId: data.nic_student_id,
      isRte: data.is_rte,
      photoUrl: data.photo_url, 
    };
    
    return mappedStudent;
  }

  // 3. Create a logout function (even if it does nothing, for structural integrity)
  async logout(): Promise<void> {
    // In a real app with JWTs, you might call a Supabase logout endpoint.
    // For this app, it's mainly a placeholder.
    console.log("ApiService: Logout action performed.");
    return Promise.resolve();
  }
  
  // --- YOUR OTHER API FUNCTIONS REMAIN THE SAME ---
  // (getFeeRecords, getExamRecords, getNotices)
  async getFeeRecords(studentId: number): Promise<FeeRecord[]> { /* ...your existing code... */ }
  async getExamRecords(studentId: number): Promise<ExamRecord[]> { /* ...your existing code... */ }
  async getNotices(student: Student): Promise<Notice[]> { /* ...your existing code... */ }
}

// Export a single instance of the service for the whole app to use
export const apiService = new ApiService();