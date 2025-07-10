// src/components/Dashboard.tsx (Polished Parent Portal Version)

import React from 'react';
import { Student, FeeRecord, ExamRecord, Notice } from '../types';
import { 
  DollarSign, 
  FileText, 
  BookOpen, 
  Bell, 
  TrendingUp,
  Calendar,
  School,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../utils';
import { getGradeColor } from '../utils'; // Make sure this is in your utils file
import HomeworkSection from './HomeworkSection'; 

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
  // --- Calculations for Stat Cards ---
  const pendingFees = feeRecords.filter(fee => fee.status === 'Pending' || fee.status === 'Overdue');
  const averageScore = examRecords.length > 0 
    ? examRecords.reduce((sum, exam) => sum + exam.percentage, 0) / examRecords.length
    : 0;

  const stats = [
    { title: 'Pending Dues', value: pendingFees.length, icon: DollarSign, color: 'from-red-500 to-orange-500', textColor: 'text-red-600' },
    { title: 'Average Score', value: `${averageScore.toFixed(1)}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-600', textColor: 'text-green-600' },
    { title: 'School Notices', value: notices.length, icon: Bell, color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600' }
  ];

  return (
    <div className="space-y-8">
      {/* --- FIX: New School-Focused Welcome Banner --- */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -bottom-12 -right-12 opacity-10">
          <School className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-3">Marudhar Defence School</h2>
          <p className="text-blue-100 text-lg">Excellence in Education & Character - Welcome to the Parent Portal</p>
          <p className="text-sm text-blue-200 mt-4 max-w-2xl">
            Here you can track academic progress, view fee details, and stay updated with important school announcements. We are committed to a transparent and collaborative educational journey.
          </p>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon size={28} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Upcoming Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            )) : <p className="text-center text-gray-500 py-6">No exam results available yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar size={22} className="mr-3 text-purple-500" />
            Upcoming Fee Deadlines
          </h3>
          <div className="space-y-3">
            {pendingFees.length > 0 ? pendingFees.slice(0, 2).map((fee) => (
              <div key={fee.recordId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign size={18} className="text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Fee Payment Due</p>
                    <p className="text-sm text-gray-600">Due Date: {formatDate(fee.dueDate)}</p>
                  </div>
                </div>
                <p className="font-bold text-red-600 text-lg">₹{fee.pendingFees.toLocaleString('en-IN')}</p>
              </div>
            )) : <p className="text-center text-gray-500 py-6">No pending fees. You are all clear!</p>}
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default Dashboard;