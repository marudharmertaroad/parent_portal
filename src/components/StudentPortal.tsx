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
import NoticeBoard from './NoticeBoard'; // <-- Import the new NoticeBoard
import NotificationModal from './NotificationModal';
import { X } from 'lucide-react';
// NoticesAndNotifications and ProfileSection can be added later

const StudentPortal: React.FC = () => {
  const { student, logout } = useAuth();
  const { feeRecords, examRecords, notices, notifications, loading, error, refreshData } = useStudentData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // These are the correct state variables
  const [showNotificationModal, setShowNotificationModal] = useState(false); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const personalNotifications: Notification[] = []; 
  const unreadCount = personalNotifications.filter(n => !n.read).length;

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
        case 'notices': // <-- New case for the Notice Board tab
        return <NoticeBoard notices={notices} />;
      default:
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices} />;
    }
  };

  return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onLogout={logout}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onNotificationClick={() => setShowNotificationModal(true)}
          unreadNotifications={(notifications || []).filter(n => !n.read).length}
        />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="max-w-7xl mx-auto">

            {/* --- FIX: Student name and welcome message moved here --- */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {student.name}!</h1>
                <p className="text-gray-500">Class: {student.class} | SR Number: {student.srNo}</p>
              </div>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 transition"
              >
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block font-semibold text-gray-700">{student.name}</span>
              </button>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>


     <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
      />
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
