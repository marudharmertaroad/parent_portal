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

const StudentPortal: React.FC = () => {
  const { student, logout } = useAuth();
  const {
    feeRecords,
    examRecords,
    homework,
    notices,
    notifications,
    loading,
    error,
    refreshData,
    payFee,
    submitHomework,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useStudentData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNoticesAndNotifications, setShowNoticesAndNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNotificationClick = () => {
    setShowNoticesAndNotifications(true);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mb-4">
            <img 
              src="/logo.png" 
              alt="Marudhar Defence Educational Group" 
              className="w-16 h-16 object-contain animate-pulse"
            />
          </div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 mx-auto">
            <img 
              src="/logo.png" 
              alt="Marudhar Defence Educational Group" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={refreshData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 mx-auto">
            <img 
              src="/logo.png" 
              alt="Marudhar Defence Educational Group" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <p className="text-gray-600 mb-4">Student data not found</p>
          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            student={student}
            feeRecords={feeRecords}
            examRecords={examRecords}
            homework={homework}
            notifications={notifications}
          />
        );
      case 'fees':
        return <FeesSection feeRecords={feeRecords} onPayFee={payFee} />;
      case 'academic':
        return <AcademicRecords examRecords={examRecords} />;
      case 'homework':
        return <HomeworkSection homework={homework} onSubmitHomework={submitHomework} />;
      default:
        return (
          <Dashboard
            student={student}
            feeRecords={feeRecords}
            examRecords={examRecords}
            homework={homework}
            notifications={notifications}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        studentName={student.name}
        studentMedium={student.medium}
        unreadNotifications={unreadNotifications}
        onNotificationClick={handleNotificationClick}
        onProfileClick={handleProfileClick}
        onMenuClick={handleMobileMenuToggle}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpen={isMobileMenuOpen}
          onClose={handleMobileMenuClose}
        />
        
        <main className="flex-1 p-6 md:ml-0">
          <div className="max-w-7xl mx-auto">
{!loading && !error && renderContent()}          </div>
        </main>
      </div>

      {/* Notices and Notifications Modal */}
      <NoticesAndNotifications
        notices={notices}
        notifications={notifications}
        isOpen={showNoticesAndNotifications}
        onClose={() => setShowNoticesAndNotifications(false)}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
      />

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="Marudhar Defence Educational Group" 
                  className="w-8 h-8 object-contain"
                />
                <h2 className="text-xl font-semibold text-gray-900">Student Profile</h2>
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
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