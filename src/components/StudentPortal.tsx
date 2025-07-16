// src/components/StudentPortal.tsx

import React, { useState,useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Student, FeeRecord, ExamRecord, Notice } from '../types';

import Header from './Header';
import Dashboard from './Dashboard';
import ProfileModal from './ProfileModal';

// Placeholders for other pages
const FeesSection = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Fee Details</h2></div>;
const AcademicRecords = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Academic Records</h2></div>;
const HomeworkSection = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Homework</h2></div>;
const NoticeBoard = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Notice Board</h2></div>;

const StudentPortal: React.FC = () => {
  const { student } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Mock data - in a real app, this would be fetched based on the student
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const refreshStudentData = useCallback(async () => {
    if (!student) return;
    // This is where you would re-fetch the student's data from Supabase
    // to get the new photo URL and then update the auth context.
    // For now, we'll just show an alert and reload as a fallback.
    alert("Photo updated successfully! The portal will now refresh.");
    window.location.reload();
    }, [student]);

  // Loading Guard: Prevents rendering until the student object is ready
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
      case 'fees': return <FeesSection />;
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
        onMenuClick={() => alert("Menu button can be used for other features.")}
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
      />
    </div>
  );
};

export default StudentPortal;