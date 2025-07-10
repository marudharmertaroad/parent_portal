// src/types/index.ts

// The single source of truth for the Student object
export interface Student {
  id: number;
  srNo: string;
  name: string;
  class: string;
  medium: string;
  fatherName: string;
  motherName?: string;
  contact: string;
  address?: string;
  dob: string;
  bus_route?: string;
  isRte: boolean;
  // Add any other fields you need from the 'students' table
}

// For the Parent Login Form
export interface LoginCredentials {
  rollNumber: string;
  dateOfBirth: string;
}

// For displaying fee records
export interface FeeRecord {
  recordId: number;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  discountFees: number;
  busFees: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

// For displaying exam records
export interface SubjectMark {
  subject: string;
  maxMarks: number;
  obtainedMarks: number;
  grade?: string;
}

export interface ExamRecord {
  id: number;
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string;
  examDate: string;
  subjects: SubjectMark[]; // <-- ADD THIS LINE
}

// For displaying homework
export interface Homework {
  id: number;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  created_at: string;
  attachment_url?: string;
}

// For displaying notifications/notices
export interface Notice {
  id: number;
  title: string;
  content: string;
  created_at: string;
}
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'general' | 'homework' | 'fee' | 'exam' | 'event' | 'urgent';
  target_audience: 'all' | 'class_specific' | 'student_specific';
  target_class?: string;
  target_medium?: string;
  target_student_sr_no?: string;
  created_at: string;
  sent_at?: string;
  read?: boolean; // Make 'read' optional, as it might not be in the DB yet
}