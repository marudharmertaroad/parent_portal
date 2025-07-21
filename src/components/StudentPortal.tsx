// src/components/StudentPortal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Student, FeeRecord, ExamRecord, Notice, SubjectMark, Homework } from '../types'; // Added Homework & Notification types
import { supabase } from '../utils/supabaseClient';
import { X, Printer } from 'lucide-react';
import { formatDate, getGradeColor, calculateGrade } from '../utils';

// Import all necessary components
import Header from './Header';
import Dashboard from './Dashboard';
import FeesSection from './FeesSection';
import AcademicRecords from './AcademicRecords';
import ProfileModal from './ProfileModal';
import HomeworkSection from './HomeworkSection';
import NoticeBoard from './NoticeBoard';
import NotificationDrawer from './NotificationDrawer';

// --- Report Card Modal (Corrected and Self-Contained) ---
const EnhancedReportCardModal = ({ student, examRecords, onClose, settings }: { student: Student, examRecords: ExamRecord[], onClose: () => void, settings: any }) => {
  if (!student) return null;

  const handlePrint = () => window.print();

  const safeExamRecords = Array.isArray(examRecords) ? examRecords : [];
  const reportTitle = "PROGRESS REPORT - CONSOLIDATED";
  
  const allSubjectsForStudent = safeExamRecords.flatMap(exam => exam.subjects || []);
  const mainSubjectNames = Array.from(new Set(allSubjectsForStudent.filter(s => !s.isComplementary).map(s => s.subject))).sort();
  
  const totalObtained = safeExamRecords.reduce((sum, exam) => sum + (exam.obtainedMarks || 0), 0);
  const totalMax = safeExamRecords.reduce((sum, exam) => sum + (exam.totalMarks || 0), 0);
  
  const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallGrade = calculateGrade(overallPercentage);
  const overallResult = overallPercentage >= settings.passingMarks ? 'PASS' : 'FAIL';

  const examOrder = ['Unit Test 1', 'Unit Test 2', 'Unit Test 3', 'Quarterly', 'Half Yearly', 'Yearly Exam', 'Pre-Board'];
  const uniqueExamTypes = Array.from(new Set(safeExamRecords.map(e => e.examType))).sort((a, b) => examOrder.indexOf(a) - examOrder.indexOf(b));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 print:p-0 print:bg-white">
       <style>{`@page{size:landscape;margin:1cm}@media print{*{box-sizing:border-box!important}html,body{width:100%;height:100%;margin:0!important;padding:0!important;overflow:hidden!important}#report-card::after{content:'';background:url('/logo.png') center/contain no-repeat;position:absolute;inset:0;opacity:0.08;z-index:0}#report-card>*{position:relative;z-index:1}body *{visibility:hidden}#report-card-wrapper,#report-card-wrapper *{visibility:visible}#report-card-wrapper{position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden!important}.no-print{display:none!important}#report-card{width:100%;height:100%;border:2px solid black!important;box-shadow:none!important;border-radius:0;font-size:10pt;overflow:hidden!important;display:flex;flex-direction:column}#report-card table{font-size:9pt}#report-card main{flex-grow:1;flex-shrink:1;overflow:hidden}}`}</style>
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 no-print">
            <h3 className="text-xl font-bold text-gray-800">Student Report Card</h3>
            <div className="flex space-x-3">
              <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Printer className="w-4 h-4 mr-2" />Print</button>
              <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
          <div id="report-card-wrapper">
            <div className="border-2 border-black p-4 bg-white rounded-lg flex flex-col h-full relative" id="report-card">
              <header className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-2">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <img src="/logo.png" alt="School Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-blue-800">{settings.schoolName}</h1>
                    <p className="text-xs sm:text-sm text-gray-500">{settings.schoolAddress}</p>
                  </div>
                </div>
                <div className="text-center mt-2 sm:mt-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-blue-800">{reportTitle}</h2>
                  <p className="text-base sm:text-lg text-blue-600">Session: {settings.session}</p>
                </div>
                <div className="w-20 h-24 sm:w-24 sm:h-28 border-2 border-gray-400 rounded-lg p-1 bg-white hidden sm:flex items-center justify-center">
                  {student.photoUrl ? <img src={student.photoUrl} alt="Student" className="w-full h-full object-cover"/> : <span className="text-xs text-gray-400">Photo</span>}
                </div>
              </header>
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-4 text-xs">
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                  <h3 className="font-bold text-sm mb-1 text-blue-800">Student Information</h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>SR No:</strong> {student.srNo}</p>
                    <p><strong>Father's Name:</strong> {student.fatherName}</p>
                    <p><strong>D.O.B:</strong> {formatDate(student.dob)}</p>
                    <p className="col-span-2"><strong>Class:</strong> {student.class}</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200">
                  <h3 className="font-bold text-sm mb-1 text-green-800">Performance Summary</h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <p><strong>Total Marks:</strong> {totalMax}</p>
                    <p><strong>Marks Obt:</strong> {totalObtained}</p>
                    <p><strong>Percentage:</strong> {overallPercentage.toFixed(1)}%</p>
                    <p><strong>Grade:</strong> <span className={`px-2 py-0.5 rounded font-bold ${getGradeColor(overallGrade)}`}>{overallGrade}</span></p>
                    <p className="col-span-2"><strong>Result:</strong><span className={`px-2 py-0.5 rounded font-bold ${overallResult === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{overallResult}</span></p>
                  </div>
                </div>
              </section>
              <main className="flex-grow mt-4 overflow-x-auto">
                <table className="w-full border-collapse border border-gray-400 text-xs">
                  <thead className="font-bold">
                    <tr className="bg-blue-100"><th rowSpan={2} className="border p-1">Subject</th>{uniqueExamTypes.map(et => (<th key={et} colSpan={3} className="border p-1">{et}</th>))}<th colSpan={3} className="border p-1 bg-green-200">Total</th></tr>
                    <tr className="bg-blue-50">{uniqueExamTypes.flatMap(() => ['Max', 'Obt.', 'Grd.']).map((h, i) => <th key={i} className="border p-1">{h}</th>)}<th className="border p-1 bg-green-100">Marks</th><th className="border p-1 bg-green-100">Grade</th><th className="border p-1 bg-green-100">%</th></tr>
                  </thead>
                  <tbody>
                    {mainSubjectNames.map(subjectName => {
                      let totalSubObtained = 0;
                      let totalSubMax = 0;
                      safeExamRecords.forEach(exam => {
                        const subject = exam.subjects?.find(s => s.subject === subjectName);
                        if (subject) {
                          totalSubObtained += (subject.obtainedMarks || 0);
                          totalSubMax += (subject.maxMarks || 0);
                        }
                      });
                      const subjectPercentage = totalSubMax > 0 ? (totalSubObtained / totalSubMax) * 100 : 0;
                      return (
                        <tr key={subjectName} className="text-center">
                          <td className="border p-1 font-medium text-left">{subjectName}</td>
                          {uniqueExamTypes.map(examType => {
                            const subject = safeExamRecords.find(e => e.examType === examType)?.subjects?.find(s => s.subject === subjectName);
                            return <React.Fragment key={examType}><td className="border p-1">{subject?.maxMarks ?? '-'}</td><td className="border p-1">{subject?.obtainedMarks ?? '-'}</td><td className="border p-1">{subject?.grade ?? '-'}</td></React.Fragment>;
                          })}
                          <td className="border p-1 font-bold bg-green-50">{totalSubObtained}/{totalSubMax}</td>
                          <td className="border p-1 font-bold bg-green-50">{calculateGrade(subjectPercentage)}</td>
                          <td className="border p-1 font-bold bg-green-50">{subjectPercentage.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </main>
              <footer className="pt-4 no-print">
                <div className="grid grid-cols-2 gap-x-8">
                    <div className="border-2 border-gray-300 rounded-lg p-2 h-24 flex flex-col justify-end"><p className="text-center font-bold text-sm border-t-2 border-gray-400 pt-1">Class Teacher's Signature</p></div>
                    <div className="border-2 border-gray-300 rounded-lg p-2 h-24 flex flex-col justify-end"><p className="text-center font-bold text-sm border-t-2 border-gray-400 pt-1">Principal's Signature & Seal</p></div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentPortal: React.FC = () => {
  const { student } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showReportCard, setShowReportCard] = useState(false);

  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [reportSettings, setReportSettings] = useState({
    schoolName: 'MARUDHAR DEFENCE SCHOOL',
    schoolAddress: 'Merta Road, Nagaur, Rajasthan - 341511',
    passingMarks: 35,
    session: '2024-25',
  });

  const fetchStudentData = useCallback(async () => {
    if (!student) return;
    setIsLoadingData(true);

    const [feeRes, examRes, noticeRes, homeworkRes, notificationRes] = await Promise.all([
      supabase.from('fee_records').select('*, student:students!inner(name, father_name, medium)').eq('student_id', student.srNo).eq('students.medium', student.medium),
      supabase.from('exam_records').select(`*, students!inner(medium), subjects:subject_marks(*)`).eq('student_id', student.srNo).eq('students.medium', student.medium).order('exam_date', { ascending: false }),
      supabase.from('notices').select('*').or(`target_class.is.null,target_class.eq.all,target_class.eq.${student.class}`).eq('is_active', true),
      supabase.from('homework_assignments').select('*').eq('class', student.class).eq('medium', student.medium).eq('is_active', true),
      supabase.from('notifications').select('*').or(`target_audience.eq.all,target_class.eq.${student.class},target_student_sr_no.eq.${student.srNo}`).order('created_at', { ascending: false }).limit(50)
    ]);
    
    // Process all data with safety checks
    setFeeRecords(feeRes.data?.map((r: any) => ({...r, studentName: r.student?.name, fatherName: r.student?.father_name})) || []);
    setNotices(noticeRes.data || []);
    setHomework(homeworkRes.data || []);
    setNotifications(notificationRes.data || []);

    if (examRes.error) console.error("Exam fetch error:", examRes.error);
    else {
        const mappedExamRecords = (examRes.data || []).map((exam: any): ExamRecord => ({
            id: exam.id, studentId: exam.student_id, examType: exam.exam_type, examDate: exam.exam_date,
            totalMarks: exam.total_marks || 0, obtainedMarks: exam.obtained_marks || 0, percentage: exam.percentage || 0,
            grade: exam.grade || 'N/A',
            subjects: (exam.subjects || []).map((sub: any): SubjectMark => ({
                subject: sub.subject, maxMarks: sub.max_marks || 0, obtainedMarks: sub.obtained_marks || 0,
                grade: sub.grade || 'N/A', isComplementary: sub.is_complementary || false,
            })),
        }));
        setExamRecords(mappedExamRecords);
    }
    
    setIsLoadingData(false);
  }, [student]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  useEffect(() => {
    if (!student) return;
    const channel = supabase.channel('public:notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
      (payload) => {
        const newNotification = payload.new as Notification;
        const isTargeted = newNotification.target_audience === 'all' || (newNotification.target_audience === 'class' && newNotification.target_class === student.class) || (newNotification.target_audience === 'student' && newNotification.target_student_sr_no === student.srNo);
        if (isTargeted) {
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          if (window.Notification?.permission === "granted") {
            new window.Notification('New School Notice!', { body: newNotification.title });
          }
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [student]);

  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const handleBellClick = () => {
    setShowNotificationDrawer(true);
    setUnreadCount(0);
  };
  
  const refreshStudentData = () => {
    alert("Photo updated successfully! The portal will now refresh.");
    window.location.reload();
  };

  if (!student) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (isLoadingData) {
      return <div className="text-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div><p className="mt-4 text-gray-600">Loading records...</p></div>;
    }
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices} onTabChange={handleTabChange} />;
      case 'fees':
        return <FeesSection feeRecords={feeRecords} studentName={student.name} />;
      case 'academic':
        return <AcademicRecords student={student} examRecords={examRecords} onViewReport={() => setShowReportCard(true)} />;
      case 'homework':
        return <HomeworkSection homeworkList={homework} student={student} />;
      case 'notices':
        return <NoticeBoard notices={notices} studentClass={student.class} />;
      default:
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices} onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        studentName={student.name}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onProfileClick={() => setShowProfileModal(true)}
        unreadCount={unreadCount}
        onBellClick={handleBellClick}
      />
      <main className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
      
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} student={student} onDataRefresh={refreshStudentData}/>
      {showReportCard && <EnhancedReportCardModal student={student} examRecords={examRecords} onClose={() => setShowReportCard(false)} settings={reportSettings} />}
      <NotificationDrawer isOpen={showNotificationDrawer} onClose={() => setShowNotificationDrawer(false)} notifications={notifications} />
    </div>
  );
};

export default StudentPortal;