// src/components/StudentPortal.tsx (FINAL VERSION)

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStudentData } from '../hooks/useStudentData';

import Header from './Header';
import Dashboard from './Dashboard';
import FeesSection from './FeesSection';
import AcademicRecords from './AcademicRecords';
import HomeworkSection from './HomeworkSection';
import ProfileSection from './ProfileSection';
import NoticeBoard from './NoticeBoard';
import { X } from 'lucide-react';

const StudentPortal: React.FC = () => {
  const { student, logout } = useAuth();
  const { feeRecords, examRecords, notices, loading, error, refreshData } = useStudentData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} onProfileClick={() => setShowProfileModal(true)} />;
      case 'fees':
        return <FeesSection feeRecords={feeRecords} />;
      case 'academic':
       return <AcademicRecords student={student} examRecords={examRecords} />;
      case 'homework':
        return <HomeworkSection student={student} />;
        case 'notices': // <-- New case for the Notice Board tab
        return <NoticeBoard notices={notices} />;
        
      default:
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} />;
    }
  };

  return (
  <div className="min-h-screen bg-gray-100">
    <div className="flex">
      {/* The Sidebar is now a direct child of the main flex container */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        studentName={student.name} // Pass student name to the sidebar
      />
      
      {/* This container will hold the header and the main scrollable content */}
      <div className="flex-1 flex flex-col">
        <Header
          onLogout={logout}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onProfileClick={() => setShowProfileModal(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* The welcome message is no longer needed here as it's in the sidebar */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
    
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Student Profile</h2>
              {/* --- FIX: Use the correct state setter --- */}
              <button onClick={() => setShowProfileModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <ProfileSection student={student} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
