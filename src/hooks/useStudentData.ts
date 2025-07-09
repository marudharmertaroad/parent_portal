// src/hooks/useStudentData.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { FeeRecord, ExamRecord, Homework, Notice } from '../types';

export const useStudentData = () => {
  const { student } = useAuth(); // Get the currently logged-in student

  // State for all the different types of data
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // If there's no logged-in student, we can't fetch anything.
    if (!student || !student.id) {
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use Promise.all to fetch everything concurrently for better performance
      const [
        feesResponse,
        examsResponse,
        noticesResponse,
      ] = await Promise.all([
        apiService.getFeeRecords(student.id),
        apiService.getExamRecords(student.id),
        apiService.getNotices(student.class, student.medium),
      ]);

      // Set state with the fetched data, defaulting to empty arrays if anything fails
      setFeeRecords(feesResponse || []);
      setExamRecords(examsResponse || []);
      setNotices(noticesResponse || []);

    } catch (err: any) {
      console.error("Error fetching student data:", err);
      setError("Could not load all student data. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [student]); // This hook re-runs whenever the 'student' object changes (i.e., on login/logout)

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Return all the data and states for the component to use
  return {
    feeRecords,
    examRecords,
    homework, // We will handle homework inside its own component
    notices,
    loading,
    error,
    refreshData: fetchData, // Expose a function to allow manual refresh
  };
};