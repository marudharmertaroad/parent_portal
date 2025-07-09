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
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../utils';

interface DashboardProps {
  student: Student;
  feeRecords: FeeRecord[];
  examRecords: ExamRecord[];
  homework: Homework[];
  notifications: Notification[];
}

const Dashboard: React.FC<DashboardProps> = ({
  student,
  feeRecords = [],
  examRecords = [],
  homework = [],
  notifications = []
}) => {
  const pendingFees = feeRecords.filter(fee => 
    fee.status === 'pending' || fee.status === 'overdue' || fee.status === 'partial'
  );
  const unreadNotifications = notifications.filter(n => !n.read);
  const averageScore = examRecords.length > 0 
    ? examRecords.reduce((sum, exam) => sum + (exam.percentage || 0), 0) / examRecords.length
    : 0;

  const pendingHomework = homework.filter(hw => hw.status === 'pending');
  const overdueHomework = homework.filter(hw => hw.status === 'overdue');

  const stats = [
    {
      title: 'Pending Fees',
      value: `₹${pendingFees.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Average Score',
      value: `${averageScore.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending Homework',
      value: pendingHomework.length + overdueHomework.length,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Notifications',
      value: unreadNotifications.length,
      icon: Bell,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const getHomeworkUrgency = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600', bg: 'bg-red-50' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-red-600', bg: 'bg-red-50' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (diffDays <= 3) return { text: `${diffDays} days left`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: `${diffDays} days left`, color: 'text-green-600', bg: 'bg-green-50' };
  };

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
            <p className="text-blue-100">Class: {student.class} • Medium: {student.medium}</p>
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
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon size={24} className={stat.textColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-blue-500" />
            Recent Exam Results
          </h3>
          <div className="space-y-3">
            {examRecords.length === 0 ? (
              <div className="text-center py-4">
                <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No exam records available</p>
              </div>
            ) : (
              examRecords.slice(0, 3).map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{exam.examName}</p>
                    <p className="text-sm text-gray-600">Date: {formatDate(exam.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{exam.obtainedMarks}/{exam.maxMarks}</p>
                    <p className="text-sm text-green-600 font-medium">{exam.grade}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Homework */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen size={20} className="mr-2 text-purple-500" />
            Upcoming Homework
          </h3>
          <div className="space-y-3">
            {homework.length === 0 ? (
              <div className="text-center py-4">
                <BookOpen size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No homework assignments</p>
              </div>
            ) : (
              homework
                .filter(hw => hw.status === 'pending' || hw.status === 'overdue')
                .slice(0, 3)
                .map((hw) => {
                  const urgency = getHomeworkUrgency(hw.due_date);
                  return (
                    <div key={hw.id} className={`p-3 rounded-lg ${urgency.bg}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{hw.title}</p>
                          <p className="text-sm text-gray-600">{hw.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${urgency.color}`}>
                            {urgency.text}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(hw.due_date).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Pending Fees & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Fees */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign size={20} className="mr-2 text-red-500" />
            Pending Fees
          </h3>
          <div className="space-y-3">
            {pendingFees.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
                <p className="text-green-600">All fees are paid!</p>
              </div>
            ) : (
              pendingFees.slice(0, 3).map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign size={16} className="text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{fee.feeType}</p>
                      <p className="text-sm text-gray-600">Due: {new Date(fee.dueDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">₹{fee.amount.toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      fee.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                      fee.status === 'partial' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {fee.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell size={20} className="mr-2 text-purple-500" />
            Recent Notifications
          </h3>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-4">
                <Bell size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                  notification.type === 'error' ? 'bg-red-50 border-red-400' :
                  notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  notification.type === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors group">
            <DollarSign size={20} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900">Pay Fees</p>
            <p className="text-sm text-gray-600">Pay pending fees online</p>
          </button>
          <button className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors group">
            <FileText size={20} className="text-green-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900">View Report Card</p>
            <p className="text-sm text-gray-600">Check latest grades</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors group">
            <BookOpen size={20} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900">Submit Homework</p>
            <p className="text-sm text-gray-600">Upload assignments</p>
          </button>
          <button className="p-4 bg-orange-50 rounded-lg text-left hover:bg-orange-100 transition-colors group">
            <Bell size={20} className="text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900">View Notices</p>
            <p className="text-sm text-gray-600">School announcements</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;