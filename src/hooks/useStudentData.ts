// src/hooks/useStudentData.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { FeeRecord, ExamRecord, Notice } from '../types';

export const useStudentData = () => {
  const { student } = useAuth(); // Get the currently logged-in student

  // State for all the different types of data
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // If there's no student, there's nothing to fetch.
    if (!student || !student.id) {
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const feesPromise = apiService.getFeeRecords(student.id);
      const examsPromise = apiService.getExamRecords(student.id);
      // The 'getNotices' function is for the public notice board and should stay.
      const noticesPromise = apiService.getNotices(student);

      const [
        feesResponse,
        examsResponse,
        noticesResponse,
      ] = await Promise.all([
        feesPromise,
        examsPromise,
        noticesPromise,
      ]);
      
      setFeeRecords(feesResponse);
      setExamRecords(examsResponse);
      setNotices(noticesResponse);

      console.log("✅ All data fetches completed.");
      
      setFeeRecords(feesResponse);
      setExamRecords(examsResponse);
      setNotices(noticesResponse);
      setNotifications(notificationsResponse);

    } catch (err: any) {
      console.error("Error fetching student data:", err);
      setError("Could not load all student data. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [student]); // This hook re-runs whenever the 'student' object changes (i.e., on login)

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Expose all the data and states for the components to use
  return {
    feeRecords,
    examRecords,
    notices,
    notifications,
    loading,
    error,
    refreshData: fetchData, // A function to allow manual refresh
  };
};