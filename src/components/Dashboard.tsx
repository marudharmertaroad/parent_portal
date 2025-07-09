// src/components/Dashboard.tsx

import React from 'react';
import { Student, FeeRecord, ExamRecord, Notice, Homework } from '../types';
import { 
  DollarSign, 
  FileText, 
  BookOpen, 
  Bell, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { formatDate } from '../utils'; // Make sure this path is correct
import HomeworkSection from './HomeworkSection'; // We will include this directly in the dashboard

interface DashboardProps {
  student: Student;
  feeRecords: FeeRecord[];
  examRecords: ExamRecord[];
  notices: Notice[];
}

const Dashboard: React.FC<DashboardProps> = ({
  student,
  feeRecords = [],
  examRecords = [],
  notices = []
}) => {
  // --- Calculations for the Stat Cards ---
  const pendingFees = feeRecords.filter(fee => fee.status === 'Pending' || fee.status === 'Overdue');
  
  const averageScore = examRecords.length > 0 
    ? examRecords.reduce((sum, exam) => sum + exam.percentage, 0) / examRecords.length
    : 0;

  const stats = [
    { title: 'Pending Fee Dues', value: pendingFees.length, icon: DollarSign, color: 'from-red-500 to-orange-500', textColor: 'text-red-600' },
    { title: 'Overall Average Score', value: `${averageScore.toFixed(1)}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-600', textColor: 'text-green-600' },
    { title: 'Important Notices', value: notices.length, icon: Bell, color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white/50">
            <span className="text-3xl font-bold">{student.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Welcome, {student.name}</h2>
            <p className="text-blue-100 text-lg mt-1">Class: {student.class} | SR Number: {student.srNo}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Upcoming Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Exam Results */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText size={22} className="mr-3 text-blue-500" />
            Recent Exam Results
          </h3>
          <div className="space-y-3">
            {examRecords.length > 0 ? examRecords.slice(0, 3).map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{exam.examType}</p>
                  <p className="text-sm text-gray-500">Date: {formatDate(exam.examDate)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{exam.obtainedMarks}/{exam.totalMarks}</p>
                  <p className={`text-sm font-medium ${getGradeColor(exam.grade)}`}>{exam.grade}</p>
                </div>
              </div>
            )) : <p className="text-center text-gray-500 py-4">No exam results found.</p>}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar size={22} className="mr-3 text-purple-500" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {pendingFees.length > 0 ? pendingFees.slice(0, 2).map((fee) => (
              <div key={fee.recordId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign size={18} className="text-red-500" />
                  <div>
                    <p className="font-semibold text-gray-800">Fee Payment Due</p>
                    <p className="text-sm text-gray-500">Due: {formatDate(fee.dueDate)}</p>
                  </div>
                </div>
                <p className="font-bold text-red-600">₹{fee.pendingFees.toLocaleString('en-IN')}</p>
              </div>
            )) : <p className="text-center text-gray-500 py-4">No pending fee dues.</p>}
          </div>
        </div>
      </div>
      
      {/* Homework Section - Now embedded directly within the dashboard */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <HomeworkSection student={student} />
      </div>
    </div>
  );
};

export default Dashboard;

// You will also need to add the getGradeColor utility function to your utils/index.ts
// export const getGradeColor = (grade: string) => { ... };