import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { FeeRecord, ExamRecord, Homework, Notice, Notification } from '../types';

export const useStudentData = () => {
  const { user, student } = useAuth();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && student) {
      fetchAllData();
    }
  }, [user, student]);

  const fetchAllData = async () => {
    if (!student) return;

    try {
      setLoading(true);
      setError(null);

      const [
        feesResponse,
        examsResponse,
        homeworkResponse,
        noticesResponse,
        notificationsResponse,
      ] = await Promise.all([
        apiService.getFeeRecords(student.id),
        apiService.getExamRecords(student.id),
        apiService.getHomework(student.id),
        apiService.getNotices(),
        apiService.getNotifications(student.id),
      ]);

      if (feesResponse.success && feesResponse.data) {
        setFeeRecords(feesResponse.data);
      }

      if (examsResponse.success && examsResponse.data) {
        setExamRecords(examsResponse.data);
      }

      if (homeworkResponse.success && homeworkResponse.data) {
        setHomework(homeworkResponse.data);
      }

      if (noticesResponse.success && noticesResponse.data) {
        setNotices(noticesResponse.data);
      }

      if (notificationsResponse.success && notificationsResponse.data) {
        setNotifications(notificationsResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch student data');
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAllData();
  };

  const payFee = async (feeId: string, paymentData: any) => {
    try {
      const response = await apiService.payFee(feeId, paymentData);
      if (response.success) {
        // Refresh fee records after successful payment
        const feesResponse = await apiService.getFeeRecords(student!.id);
        if (feesResponse.success && feesResponse.data) {
          setFeeRecords(feesResponse.data);
        }
        return response;
      }
      return response;
    } catch (error) {
      console.error('Payment failed:', error);
      return { success: false, error: 'Payment failed' };
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
      return response;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error: 'Failed to update notification' };
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead(student!.id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
      return response;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return { success: false, error: 'Failed to update notifications' };
    }
  };

  return {
    feeRecords,
    examRecords,
    homework,
    notices,
    notifications,
    loading,
    error,
    refreshData,
    payFee,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};