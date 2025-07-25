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
const EnhancedReportCardModal = ({ student, examRecords, onClose, settings }: { student: Student, examRecords: ExamRecord[], onClose: () => void, settings: any }) => {
  if (!student) return null;

  const handlePrint = () => window.print();

  // --- SAFE & CORRECTED CALCULATIONS ---
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
      /* --- Watermark & Print Preparation --- */
      #report-card {
        position: relative; 
      }
      * {
        -webkit-print-color-adjust: exact !important; /* For older Safari/Chrome */
        print-color-adjust: exact !important;        /* The standard */
        box-sizing: border-box !important;
      }
      #report-card::after {
        content: '';
        background: url('/logo.png') center/contain no-repeat;
        position: absolute;
        inset: 0;
        opacity: 0.08;
        z-index: 0;
      }
      
      #report-card > * {
        position: relative;
        z-index: 1;
      }

      /* --- Print-specific Styles --- */
      @page {
        size: landscape;
        margin: 1cm;
      }
      
      @media print {
        /* A universal fix for many layout issues */
        * {
          box-sizing: border-box !important;
        }

        /* Reset body and hide overflow */
        html, body {
          width: 100%;
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important; /* CRUCIAL: Prevents scrollbars/overflow from creating a second page */
        }
        
        /* Hide EVERYTHING on the page by default */
        body * {
          visibility: hidden;
        }
        
        /* Make ONLY the report card wrapper and its contents visible */
        #report-card-wrapper, #report-card-wrapper * {
          visibility: visible;
        }
        
        /* Position the wrapper to fill the entire print page */
        #report-card-wrapper {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: hidden !important; /* Double-down on preventing overflow */
        }
      
        /* Hide elements not meant for printing */
        .no-print { 
          display: none !important; 
        }
        
        /* Style the report card itself for the page */
        #report-card {
          width: 100%;
          height: 100%;
          border: 2px solid black !important;
          box-shadow: none !important;
          border-radius: 0;
          font-size: 10pt;
          overflow: hidden !important; /* TRIPLE-down: no content can spill out */
          display: flex;
          flex-direction: column;
        }
        
        #report-card table { 
          font-size: 9pt; 
        }

        /* Ensure main content does not try to grow past the page height */
        #report-card main {
          flex-grow: 1;
          flex-shrink: 1; /* Allow shrinking if needed */
          overflow: hidden; /* Hide any internal overflow in the main section */
        }
      }
    `}
  </style>
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
                {/* Hiding the photo box on the smallest screens to save space */}
                <div className="w-20 h-24 sm:w-24 sm:h-28 border-2 border-gray-400 rounded-lg p-1 bg-white hidden sm:flex items-center justify-center">
                  
                  {student.photoUrl ? (
                    <img 
                      src={student.photoUrl} 
                      alt="Student" 
                      className="w-full h-full object-cover rounded-md" 
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Photo</span>
                  )}
                </div>
              </header>

              {/* [MOBILE COMPACT] Sections now stack on mobile */}
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

              {/* [MOBILE COMPACT] This wrapper makes the table horizontally scrollable on small screens */}
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
                  <tfoot className="font-bold bg-blue-50 text-center">
                    <tr>
                      <td className="border p-1 text-left">Total Marks</td>
                      {uniqueExamTypes.map(examType => {
                        const exam = safeExamRecords.find(e => e.examType === examType);
                        return (
                          <React.Fragment key={examType}>
                            <td className="border p-1" colSpan={3}>{exam ? `${exam.obtainedMarks} / ${exam.totalMarks}` : '-'}</td>
                          </React.Fragment>
                        );
                      })}
                      {/* Grand Total */}
                      <td className="border p-1 bg-green-100" colSpan={3}>{`${totalObtained} / ${totalMax}`}</td>
                    </tr>
                    <tr>
                      <td className="border p-1 text-left">Percentage & Grade</td>
                      {uniqueExamTypes.map(examType => {
                        const exam = safeExamRecords.find(e => e.examType === examType);
                        const grade = exam ? calculateGrade(exam.percentage) : 'N/A';
                        return (
                          <React.Fragment key={examType}>
                            <td className="border p-1" colSpan={3}>
                              {exam ? `${exam.percentage.toFixed(1)}% (${grade})` : '-'}
                            </td>
                          </React.Fragment>
                        );
                      })}
                       {/* Grand Total Percentage */}
                      <td className="border p-1 bg-green-100" colSpan={3}>{`${overallPercentage.toFixed(1)}% (${overallGrade})`}</td>
                    </tr>
                  </tfoot>
                </table>
              </main>
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
   const handleTabChange = (tab: string) => {
    console.log(`Tab change requested. New tab will be: '${tab}'`);
    setActiveTab(tab);
  };
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

    const [feeResponse, examResponse, homeworkResponse, noticeResponse, notificationRes] = await Promise.all([
    // Promise 1: feeResponse -> gets fee_records
    supabase.from('fee_records').select('*, student:students!inner(name, father_name, medium)').eq('student_id', student.srNo).eq('students.medium', student.medium),
    
    // Promise 2: examResponse -> gets exam_records
    supabase.from('exam_records').select(`*, students!inner(medium), subjects:subject_marks(*)`).eq('student_id', student.srNo).eq('students.medium', student.medium).order('exam_date', { ascending: false }),
    
    // Promise 3: homeworkResponse -> CORRECTLY gets homework_assignments now
    supabase.from('homework_assignments').select('*').eq('class', student.class).eq('medium', student.medium).eq('is_active', true),
    
    // Promise 4: noticeResponse -> CORRECTLY gets notices now
    supabase.from('notices').select('*').or(`target_class.is.null,target_class.eq.all,target_class.eq.${student.class}`).eq('is_active', true),
    
    // Promise 5: notificationRes -> gets notifications
    supabase.from('notifications').select('*').or(`target_audience.eq.all,target_class.eq.${student.class},target_student_sr_no.eq.${student.srNo}`).order('created_at', { ascending: false }).limit(50)
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
        return <AcademicRecords student={student} examRecords={examRecords} onViewReport={() => setShowReportCard(true)} />;
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
        />
      )}
      <NotificationDrawer isOpen={showNotificationDrawer} onClose={() => setShowNotificationDrawer(false)} notifications={notifications} />
    </div>
  );
};

export default StudentPortal;