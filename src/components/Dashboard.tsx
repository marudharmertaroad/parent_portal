// src/components/Dashboard.tsx (Polished Parent Portal Version)

import React from 'react';
import { Student, FeeRecord, ExamRecord, Notice } from '../types';
import { 
  Home, CreditCard, Award, BookOpen, Megaphone,
  DollarSign, FileText, Bell, TrendingUp, Calendar, School, User
} from 'lucide-react';
import { formatDate, getGradeColor } from '../utils';

// Define the props it expects from the parent
interface DashboardProps {
  student: Student;
  feeRecords: FeeRecord[];
  examRecords: ExamRecord[];
  notices: Notice[];
  onProfileClick: () => void;
  onTabChange: (tab: string) => void; // Function to change the page
}

const Dashboard: React.FC<DashboardProps> = ({
  student, feeRecords, examRecords, notices, onProfileClick, onTabChange
}) => {
  const pendingFees = feeRecords.filter(fee => fee.status !== 'Paid');
  const averageScore = examRecords.length > 0 
    ? examRecords.reduce((sum, exam) => sum + exam.percentage, 0) / examRecords.length
    : 0;

  const stats = [
    { title: 'Pending Dues', value: pendingFees.length, icon: DollarSign, color: 'from-red-500 to-orange-500', textColor: 'text-red-600', isCurrency: true },
    { title: 'Average Score', value: `${averageScore.toFixed(1)}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-600', textColor: 'text-green-600' },
    { title: 'School Notices', value: notices.length, icon: Bell, color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600' }
  ];

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'fees', name: 'Fee Details', icon: CreditCard },
    { id: 'academic', name: 'Academic Records', icon: Award },
    { id: 'homework', name: 'Homework', icon: BookOpen },
    { id: 'notices', name: 'Notice Board', icon: Megaphone },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-md border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.isCurrency ? `₹${pendingFees.reduce((sum, fee) => sum + fee.pendingFees, 0).toLocaleString('en-IN')}` : stat.value}
                </p>
              </div>
              <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon size={28} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- NEW ICON-BASED NAVIGATION TABS --- */}
      <div className="bg-white p-4 rounded-xl shadow-md border">
        <h3 className="font-semibold text-lg text-gray-800 mb-4 px-2">Navigate</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-center p-4 rounded-xl text-center transition-all duration-200 text-gray-700 hover:bg-blue-500 hover:text-white group"
            >
              <item.icon size={32} className="mb-2 transition-transform group-hover:scale-110" />
              <span className="font-semibold text-sm">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Recent Activity Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Exam Results */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><FileText size={22} className="mr-3 text-blue-500" />Recent Exam Results</h3>
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
            )) : <p className="text-center text-gray-500 py-6">No exam results available.</p>}
          </div>
        </div>
        {/* Fee Deadlines */}
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
                <p className="font-bold text-red-600 text-lg">₹{fee.pendingFees.toLocaleString('en-IN')}</p>
              </div>
            )) : <p className="text-center text-gray-500 py-6">No pending fees.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- This is the main layout component ---
const StudentPortal: React.FC = () => {
  const { student } = useAuth(); // Get the student from the context. This is the SINGLE source of truth.
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data fetching would happen here or be passed in from a higher-level component
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Guard clause: Show a loading screen until student data is available.
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

  // A placeholder function for the profile button
  const handleProfileClick = () => {
    alert("Full student profile modal would open here.");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        studentName={student.name}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          studentName={student.name}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6 md:p-8">
          {/* Conditional Rendering based on activeTab */}
          {activeTab === 'dashboard' && 
            <DashboardContent 
              student={student} 
              feeRecords={feeRecords}
              examRecords={examRecords}
              notices={notices}
              onProfileClick={handleProfileClick}
            />
          }
          {activeTab === 'fees' && <div className="bg-white p-6 rounded-xl shadow-md">Fee Details Page Content</div>}
          {activeTab === 'academic' && <div className="bg-white p-6 rounded-xl shadow-md">Academic Records Page Content</div>}
          {activeTab === 'homework' && <div className="bg-white p-6 rounded-xl shadow-md">Homework Page Content</div>}
          {activeTab === 'notices' && <div className="bg-white p-6 rounded-xl shadow-md">Notice Board Page Content</div>}
        </main>
      </div>
    </div>
  );
};

export default StudentPortal;