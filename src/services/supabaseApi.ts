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
      console.log('🔍 Fetching homework for student:', studentId);
      
      const { data, error } = await supabase
        .rpc('get_student_homework', {
          p_student_id: parseInt(studentId)
        });

      if (error) {
        console.error('Homework fetch error:', error);
        return { success: false, error: error.message };
      }

      const homework: Homework[] = (data || []).map((record: any) => ({
        id: record.homework_id.toString(),
        studentId: studentId,
        subject: record.subject,
        title: record.title,
        description: record.description,
        dueDate: record.due_date,
        status: this.determineHomeworkStatus(record),
        submissionDate: record.submitted_at,
        teacherComments: record.teacher_comments,
        grade: record.grade,
        attachmentUrl: record.attachment_url,
        submissionId: record.submission_id?.toString(),
      }));

      return { success: true, data: homework };
    } catch (error) {
      console.error('Homework fetch error:', error);
      return { success: false, error: 'Failed to fetch homework' };
    }
  }

  private determineHomeworkStatus(record: any): 'pending' | 'submitted' | 'overdue' {
    if (record.submission_id) {
      return 'submitted';
    }
    
    const dueDate = new Date(record.due_date);
    const today = new Date();
    
    if (dueDate < today) {
      return 'overdue';
    }
    
    return 'pending';
  }

  async submitHomework(homeworkId: string, file: File): Promise<ApiResponse<{ submissionId: string }>> {
    try {
      console.log('📤 Submitting homework:', homeworkId, file.name);
      
      // Get current student ID from token
      const token = localStorage.getItem('authToken');
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }
      
      const decoded = JSON.parse(atob(token));
      const studentId = decoded.studentId;
      
      // Upload file to storage
      const fileName = `${studentId}_${homeworkId}_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('homework-submissions')
        .upload(fileName, file);

      if (uploadError) {
        console.error('File upload error:', uploadError);
        return { success: false, error: 'Failed to upload file' };
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('homework-submissions')
        .getPublicUrl(fileName);

      // Submit homework using database function
      const { data, error } = await supabase
        .rpc('submit_homework', {
          p_homework_id: parseInt(homeworkId),
          p_student_id: parseInt(studentId),
          p_submission_text: `Submitted file: ${file.name}`,
          p_attachment_url: publicUrl
        });

      if (error) {
        console.error('Homework submission error:', error);
        return { success: false, error: error.message };
      }

      const result = data[0];
      if (!result.success) {
        return { success: false, error: result.message };
      }
      
      return { 
        success: true, 
        data: { submissionId: result.submission_id.toString() } 
      };
    } catch (error) {
      console.error('Homework submission error:', error);
      return { success: false, error: 'Homework submission failed' };
    }
  }

  // Notices - Real data from database
  async getNotices(): Promise<ApiResponse<Notice[]>> {
    try {
      console.log('🔍 Fetching notices...');
      
      const { data, error } = await supabase
        .rpc('get_notices');

      if (error) {
        console.error('Notices fetch error:', error);
        return { success: false, error: error.message };
      }

      const notices: Notice[] = (data || []).map((record: any) => ({
        id: record.notice_id.toString(),
        title: record.title,
        content: record.message,
        date: record.created_at.split('T')[0],
        priority: record.priority,
        category: this.mapNoticeCategory(record.type),
      }));

      return { success: true, data: notices };
    } catch (error) {
      console.error('Notices fetch error:', error);
      return { success: false, error: 'Failed to fetch notices' };
    }
  }

  private mapNoticeCategory(type: string): string {
    const categoryMap: Record<string, string> = {
      'general': 'General',
      'event': 'Event',
      'urgent': 'Urgent',
      'exam': 'Exam',
      'fee': 'Fee',
      'homework': 'Homework'
    };
    return categoryMap[type] || 'General';
  }

  // Notifications - Real data from database
  async getNotifications(studentId: string): Promise<ApiResponse<Notification[]>> {
    try {
      console.log('🔍 Fetching notifications for student:', studentId);
      
      const { data, error } = await supabase
        .rpc('get_student_notifications', {
          p_student_id: parseInt(studentId)
        });

      if (error) {
        console.error('Notifications fetch error:', error);
        return { success: false, error: error.message };
      }

      const notifications: Notification[] = (data || []).map((record: any) => ({
        id: record.notification_id.toString(),
        title: record.title,
        message: record.message,
        type: this.mapNotificationType(record.type),
        date: record.created_at,
        read: record.is_read || false,
      }));

      return { success: true, data: notifications };
    } catch (error) {
      console.error('Notifications fetch error:', error);
      return { success: false, error: 'Failed to fetch notifications' };
    }
  }

  private mapNotificationType(type: string): 'info' | 'warning' | 'success' | 'error' {
    const typeMap: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
      'general': 'info',
      'homework': 'info',
      'fee': 'warning',
      'exam': 'info',
      'event': 'info',
      'urgent': 'error'
    };
    return typeMap[type] || 'info';
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      console.log('📝 Marking notification as read:', notificationId);
      // For now, we'll just log this - you can implement a read status table later
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }

  async markAllNotificationsAsRead(studentId: string): Promise<ApiResponse<void>> {
    try {
      console.log('📝 Marking all notifications as read for student:', studentId);
      // For now, we'll just log this - you can implement a read status table later
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