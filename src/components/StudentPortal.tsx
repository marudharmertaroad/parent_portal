// src/components/StudentPortal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Student, FeeRecord, ExamRecord, Notice, SubjectMark } from '../types';
import { supabase } from '../utils/supabaseClient';
import { X, Printer, Settings } from 'lucide-react';
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
const EnhancedReportCardModal = ({ student, examRecords, onClose, settings, rank }: { 
  student: Student, 
  examRecords: ExamRecord[], 
  onClose: () => void, 
  settings: any, 
  rank?: number 
}) => {
  if (!student) return null;

  const handlePrint = () => window.print();

  // --- Calculations remain the same ---
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
       <style>
        {`
          /* --- Print Styles (No changes needed here) --- */
          #report-card { position: relative; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box !important; }
          #report-card::after { content: ''; background: url('/logo.png') center/contain no-repeat; position: absolute; inset: 0; opacity: 0.08; z-index: 0; }
          #report-card > * { position: relative; z-index: 1; }
          @page { size: landscape; margin: 1cm; }
          @media print {
            html, body { width: 100%; height: 100%; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
            body * { visibility: hidden; }
            #report-card-wrapper, #report-card-wrapper * { visibility: visible; }
            #report-card-wrapper { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden !important; }
            .no-print { display: none !important; }
            #report-card { width: 100%; height: 100%; border: 2px solid black !important; box-shadow: none !important; border-radius: 0; font-size: 10pt; overflow: hidden !important; display: flex; flex-direction: column; }
            #report-card table { font-size: 9pt; }
            #report-card main { flex-grow: 1; flex-shrink: 1; overflow: hidden; }
          }
        `}
      </style>
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-4 sm:p-6 border-b no-print flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Student Report Card</h3>
            <div className="flex space-x-3">
              <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Printer className="w-4 h-4 mr-2" />Print</button>
              <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
            </div>
        </div>
        
        <div id="report-card-wrapper" className="p-4">
          <div className="border-2 border-black p-4 bg-white rounded-lg flex flex-col h-full relative" id="report-card">
            
            {/* === RESPONSIVE HEADER === */}
            <header className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 text-center sm:text-left">
              <div className="flex items-center space-x-4">
                <img src="/logo.png" alt="School Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-blue-800">{settings.schoolName}</h1>
                  <p className="text-xs sm:text-sm text-gray-500">{settings.schoolAddress}</p>
                </div>
              </div>
              <div className="mt-2 sm:mt-0 text-center">
                <h2 className="text-lg sm:text-2xl font-bold text-blue-800">{reportTitle}</h2>
                <p className="text-base sm:text-lg text-blue-600">Session: {settings.session}</p>
              </div>
            </header>

            {/* === RESPONSIVE STUDENT & PERFORMANCE INFO === */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h3 className="font-bold text-md mb-2 text-blue-800">Student Information</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p><strong>Name:</strong></p><p>{student.name}</p>
                  <p><strong>SR No:</strong></p><p>{student.srNo}</p>
                  <p><strong>Father's Name:</strong></p><p>{student.fatherName}</p>
                  <p><strong>Class:</strong></p><p>{student.class}</p>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h3 className="font-bold text-md mb-2 text-green-800">Performance Summary</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p><strong>Percentage:</strong></p><p>{overallPercentage.toFixed(1)}%</p>
                  <p><strong>Grade:</strong></p><p><span className={`px-2 py-0.5 rounded font-bold ${getGradeColor(overallGrade)}`}>{overallGrade}</span></p>
                  <p><strong>Result:</strong></p><p><span className={`px-2 py-0.5 rounded font-bold ${overallResult === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{overallResult}</span></p>
                  <p><strong>Class Rank:</strong></p><p><span className="font-bold text-purple-700">{rank ? `#${rank}` : 'N/A'}</span></p>
                </div>
              </div>
            </section>

            {/* === SCHOLASTIC AREAS (MAIN CONTENT) === */}
            <main className="flex-grow">
              <h3 className="font-bold text-lg mb-2 text-blue-800">Scholastic Areas</h3>

              {/* --- DESKTOP VIEW: WIDE TABLE (Hidden on mobile) --- */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse border border-gray-400 text-xs">
                  {/* ... Your existing table thead, tbody, tfoot for desktop ... */}
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
                   <tfoot className="font-bold bg-blue-50 text-center">
                    <tr>
                      <td className="border p-1 text-left">Total Marks</td>
                      {uniqueExamTypes.map(examType => {
                        const exam = safeExamRecords.find(e => e.examType === examType);
                        return ( <td className="border p-1" colSpan={3} key={examType}>{exam ? `${exam.obtainedMarks} / ${exam.totalMarks}` : '-'}</td> );
                      })}
                      <td className="border p-1 bg-green-100" colSpan={3}>{`${totalObtained} / ${totalMax}`}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* --- MOBILE VIEW: VERTICAL CARDS (Only visible on mobile) --- */}
              <div className="md:hidden space-y-3">
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
                    <div key={subjectName} className="bg-gray-50 border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800">{subjectName}</h4>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold">{totalSubObtained} / {totalSubMax} ({calculateGrade(subjectPercentage)})</p>
                        </div>
                      </div>
                      <div className="border-t pt-2 space-y-1 text-xs">
                        {uniqueExamTypes.map(examType => {
                          const subject = safeExamRecords.find(e => e.examType === examType)?.subjects?.find(s => s.subject === subjectName);
                          return (
                            <div key={examType} className="flex justify-between">
                              <span className="text-gray-600">{examType}:</span>
                              <span className="font-mono">{subject ? `${subject.obtainedMarks}/${subject.maxMarks}` : 'N/A'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </main>

            <footer className="pt-6 mt-auto">
                <div className="grid grid-cols-2 gap-x-8">
                    <div className="border-t-2 border-gray-400 pt-1">
                        <p className="text-center font-bold text-sm">Class Teacher's Signature</p>
                    </div>
                    <div className="border-t-2 border-gray-400 pt-1">
                        <p className="text-center font-bold text-sm">Principal's Signature & Seal</p>
                    </div>
                </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentPortal: React.FC = () => {
  const { student } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
   const handleTabChange = (tab: string) => {
    console.log(`Tab change requested. New tab will be: '${tab}'`);
    setActiveTab(tab);
  };
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showReportCard, setShowReportCard] = useState(false);
  const [selectedStudentRank, setSelectedStudentRank] = useState<number | undefined>(undefined);
  const [allStudentHistories, setAllStudentHistories] = useState<any[]>([]);
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

  const groupExamsByStudent = (records: any[]): any[] => {
      const grouped = records.reduce((acc: Record<string, any>, record) => {
        const studentId = record.students.sr_no;
        if (!acc[studentId]) {
          acc[studentId] = {
            studentId: studentId,
            studentName: record.students.name,
            class: record.students.class,
            exams: [],
          };
        }
        acc[studentId].exams.push({
            id: record.id,
            examType: record.exam_type,
            examDate: record.exam_date,
            subjects: record.subjects,
            totalMarks: record.total_marks,
            obtainedMarks: record.obtained_marks,
            percentage: record.percentage,
            grade: record.grade,
        });
        return acc;
      }, {});
      
      return Object.values(grouped).map(s => {
          const allMarks = s.exams.reduce((total: number, exam: ExamRecord) => total + (exam.obtainedMarks || 0), 0);
          const allMaxMarks = s.exams.reduce((total: number, exam: ExamRecord) => total + (exam.totalMarks || 0), 0);
          const overallPercentage = allMaxMarks > 0 ? (allMarks / allMaxMarks) * 100 : 0;
          return {
              ...s,
              overallPerformance: {
                  totalMarks: allMaxMarks,
                  obtainedMarks: allMarks,
                  percentage: overallPercentage,
                  grade: calculateGrade(overallPercentage),
                  result: overallPercentage >= 35 ? 'PASS' : 'FAIL',
              }
          };
      });
  };
  
  const fetchStudentData = useCallback(async () => {
    if (!student) return;
    setIsLoadingData(true);

    const [feeResponse, examResponse, homeworkResponse, noticeResponse, notificationRes, allExamsForRankingResponse] = await Promise.all([
    // Promise 1: feeResponse -> gets fee_records
    supabase.from('fee_records').select('*, student:students!inner(name, father_name, medium)').eq('student_id', student.srNo).eq('students.medium', student.medium),
    
    // Promise 2: examResponse -> gets exam_records
    supabase.from('exam_records').select(`*, students!inner(medium), subjects:subject_marks(*)`).eq('student_id', student.srNo).eq('students.medium', student.medium).order('exam_date', { ascending: false }),
    
    // Promise 3: homeworkResponse -> CORRECTLY gets homework_assignments now
    supabase.from('homework_assignments').select('*').eq('class', student.class).eq('medium', student.medium).eq('is_active', true),
    
    // Promise 4: noticeResponse -> CORRECTLY gets notices now
    supabase.from('notices').select('*').or(`target_class.is.null,target_class.eq.all,target_class.eq.${student.class}`).eq('is_active', true),
    
    // Promise 5: notificationRes -> gets notifications
    supabase.from('notifications').select('*').or(`target_audience.eq.all,target_class.eq.${student.class},target_student_sr_no.eq.${student.srNo}`).order('created_at', { ascending: false }).limit(50),
      
  supabase.from('exam_records').select(`
          id, exam_type, exam_date, total_marks, obtained_marks, percentage, grade,
          students!inner(sr_no, name, class),
          subjects:subject_marks(subject, max_marks, obtained_marks, grade)
        `)
        .eq('students.class', student.class)
        .eq('students.medium', student.medium)
      // =========================================
    ]);

    const { data: feeData, error: feeError } = feeResponse;
    if (feeError) console.error("Error fetching fees:", feeError);
    else {
      const mappedFeeRecords = (feeData || []).map((r: any) => ({
        recordId: r.id, studentId: r.student_id, studentName: r.student?.name, fatherName: r.student?.father_name, class: r.class, totalFees: r.total_fees || 0, paidFees: r.paid_fees || 0,
        pendingFees: r.pending_fees || 0, discountFees: r.discount_fees || 0, busFees: r.bus_fees || 0, dueDate: r.due_date, lastPaymentDate: r.last_payment_date,
      }));
      setFeeRecords(mappedFeeRecords);
    }

    const { data: examData, error: examError } = examResponse;
    if (examError) console.error("Error fetching exams:", examError);
    else {
      const mappedExamRecords = (examData || []).map((exam: any) => ({
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
  const { data: hwData, error: hwError } = homeworkResponse;
    if (hwError) console.error("Error fetching homework:", hwError);
    else setHomework(hwData || []);
    
    const { data: noticeData, error: noticeError } = noticeResponse;
    if (noticeError) console.error("Error fetching notices:", noticeError);
    else setNotices(noticeData || []);

    if (notificationRes.error) console.error("Error fetching notifications:", notificationRes.error);
    else setNotifications(notificationRes.data || []);
    
const { data: allExamsData, error: allExamsError } = allExamsForRankingResponse;
    if (allExamsError) {
      console.error("Error fetching all student histories for ranking:", allExamsError);
    } else if (allExamsData) {
      const groupedHistories = groupExamsByStudent(allExamsData);
      setAllStudentHistories(groupedHistories);
    }
    
    setIsLoadingData(false);
  }, [student]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  

   useEffect(() => {
    if (!student) return;

    console.log("Setting up real-time channel for notifications...");

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          console.log('Real-time: New notification data received!', payload);
          
          const newNotification = payload.new as Notification;

          // Double-check if the new notification is targeted for this user
          const isForEveryone = newNotification.target_audience === 'all';
          const isForMyClass = newNotification.target_audience === 'class' && newNotification.target_class === student.class;
          const isForMe = newNotification.target_audience === 'student' && newNotification.target_student_sr_no === student.srNo;

          if (isForEveryone || isForMyClass || isForMe) {
            console.log('This notification is for me. Updating state.');
            
            // This is a safer way to update state to guarantee a re-render
            setNotifications(currentNotifications => [newNotification, ...currentNotifications]);
            setUnreadCount(currentCount => currentCount + 1);
            
            // Trigger a browser notification
            if (window.Notification?.permission === "granted") {
              new window.Notification(newNotification.title, { 
                body: newNotification.message,
                icon: '/logo.png' // Optional: Adds your school logo to the notification
              });
            }
          } else {
            console.log("This notification is not for me. Ignoring.");
          }
        }
      )
      .subscribe((status) => {
        // This callback helps debug the subscription itself
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time notifications channel!');
        }
        if (status === 'CHANNEL_ERROR') {
            console.error('There was an error with the real-time channel.');
        }
        if (status === 'TIMED_OUT') {
            console.warn('Real-time connection timed out.');
        }
      });

    // Cleanup function to remove the channel when the component unmounts
    return () => {
      console.log("Cleaning up real-time channel.");
      supabase.removeChannel(channel);
    };
  }, [student]);

  const handleViewReport = (rank?: number) => {
    setSelectedStudentRank(rank); // Store the rank
    setShowReportCard(true);      // Open the modal
  };

  // Request notification permission on component mount

  const handleBellClick = () => {
    setShowNotificationDrawer(true);
    setUnreadCount(0);
  };
  

  const refreshStudentData = () => {
    alert("Photo updated successfully! The portal will now refresh.");
    window.location.reload();
  };

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

  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student records...</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices} onTabChange={handleTabChange} />;
      case 'fees':
        return <FeesSection feeRecords={feeRecords} studentName={student.name} />;
      case 'academic':
        return <AcademicRecords student={student} examRecords={examRecords} allStudentHistories={allStudentHistories} onViewReport={handleViewReport} />;
      case 'homework':
        return <HomeworkSection homeworkList={homework} student={student} />;
      case 'notices':
        return <NoticeBoard notices={notices} studentClass={student.class} />;
      default:
        return <Dashboard student={student} feeRecords={feeRecords} examRecords={examRecords} notices={notices} onTabChange={setActiveTab} />;
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
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
      
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        student={student}
        onDataRefresh={refreshStudentData}
      />
      {showReportCard && (
        <EnhancedReportCardModal
          student={student}
          examRecords={examRecords}
          onClose={() => setShowReportCard(false)}
          settings={reportSettings}
          rank={selectedStudentRank}
        />
      )}
      <NotificationDrawer isOpen={showNotificationDrawer} onClose={() => setShowNotificationDrawer(false)} notifications={notifications} />
    </div>
  );
};

export default StudentPortal;