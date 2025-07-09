// src/components/StudentPortal.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStudentData } from '../hooks/useStudentData';

// Import all the section components you will be showing
import Header from './Header'; // You will need to create this
import Sidebar from './Sidebar'; // You will need to create this
import Dashboard from './Dashboard';
import FeesSection from './FeesSection';
import AcademicRecords from './AcademicRecords';
import HomeworkSection from './HomeworkSection';
import NoticesAndNotifications from './NoticesAndNotifications';

const StudentPortal: React.FC = () => {
  // Get the student object and logout function from the Auth context
  const { student, logout } = useAuth();
  
  // Get all the data for this student using our new hook
  const {
    feeRecords,
    examRecords,
    notices,
    loading,
    error,
    refreshData,
  } = useStudentData();

  const [activeTab, setActiveTab] = useState('dashboard');

  // This is a safety guard. The parent (App.tsx) should already prevent this,
  // but it's good practice to have it.
  if (!student) {
    // This could redirect to login or show an error
    return <div>No student data found. Please log in.</div>;
  }
  
  // This handles the loading state for all the data
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

  // This handles any errors during data fetching
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold mb-4">{error}</p>
          <button onClick={refreshData} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        // Pass all the necessary data down to the dashboard
        return (
          <Dashboard
            student={student}
            feeRecords={feeRecords}
            examRecords={examRecords}
            notices={notices}
          />
        );
      case 'fees':
        // return <FeesSection feeRecords={feeRecords} />;
        return <div className="p-4 bg-white rounded-lg">Fees Section Coming Soon</div>;
      case 'academic':
        // return <AcademicRecords examRecords={examRecords} />;
         return <div className="p-4 bg-white rounded-lg">Academic Records Coming Soon</div>;
      case 'homework':
        // The homework section is smart and only needs the student object
        return <HomeworkSection student={student} />;
      default:
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices}/>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* You would have a Header component here */}
      {/* <Header studentName={student.name} onLogout={logout} /> */}
      
      <div className="flex">
        {/* You would have a Sidebar component here */}
        {/* <Sidebar activeTab={activeTab} onTabChange={setActiveTab} /> */}
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 capitalize">{activeTab}</h1>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPortal;