// src/components/Dashboard.tsx

import React from 'react';
import { Student, FeeRecord, ExamRecord, Notice } from '../types';
import { 
  Home, CreditCard, Award, BookOpen, Megaphone,
  DollarSign, FileText, Bell, TrendingUp, Calendar, School, User, Users
} from 'lucide-react';
import { formatDate, getGradeColor } from '../utils';

interface DashboardProps {
  student: Student;
  feeRecords: FeeRecord[];
  examRecords: ExamRecord[];
  notices: Notice[];
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  student, 
  feeRecords = [],
  examRecords = [],
  notices = [],
  onTabChange
}) => {

  // Safe & Efficient Calculations
  const safeFeeRecords = Array.isArray(feeRecords) ? feeRecords : [];
  const safeExamRecords = Array.isArray(examRecords) ? examRecords : [];
  const safeNotices = Array.isArray(notices) ? notices : [];

  const pendingFees = safeFeeRecords.filter(fee => (fee.pendingFees || 0) > 0);
  const totalPendingAmount = pendingFees.reduce((sum, fee) => sum + (fee.pendingFees || 0), 0);
  
  const averageScore = safeExamRecords.length > 0 
    ? safeExamRecords.reduce((sum, exam) => sum + (exam.percentage || 0), 0) / safeExamRecords.length
    : 0;

  const stats = [
    { title: 'Pending Dues', value: totalPendingAmount, icon: DollarSign, color: 'from-red-500 to-orange-500', textColor: 'text-red-600', isCurrency: true },
    { title: 'Average Score', value: averageScore, icon: TrendingUp, color: 'from-green-500 to-emerald-600', textColor: 'text-green-600' },
    { title: 'School Notices', value: safeNotices.length, icon: Bell, color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600' }
  ];

  const navItems = [
    { id: 'fees', name: 'Fee Details', icon: CreditCard },
    { id: 'academic', name: 'Academic Records', icon: Award },
    { id: 'homework', name: 'Homework', icon: BookOpen },
    { id: 'notices', name: 'Notice Board', icon: Megaphone },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Banner */}
      {/* [MOBILE COMPACT] Changed padding from p-8 to p-6 for smaller screens */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
  <div className="absolute -bottom-20 -right-20 opacity-10 sm:-bottom-16 sm:-right-16">
    <img src="/logo.png" alt="School Logo Background" className="w-48 h-48 sm:w-64 sm:h-64" />
  </div>
  <div className="relative z-10">
    {/* [MOBILE COMPACT V2] Reduced text size even more on mobile */}
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Marudhar Defence School</h2>
    <h1 className="text-blue-100 text-sm md:text-lg hidden sm:block">Welcome to the Student ERP</h1>
    {/* [MOBILE COMPACT V2] Hiding this secondary text on the smallest screens */}
    <p className="text-blue-100 text-sm md:text-lg hidden sm:block">Excellence in Education & Character - Manage your Ward's Profile</p>
    {/* [MOBILE COMPACT V2] Tighter layout for the stats row */}
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-200">
      <div className="flex items-center space-x-2">
        <BookOpen className="w-4 h-4" />
        <span>Est. 1991</span>
      </div>
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4" />
        <span>1300+ Students</span>
      </div>
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-4 h-4" />
        <span>Growing Strong</span>
      </div>
    </div>
  </div>
</div>

      {/* Stats Grid */}
      {/* [MOBILE COMPACT] Changed from 1 column to 2 on mobile, then 3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-md border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                {/* [MOBILE COMPACT] Reduced text size on mobile */}
                <p className={`text-2xl sm:text-3xl font-bold ${stat.textColor}`}>
                  {stat.isCurrency
                    ? `₹${stat.value.toLocaleString('en-IN')}`
                    : stat.title === 'Average Score'
                      ? `${stat.value.toFixed(1)}%`
                      : stat.value
                  }
                </p>
              </div>
              {/* [MOBILE COMPACT] Made the icon smaller on mobile */}
              <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon size={20} sm:size={28} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Icon-Based Navigation Tabs */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Explore Sections</h3>
        {/* [MOBILE COMPACT] We keep the 2-column layout but reduce padding on the buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl text-center transition-all duration-200 bg-gray-50 text-gray-700 hover:shadow-lg hover:bg-blue-500 hover:text-white"
            >
              {/* [MOBILE COMPACT] Reduced icon size */}
              <item.icon size={24} md:size={28} className="mb-2" />
              <span className="font-semibold text-xs md:text-sm">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Grids - This layout is already good for mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-200">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center"><FileText size={20} md:size={22} className="mr-3 text-blue-500" />Recent Exam Results</h3>
          <div className="space-y-3">
            {safeExamRecords.length > 0 ? safeExamRecords.slice(0, 3).map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{exam.examType}</p>
                  <p className="text-xs text-gray-500">Date: {formatDate(exam.examDate)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{exam.obtainedMarks}/{exam.totalMarks}</p>
                  <p className={`text-xs font-medium ${getGradeColor(exam.grade)}`}>{exam.grade}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-6">No exam results available yet.</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-200">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center"><Calendar size={20} md:size={22} className="mr-3 text-purple-500" />Upcoming Fee Deadlines</h3>
          <div className="space-y-3">
            {pendingFees.length > 0 ? pendingFees.slice(0, 2).map((fee) => (
              <div key={fee.recordId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign size={16} md:size={18} className="text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Fee Payment Due</p>
                    <p className="text-xs text-gray-600">Due Date: {formatDate(fee.dueDate)}</p>
                  </div>
                </div>
                <p className="font-bold text-red-600 text-base md:text-lg">₹{(fee.pendingFees || 0).toLocaleString('en-IN')}</p>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-6">No pending fees. You are all clear!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;