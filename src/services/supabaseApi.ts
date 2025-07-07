import { supabase } from '../lib/supabase';
import { 
  Student, 
  FeeRecord, 
  ExamRecord, 
  Notice, 
  Homework, 
  Notification, 
  LoginCredentials, 
  ApiResponse 
} from '../types';

class SupabaseApiService {
  // Test database connection
  async testConnection(): Promise<ApiResponse<boolean>> {
    try {
      console.log('🔍 Testing database connection...');
      
      const { data, error } = await supabase
        .from('students')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Database connection failed:', error);
        return {
          success: false,
          error: `Database connection failed: ${error.message}`,
        };
      }

      console.log('✅ Database connection successful');
      return { success: true, data: true };
    } catch (error) {
      console.error('💥 Connection test error:', error);
      return {
        success: false,
        error: 'Unable to connect to database. Please check your configuration.',
      };
    }
  }

  // Authentication using SR Number and Date of Birth
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; student: Student }>> {
    try {
      console.log('🔐 Attempting login with:', { 
        rollNumber: credentials.rollNumber, 
        dateOfBirth: credentials.dateOfBirth 
      });
      
      // Find student by SR number and date of birth
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('sr_no', credentials.rollNumber)
        .eq('dob', credentials.dateOfBirth)
        .eq('status', 'active')
        .single();

      console.log('📊 Database query result:', { studentData, error: studentError });

      if (studentError || !studentData) {
        console.log('❌ Login failed - student not found');
        return {
          success: false,
          error: 'Invalid SR Number or Date of Birth. Please check your credentials.',
        };
      }

      // Convert database format to app format
      const student: Student = {
        id: studentData.id.toString(),
        name: studentData.name,
        class: studentData.class,
        section: 'A', // Default section
        rollNumber: studentData.sr_no,
        admissionNumber: studentData.nic_student_id || studentData.sr_no,
        dateOfBirth: studentData.dob || '2009-01-01',
        fatherName: studentData.father_name,
        motherName: studentData.mother_name || '',
        contactNumber: studentData.contact,
        email: `${studentData.sr_no}@marudhardefence.edu.in`,
        address: studentData.address || '',
        medium: studentData.medium || 'English',
        profileImage: undefined,
      };

      console.log('✅ Login successful for student:', student.name, 'Medium:', student.medium);

      // Generate a simple token
      const token = btoa(JSON.stringify({ 
        studentId: student.id, 
        timestamp: Date.now(),
        srNo: student.rollNumber,
        medium: student.medium
      }));

      return {
        success: true,
        data: { token, student },
      };
    } catch (error) {
      console.error('💥 Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please check your connection and try again.',
      };
    }
  }

  async verifyToken(): Promise<ApiResponse<Student>> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      // Decode token to get student info
      const decoded = JSON.parse(atob(token));
      const studentId = decoded.studentId;

      const { data: studentData, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .eq('status', 'active')
        .single();

      if (error || !studentData) {
        return { success: false, error: 'Invalid token or student not found' };
      }

      const student: Student = {
        id: studentData.id.toString(),
        name: studentData.name,
        class: studentData.class,
        section: 'A',
        rollNumber: studentData.sr_no,
        admissionNumber: studentData.nic_student_id || studentData.sr_no,
        dateOfBirth: studentData.dob || '2009-01-01',
        fatherName: studentData.father_name,
        motherName: studentData.mother_name || '',
        contactNumber: studentData.contact,
        email: `${studentData.sr_no}@marudhardefence.edu.in`,
        address: studentData.address || '',
        medium: studentData.medium || 'English',
        profileImage: undefined,
      };

      return { success: true, data: student };
    } catch (error) {
      return { success: false, error: 'Token verification failed' };
    }
  }

  // Student Data
  async getStudentProfile(studentId: string): Promise<ApiResponse<Student>> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .eq('status', 'active')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const student: Student = {
        id: data.id.toString(),
        name: data.name,
        class: data.class,
        section: 'A',
        rollNumber: data.sr_no,
        admissionNumber: data.nic_student_id || data.sr_no,
        dateOfBirth: data.dob || '2009-01-01',
        fatherName: data.father_name,
        motherName: data.mother_name || '',
        contactNumber: data.contact,
        email: `${data.sr_no}@marudhardefence.edu.in`,
        address: data.address || '',
        medium: data.medium || 'English',
        profileImage: undefined,
      };

      return { success: true, data: student };
    } catch (error) {
      return { success: false, error: 'Failed to fetch student profile' };
    }
  }

  async updateStudentProfile(studentId: string, updateData: Partial<Student>): Promise<ApiResponse<Student>> {
    try {
      const dbUpdateData = {
        name: updateData.name,
        contact: updateData.contactNumber,
        address: updateData.address,
        father_name: updateData.fatherName,
        mother_name: updateData.motherName,
        dob: updateData.dateOfBirth,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('students')
        .update(dbUpdateData)
        .eq('id', studentId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const student: Student = {
        id: data.id.toString(),
        name: data.name,
        class: data.class,
        section: 'A',
        rollNumber: data.sr_no,
        admissionNumber: data.nic_student_id || data.sr_no,
        dateOfBirth: data.dob || '2009-01-01',
        fatherName: data.father_name,
        motherName: data.mother_name || '',
        contactNumber: data.contact,
        email: `${data.sr_no}@marudhardefence.edu.in`,
        address: data.address || '',
        medium: data.medium || 'English',
        profileImage: undefined,
      };

      return { success: true, data: student };
    } catch (error) {
      return { success: false, error: 'Failed to update student profile' };
    }
  }

  // Fee Records using database function
  async getFeeRecords(studentId: string): Promise<ApiResponse<FeeRecord[]>> {
    try {
      const { data, error } = await supabase
        .rpc('get_student_fees', {
          p_student_id: parseInt(studentId)
        });

      if (error) {
        console.error('Fee records error:', error);
        return { success: false, error: error.message };
      }

      const feeRecords: FeeRecord[] = (data || []).map((record: any) => ({
        id: record.id.toString(),
        studentId: record.student_id,
        feeType: this.determineFeeType(record),
        amount: parseFloat(record.pending_fees || '0'),
        dueDate: record.due_date,
        status: this.determineFeeStatus(record),
        paymentDate: record.last_payment_date,
        transactionId: undefined,
      }));

      return { success: true, data: feeRecords };
    } catch (error) {
      console.error('Fee records fetch error:', error);
      return { success: false, error: 'Failed to fetch fee records' };
    }
  }

  private determineFeeType(record: any): string {
    if (record.bus_fees && parseFloat(record.bus_fees) > 0) {
      return 'Bus Fee';
    }
    return 'Tuition Fee';
  }

  private determineFeeStatus(record: any): 'pending' | 'paid' | 'overdue' {
    const pendingFees = parseFloat(record.pending_fees || '0');
    
    if (pendingFees <= 0) {
      return 'paid';
    }
    
    const dueDate = new Date(record.due_date);
    const today = new Date();
    
    if (dueDate < today) {
      return 'overdue';
    }
    
    return 'pending';
  }

  async payFee(feeId: string, paymentData: any): Promise<ApiResponse<{ transactionId: string }>> {
    try {
      const { data, error } = await supabase
        .rpc('process_fee_payment', {
          p_fee_record_id: parseInt(feeId),
          p_amount: paymentData.amount,
          p_payment_method: paymentData.paymentMethod || 'online'
        });

      if (error) {
        console.error('Payment processing error:', error);
        return { success: false, error: error.message };
      }

      const result = data[0];
      if (!result.success) {
        return { success: false, error: result.message };
      }

      return { 
        success: true, 
        data: { transactionId: result.transaction_id } 
      };
    } catch (error) {
      console.error('Payment error:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  // Academic Records using database function
  async getExamRecords(studentId: string): Promise<ApiResponse<ExamRecord[]>> {
    try {
      const { data, error } = await supabase
        .rpc('get_student_exams', {
          p_student_id: parseInt(studentId)
        });

      if (error) {
        console.error('Exam records error:', error);
        return { success: false, error: error.message };
      }

      const examRecords: ExamRecord[] = (data || []).map((record: any) => ({
        id: record.exam_id.toString(),
        studentId: record.student_id,
        examName: record.exam_type,
        subject: 'Overall', // For overall exam record
        maxMarks: record.total_marks || 100,
        obtainedMarks: record.obtained_marks || 0,
        grade: record.grade || 'N/A',
        date: record.exam_date,
        semester: 'Current',
      }));

      return { success: true, data: examRecords };
    } catch (error) {
      console.error('Exam records fetch error:', error);
      return { success: false, error: 'Failed to fetch exam records' };
    }
  }

  // Homework - Mock data for now (you can implement this based on your needs)
  async getHomework(studentId: string): Promise<ApiResponse<Homework[]>> {
    try {
      // Mock homework data - replace with actual implementation
      const homework: Homework[] = [
        {
          id: '1',
          studentId: studentId,
          subject: 'Mathematics',
          title: 'Algebra Practice',
          description: 'Complete exercises 1-10 from chapter 5',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
        },
        {
          id: '2',
          studentId: studentId,
          subject: 'Science',
          title: 'Physics Lab Report',
          description: 'Write a report on the pendulum experiment',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
        }
      ];

      return { success: true, data: homework };
    } catch (error) {
      return { success: false, error: 'Failed to fetch homework' };
    }
  }

  async submitHomework(homeworkId: string, file: File): Promise<ApiResponse<{ submissionId: string }>> {
    try {
      // Mock submission - implement actual file upload logic
      console.log('Submitting homework:', homeworkId, file.name);
      
      return { 
        success: true, 
        data: { submissionId: `SUB${Date.now()}` } 
      };
    } catch (error) {
      return { success: false, error: 'Homework submission failed' };
    }
  }

  // Notices - Mock data
  async getNotices(): Promise<ApiResponse<Notice[]>> {
    try {
      const notices: Notice[] = [
        {
          id: '1',
          title: 'School Holiday Notice',
          content: 'School will remain closed on 15th August due to Independence Day.',
          date: new Date().toISOString().split('T')[0],
          priority: 'high',
          category: 'Holiday',
        },
        {
          id: '2',
          title: 'Parent-Teacher Meeting',
          content: 'Parent-teacher meeting scheduled for next Saturday at 10 AM.',
          date: new Date().toISOString().split('T')[0],
          priority: 'medium',
          category: 'Meeting',
        }
      ];

      return { success: true, data: notices };
    } catch (error) {
      return { success: false, error: 'Failed to fetch notices' };
    }
  }

  // Notifications - Mock data
  async getNotifications(studentId: string): Promise<ApiResponse<Notification[]>> {
    try {
      const notifications: Notification[] = [
        {
          id: '1',
          title: 'Fee Payment Reminder',
          message: 'Your tuition fee payment is due in 3 days.',
          type: 'warning',
          date: new Date().toISOString(),
          read: false,
        },
        {
          id: '2',
          title: 'Exam Results Published',
          message: 'Your mid-term exam results are now available.',
          type: 'info',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false,
        }
      ];

      return { success: true, data: notifications };
    } catch (error) {
      return { success: false, error: 'Failed to fetch notifications' };
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      // Mock implementation
      console.log('Marking notification as read:', notificationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }

  async markAllNotificationsAsRead(studentId: string): Promise<ApiResponse<void>> {
    try {
      // Mock implementation
      console.log('Marking all notifications as read for student:', studentId);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to mark all notifications as read' };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('studentData');
  }
}

export const supabaseApiService = new SupabaseApiService();