// src/types/index.ts (The Single Source of Truth)

// This is the main Student object, matching your database
export interface Student {
  id: number; // The database primary key
  srNo: string;
  name: string;
  class: string;
  medium: string;
  fatherName: string;
  motherName?: string;
  gender?: string;
  dob: string;
  contact: string;
  address?: string;
  bus_route?: string;
  religion?: string;
  nicStudentId?: string;
  isRte: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// For the Parent Login Form
export interface LoginCredentials {
  rollNumber: string; // We'll keep 'rollNumber' for the form field name
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
export interface ExamRecord {
  id: number;
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string;
  examDate: string;
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