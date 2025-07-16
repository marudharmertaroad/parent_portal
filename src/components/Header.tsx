// src/components/Header.tsx (SIMPLIFIED)

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Student, FeeRecord, ExamRecord, Notice } from '../types'; // Assuming types are in a central file

// --- Import all necessary components ---
import Header from './Header'; 
import Dashboard from './Dashboard';
import ProfileSection from './ProfileSection';
import { X } from 'lucide-react';

// --- Placeholder Components (You can replace these with your actual components) ---
const FeesSection = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Fee Details</h2></div>;
const AcademicRecords = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Academic Records</h2></div>;
const HomeworkSection = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Homework</h2></div>;
const NoticeBoard = () => <div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold">Notice Board</h2></div>;


const StudentPortal: React.FC = () => {
  const { student } = useAuth(); // Get the authenticated student
  
  // --- State Management for the entire portal ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // --- Mock data (in a real app, this would come from a hook like useStudentData) ---
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // --- Loading Guard ---
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

  // --- Function to render the correct content based on the active tab ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
                  student={student} 
                  feeRecords={feeRecords} 
                  examRecords={examRecords}
                  notices={notices}
                  onProfileClick={() => setShowProfileModal(true)}
                  onTabChange={setActiveTab} // Pass the setter to the dashboard
               />;
      case 'fees':
        return <FeesSection />;
      case 'academic':
       return <AcademicRecords />;
      case 'homework':
        return <HomeworkSection />;
      case 'notices':
        return <NoticeBoard />;
      default:
        return <Dashboard 
                  student={student} 
                  feeRecords={feeRecords} 
                  examRecords={examRecords}
                  notices={notices}
                  onProfileClick={() => setShowProfileModal(true)}
                  onTabChange={setActiveTab}
               />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header is always visible */}
      <Header
        studentName={student.name}
        // The onMenuClick can be used for a future notifications drawer, for example
        onMenuClick={() => alert("Menu button clicked!")}
      />
      
      {/* Main content area */}
      <main className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full m-4 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Student Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <ProfileSection student={student} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;