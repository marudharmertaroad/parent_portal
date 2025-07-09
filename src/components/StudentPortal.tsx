// src/components/StudentPortal.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStudentData } from '../hooks/useStudentData';

// Import all the section components that will be displayed
import Dashboard from './Dashboard';
import HomeworkSection from './HomeworkSection';
// You will need to create these other simple display components later
// import FeesSection from './FeesSection'; 
// import AcademicRecords from './AcademicRecords';
// import Header from './Header';
// import Sidebar from './Sidebar';

const StudentPortal: React.FC = () => {
  // Get the student object and logout function from our Auth context
  const { student, logout } = useAuth();
  
  // Get all the data related to this student from our new data hook
  const {
    feeRecords,
    examRecords,
    notices,
    loading,
    error,
    refreshData,
  } = useStudentData();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Safety guard: The parent (App.tsx) should prevent this, but it's good practice.
  if (!student) {
    return (
      <div className="p-4 text-center">
        <p>Student session not found. Please log in.</p>
        <button onClick={logout} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Login</button>
      </div>
    );
  }
  
  // This handles the loading state for all the data fetching
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
          <button onClick={refreshData} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        // Pass all the fetched data down to the dashboard display component
        return (
          <Dashboard
            student={student}
            feeRecords={feeRecords}
            examRecords={examRecords}
            notices={notices} // Pass notices instead of notifications
          />
        );
      case 'homework':
        // The HomeworkSection is smart and only needs the student object
        return <HomeworkSection student={student} />;
      // Add other cases for 'fees', 'academics' etc. later
      // case 'fees':
      //   return <FeesSection feeRecords={feeRecords} />;
      default:
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 
        This is where you would place your <Header /> and <Sidebar /> components.
        They would control the `activeTab` state.
        For now, we'll add simple buttons to simulate navigation.
      */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">{student.name}'s Portal</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'font-bold' : ''}>Dashboard</button>
          <button onClick={() => setActiveTab('homework')} className={activeTab === 'homework' ? 'font-bold' : ''}>Homework</button>
          <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </header>
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StudentPortal;