// src/components/StudentPortal.tsx (FINAL VERSION)

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStudentData } from '../hooks/useStudentData';

import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import FeesSection from './FeesSection';
import AcademicRecords from './AcademicRecords';
import HomeworkSection from './HomeworkSection';
import ProfileSection from './ProfileSection';
import NoticesAndNotifications from './NoticesAndNotifications';
import { Notice, Notification } from '../types';
// NoticesAndNotifications and ProfileSection can be added later

const StudentPortal: React.FC = () => {
  const { student, logout } = useAuth();
  const { feeRecords, examRecords, notices, loading, error, refreshData } = useStudentData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!student) {
    return <div>Error: No student data found. Please log out and try again.</div>;
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading {student.name}'s Dashboard...</p>
        </div>
      </div>
    );
  }
  if (error) { /* ... error UI ... */ }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices} />;
      case 'fees':
        return <FeesSection feeRecords={feeRecords} />;
      case 'academic':
        return <AcademicRecords examRecords={examRecords} />;
      case 'homework':
        return <HomeworkSection student={student} />;
      default:
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        studentName={student.name}
        onLogout={logout}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPortal;
