import React from 'react';
import { Student, FeeRecord, ExamRecord, Homework, Notification } from '../types';
import { 
  DollarSign, 
  FileText, 
  BookOpen, 
  Bell, 
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import HomeworkSection from './HomeworkSection'; 
interface DashboardProps {
  student: Student;
  feeRecords: FeeRecord[];
  examRecords: ExamRecord[];
  notifications: Notification[];
}

const Dashboard: React.FC<DashboardProps> = ({
  student,
  feeRecords,
  examRecords,
  homework,
  notifications
}) => {
  const pendingFees = feeRecords.filter(fee => fee.status === 'pending' || fee.status === 'overdue');
  const pendingHomework = homework.filter(hw => hw.status === 'pending' || hw.status === 'overdue');
  const unreadNotifications = notifications.filter(n => !n.read);
  const averageScore = examRecords.reduce((sum, exam) => sum + (exam.obtainedMarks / exam.maxMarks * 100), 0) / examRecords.length;

  const stats = [
    {
      title: 'Pending Fees',
      value: pendingFees.length,
      icon: DollarSign,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600'
    },
    {
      title: 'Average Score',
      value: `${averageScore.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Homework',
      value: pendingHomework.length,
      icon: BookOpen,
      color: 'from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Unread Notifications',
      value: unreadNotifications.length,
      icon: Bell,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{student.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome, {student.name}</h2>
            <p className="text-blue-100">Class {student.class} - Section {student.section}</p>
            <p className="text-blue-100">Roll Number: {student.rollNumber}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-blue-500" />
            Recent Exam Results
          </h3>
          <div className="space-y-3">
            {examRecords.slice(0, 3).map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{exam.subject}</p>
                  <p className="text-sm text-gray-600">{exam.examName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{exam.obtainedMarks}/{exam.maxMarks}</p>
                  <p className="text-sm text-green-600 font-medium">{exam.grade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar size={20} className="mr-2 text-purple-500" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {/* Pending Fees */}
            {pendingFees.slice(0, 2).map((fee) => (
              <div key={fee.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign size={16} className="text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{fee.feeType}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(fee.dueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <p className="font-bold text-red-600">₹{fee.amount.toLocaleString('en-IN')}</p>
              </div>
            ))}
            
            {/* Pending Homework */}
            {pendingHomework.slice(0, 1).map((hw) => (
              <div key={hw.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BookOpen size={16} className="text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-900">{hw.subject}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(hw.dueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <Clock size={16} className="text-yellow-600" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors">
            <DollarSign size={20} className="text-blue-500 mb-2" />
            <p className="font-medium text-gray-900">Pay Fees</p>
            <p className="text-sm text-gray-600">Pay pending fees online</p>
          </button>
          <button className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors">
            <FileText size={20} className="text-green-500 mb-2" />
            <p className="font-medium text-gray-900">View Report Card</p>
            <p className="text-sm text-gray-600">Check latest grades</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors">
            <BookOpen size={20} className="text-purple-500 mb-2" />
            <p className="font-medium text-gray-900">Submit Homework</p>
            <p className="text-sm text-gray-600">Upload assignments</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;