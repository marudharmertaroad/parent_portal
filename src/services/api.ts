import { supabaseApiService } from './supabaseApi';

// Export the Supabase API service as the main API service
export const apiService = supabaseApiService;

// Re-export all the methods for backward compatibility
export const {
  login,
  verifyToken,
  getStudentProfile,
  updateStudentProfile,
  getFeeRecords,
  payFee,
  getExamRecords,
  getHomework,
  submitHomework,
  getNotices,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = supabaseApiService;