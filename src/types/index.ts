export interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  admissionNumber: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  contactNumber: string;
  email: string;
  address: string;
  medium?: string;
  profileImage?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  feeType: string;
  amount: number;
  totalAmount?: number;
  paidAmount?: number;
  discountAmount?: number;
  busAmount?: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentDate?: string;
  paymentHistory?: PaymentHistory[];
  transactionId?: string;
}

export interface PaymentHistory {
  id: number;
  amount: number;
  payment_date: string;
}

export interface ExamRecord {
  id: string;
  studentId: string;
  examName: string;
  subject: string;
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  date: string;
  semester: string;
  percentage?: number;
  subjectMarks?: SubjectMark[];
  coScholasticMarks?: CoScholasticMark[];
}

export interface SubjectMark {
  subject: string;
  max_marks: number;
  obtained_marks: number;
  grade: string;
}

export interface CoScholasticMark {
  activity: string;
  grade: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface Homework {
  id: number;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  created_at: string;
  attachment_url?: string;
  status: 'pending' | 'submitted' | 'overdue';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

export interface AuthUser {
  studentId: string;
  rollNumber: string;
  dateOfBirth: string;
  medium?: string;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  rollNumber: string;
  dateOfBirth: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}