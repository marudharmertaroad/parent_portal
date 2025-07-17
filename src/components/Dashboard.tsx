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

  // --- SAFE & EFFICIENT CALCULATIONS ---
  const safeFeeRecords = Array.isArray(feeRecords) ? feeRecords : [];
  const safeExamRecords = Array.isArray(examRecords) ? examRecords : [];
  const safeNotices = Array.isArray(notices) ? notices : [];

  const pendingFees = safeFeeRecords.filter(fee => (fee.pendingFees || 0) > 0);
  const totalPendingAmount = pendingFees.reduce((sum, fee) => sum + (fee.pendingFees || 0), 0);
  
  const averageScore = safeExamRecords.length > 0 
    ? safeExamRecords.reduce((sum, exam) => sum + (exam.percentage || 0), 0) / safeExamRecords.length
    : 0;

  // Define the stats using the safe, pre-calculated values.
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -bottom-16 -right-16 opacity-10">
          <img src="/logo.png" alt="School Logo Background" className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3">Welcome to Marudhar Defence School Student ERP</h2>
          <p className="text-blue-100 text-lg">Excellence in Education & Character - Manage your ward's Profile</p>
          <div className="mt-4 flex items-center space-x-6 text-blue-200">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Est. 1991</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>1300+ Students</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Growing Strong</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-md border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {/* --- CLEANED UP JSX --- */}
                  {stat.isCurrency
                    ? `₹${stat.value.toLocaleString('en-IN')}`
                    : stat.title === 'Average Score'
                      ? `${stat.value.toFixed(1)}%`
                      : stat.value
                  }
                </p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon size={28} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Icon-Based Navigation Tabs */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Explore Sections</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)} // This tells the parent to switch views
              className="flex flex-col items-center justify-center p-4 rounded-xl text-center transition-all duration-200 bg-gray-50 text-gray-700 hover:shadow-lg hover:bg-blue-500 hover:text-white"
            >
              <item.icon size={28} className="mb-2" />
              <span className="font-semibold text-sm">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><FileText size={22} className="mr-3 text-blue-500" />Recent Exam Results</h3>
          <div className="space-y-3">
            {safeExamRecords.length > 0 ? safeExamRecords.slice(0, 3).map((exam) => (
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
            )) : (
              <p className="text-center text-gray-500 py-6">No exam results available yet.</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Calendar size={22} className="mr-3 text-purple-500" />Upcoming Fee Deadlines</h3>
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
                <p className="font-bold text-red-600 text-lg">₹{(fee.pendingFees || 0).toLocaleString('en-IN')}</p>
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