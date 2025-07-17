// src/components/StudentPortal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Student, FeeRecord, ExamRecord, Notice } from '../types';
import { supabase } from '../utils/supabaseClient';

import Header from './Header';
import Dashboard from './Dashboard';
import FeesSection from './FeesSection';
import ProfileModal from './ProfileModal';

const AcademicRecords = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Academic Records</h2></div>;
const HomeworkSection = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Homework</h2></div>;
const NoticeBoard = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Notice Board</h2></div>;

const StudentPortal: React.FC = () => {
  const { student } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Mock data - in a real app, this would be fetched based on the student
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  
  const fetchStudentData = useCallback(async () => {
    if (!student) return;
    setIsLoadingData(true);

    const { data: feeData, error: feeError } = await supabase
      .from('fee_records')
      .select('*, student:students!inner(name, father_name)') // Make sure to get father_name for receipts
      .eq('student_id', student.srNo);
    
    // Map the fetched data to match the FeeRecord interface
    if (!feeError && feeData) {
      const mappedRecords = feeData.map((record: any) => ({
        recordId: record.id,
        studentId: record.student_id,
        studentName: record.student?.name || student.name,
        fatherName: record.student?.father_name || student.fatherName,
        class: record.class,
        totalFees: record.total_fees || 0,
        paidFees: record.paid_fees || 0,
        pendingFees: record.pending_fees || 0,
        discountFees: record.discount_fees || 0,
        busFees: record.bus_fees || 0,
        dueDate: record.due_date,
        lastPaymentDate: record.last_payment_date,
      }));
      setFeeRecords(mappedRecords);
    } else {
      console.error("Error fetching fees:", feeError);
    }

    // You can add exam/notice fetching here
    setIsLoadingData(false);
  }, [student]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);


  // Simple function to refresh data after a profile photo update
  const refreshStudentData = () => {
    alert("Photo updated successfully! The portal will now refresh to show the new photo.");
    window.location.reload();
  };

  // Loading Guard
  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Portal...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
                  student={student} 
                  feeRecords={feeRecords} 
                  examRecords={examRecords}
                  notices={notices}
onTabChange={setActiveTab}
                 />;
      case 'fees': return <FeesSection 
                  feeRecords={feeRecords} 
                  studentName={student.name}
               />;
      case 'academic': return <AcademicRecords />;
      case 'homework': return <HomeworkSection />;
      case 'notices': return <NoticeBoard />;
      default: return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        studentName={student.name}
        activeTab={activeTab} // Pass the current tab
        onTabChange={setActiveTab}
        onProfileClick={() => setShowProfileModal(true)}
      />
      
      <main className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
            {renderContent()}
        </div>
      </main>
      
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        student={student}
        onDataRefresh={refreshStudentData}
      />
    </div>
  );
};

export default StudentPortal;