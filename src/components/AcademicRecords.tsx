import React, { useState, useMemo } from 'react';
import { Student, ExamRecord, StudentExamHistory } from '../types';
import { formatDate, getGradeColor } from '../utils';
import { Award, TrendingUp, Book, Printer, FileText, X, Check, Star as StarIcon, ChevronRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { FileText as ReportIcon } from 'lucide-react';

const AdmitCardModal: React.FC<{ isOpen: boolean; onClose: () => void; student: Student }> = ({ isOpen, onClose, student }) => {
  const [datesheet, setDatesheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
      const fetchDatesheet = async () => {
        setLoading(true);
        const { data } = await supabase
          .from('datesheets')
          .select('exam_title, schedule')
          .eq('class_name', student.class)
          .eq('medium', student.medium)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data) setDatesheet(data);
        setLoading(false);
      };
      fetchDatesheet();
    }
  }, [isOpen, student.class, student.medium]);

  const handlePrint = () => window.print();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <style>{`@media print { .no-print { display: none; } #printable-admit-card { margin: 0; padding: 0; border: none; box-shadow: none; font-size: 10pt; } }`}</style>
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div id="printable-admit-card" className="p-4 sm:p-8 overflow-y-auto">
          {loading ? <p>Loading Exam Schedule...</p> : datesheet ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">MARUDHAR DEFENCE SCHOOL</h2>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700">{datesheet.exam_title}</h3>
                <h4 className="text-sm sm:text-md text-gray-600">ADMIT CARD</h4>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-2 mb-6 text-xs sm:text-sm">
                <div><p><strong>Student:</strong> {student.name}</p><p><strong>Class:</strong> {student.class} ({student.medium})</p></div>
                <div className="sm:text-right"><p><strong>SR No:</strong> {student.srNo}</p><p><strong>Father's Name:</strong> {student.fatherName}</p></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead className="bg-gray-100"><tr><th className="border p-2">Date</th><th className="border p-2">Day</th><th className="border p-2">Subject</th><th className="border p-2">Time</th></tr></thead>
                  <tbody>{datesheet.schedule.map((row: any) => (<tr key={row.subject}><td className="border p-2">{formatDate(row.date)}</td><td className="border p-2">{row.day}</td><td className="border p-2 font-medium">{row.subject}</td><td className="border p-2">{row.time}</td></tr>))}</tbody>
                </table>
              </div>
            </>
          ) : ( <p className="text-center text-red-500">No admit card or exam schedule has been published for your class yet.</p> )}
        </div>
        <div className="p-4 border-t flex justify-end space-x-3 no-print">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Close</button>
          <button onClick={handlePrint} disabled={!datesheet} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><Printer size={16} /> Print</button>
        </div>
      </div>
    </div>
  );
};

// [MOBILE COMPACT] ExamDetailsModal is now responsive
const ExamDetailsModal: React.FC<{ exam: ExamRecord | null, onClose: () => void }> = ({ exam, onClose }) => {
  if (!exam) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">{exam.examType} - Detailed Marks</h3>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><X size={24} /></button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
            {/* [MOBILE COMPACT] On mobile, we use a list. On desktop (sm and up), we use a table. */}
            {/* Mobile List View */}
            <div className="sm:hidden divide-y">
                {exam.subjects.map(subject => (
                    <div key={subject.subject} className="py-3">
                        <p className="font-bold text-gray-800">{subject.subject}</p>
                        <div className="flex justify-between items-center mt-1 text-sm">
                            <p className="text-gray-500">Score: <span className="font-semibold text-gray-700">{subject.obtainedMarks} / {subject.maxMarks}</span></p>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getGradeColor(subject.grade)}`}>{subject.grade}</span>
                        </div>
                    </div>
                ))}
            </div>
            {/* Desktop Table View */}
            <table className="w-full text-left hidden sm:table">
                <thead className="bg-gray-100"><tr><th className="p-3 font-semibold text-sm">Subject</th><th className="p-3 font-semibold text-sm text-center">Max Marks</th><th className="p-3 font-semibold text-sm text-center">Obtained Marks</th><th className="p-3 font-semibold text-sm text-center">Grade</th></tr></thead>
                <tbody className="divide-y">{exam.subjects.map(subject => (<tr key={subject.subject}><td className="p-3 font-medium">{subject.subject}</td><td className="p-3 text-center">{subject.maxMarks}</td><td className="p-3 text-center font-bold">{subject.obtainedMarks}</td><td className="p-3 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getGradeColor(subject.grade)}`}>{subject.grade}</span></td></tr>))}</tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

// [MOBILE COMPACT] StatCard is now responsive
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border flex items-center gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg flex items-center justify-center`}><Icon size={20} sm:size={24} className="text-white" /></div>
        <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);


// --- The Main AcademicRecords Component ---
interface AcademicRecordsProps {
  student: Student;
  examRecords: ExamRecord[];
  allStudentHistories: StudentExamHistory[]; 
  onViewReport: (rank?: number) => void;
}

const AcademicRecords: React.FC<AcademicRecordsProps> = ({ student, examRecords = [], onViewReport }) => {
  const [showAdmitCard, setShowAdmitCard] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);

  const stats = useMemo(() => {
    const safeExamRecords = Array.isArray(examRecords) ? examRecords : [];
    if (safeExamRecords.length === 0) {
      return { overallPercentage: 0, examsTaken: 0, bestSubject: 'N/A' };
    }

    const totalPercentage = safeExamRecords.reduce((sum, exam) => sum + (exam.percentage || 0), 0);
    const overallPercentage = totalPercentage / safeExamRecords.length;

    const allSubjectMarks: { [subject: string]: { total: number; count: number } } = {};
    safeExamRecords.forEach(exam => {
       const safeSubjects = Array.isArray(exam.subjects) ? exam.subjects : [];
      safeSubjects.forEach(subject => {
        if (!allSubjectMarks[subject.subject]) {
          allSubjectMarks[subject.subject] = { total: 0, count: 0 };
        }
        allSubjectMarks[subject.subject].total += ((subject.obtainedMarks || 0) / (subject.maxMarks || 100)) * 100;
        allSubjectMarks[subject.subject].count += 1;
      });
    });

    let bestSubject = 'N/A';
    let highestAvg = 0;
    for (const subject in allSubjectMarks) {
      const avg = allSubjectMarks[subject].total / allSubjectMarks[subject].count;
      if (avg > highestAvg) {
        highestAvg = avg;
        bestSubject = subject;
      }
    }

    return { overallPercentage, examsTaken: safeExamRecords.length, bestSubject };
  }, [examRecords]);

  const calculateRanks = (histories: StudentExamHistory[]): Map<string, number> => {
    const ranks = new Map<string, number>();
    const studentsInClass = histories.filter(h => h.class === student.class);
    
    const sortedStudents = [...studentsInClass].sort(
      (a, b) => b.overallPerformance.percentage - a.overallPerformance.percentage
    );

    let currentRank = 0;
    let lastPercentage = -1;

    sortedStudents.forEach((s, index) => {
      // Handle ties: if percentages are the same, give the same rank
      if (s.overallPerformance.percentage !== lastPercentage) {
        currentRank = index + 1;
      }
      ranks.set(s.studentId, currentRank);
      lastPercentage = s.overallPerformance.percentage;
    });
    
    return ranks;
  };

  const studentRanks = useMemo(() => calculateRanks(allStudentHistories), [allStudentHistories, student.class]);
  const classRank = studentRanks.get(student.srNo);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header and Action Buttons - now responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl"><Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Academic Records</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Performance overview and reports.</p>
          </div>
        </div>
        <button onClick={() => setShowAdmitCard(true)} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 sm:px-5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg transition-transform hover:scale-105"><FileText size={18} className="mr-2" /> View Admit Card</button>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-center md:text-left">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Consolidated Performance</h3>
          <p className="text-sm text-gray-500 mt-1">View a summary of all exam results for the entire year.</p>
        </div>
        <button onClick={() => onViewReport(classRank)} className="w-full md:w-auto shrink-0 flex items-center justify-center px-5 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-lg transition-transform hover:scale-105"><FileText size={18} className="mr-2" /> View Report</button>
      </div>

      {/* Stats Cards - now responsive */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-grow min-w-[160px]"><StatCard title="Overall Percentage" value={`${stats.overallPercentage.toFixed(1)}%`} icon={TrendingUp} color="bg-green-500" /></div>
        <div className="flex-grow min-w-[160px]">
        <StatCard 
            title="Class Rank" 
            value={classRank ? `#${classRank}` : 'N/A'} 
            icon={Award} 
            color="bg-purple-500" 
        />
    </div>
        <div className="flex-grow min-w-[160px]"><StatCard title="Exams Appeared" value={stats.examsTaken} icon={Book} color="bg-blue-500" /></div>
        <div className="flex-grow min-w-[160px]"><StatCard title="Top Subject" value={stats.bestSubject} icon={StarIcon} color="bg-yellow-500" /></div>
      </div>

      {/* Exam Results List */}
      <div className="bg-white rounded-xl shadow-md border">
        <div className="p-4 sm:p-6 border-b"><h3 className="text-base sm:text-lg font-semibold text-gray-800">Exam Report Cards</h3></div>
        <div className="divide-y divide-gray-200">
          {examRecords.length > 0 ? examRecords.map((exam) => (
            // [MOBILE COMPACT] Each exam is now a self-contained card on mobile
            <div key={exam.id} className="p-4 hover:bg-gray-50/50" onClick={() => setSelectedExam(exam)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="font-bold text-base sm:text-lg text-gray-800">{exam.examType}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{formatDate(exam.examDate)}</p>
                    {/* Mobile-only details */}
                    <div className="sm:hidden mt-2 flex items-center gap-4 text-sm">
                        <div className="text-left"><p className="text-xs text-gray-500">Score</p><p className="font-semibold text-gray-800">{exam.obtainedMarks}/{exam.totalMarks}</p></div>
                        <div className="text-left"><p className="text-xs text-gray-500">%</p><p className="font-semibold text-gray-800">{exam.percentage.toFixed(1)}%</p></div>
                    </div>
                </div>
                {/* Desktop-only details */}
                <div className="hidden sm:flex items-center gap-4">
                  <div className="text-right"><p className="text-xs text-gray-500">Score</p><p className="font-semibold text-gray-800">{exam.obtainedMarks}/{exam.totalMarks}</p></div>
                  <div className="text-right"><p className="text-xs text-gray-500">Percentage</p><p className="font-semibold text-gray-800">{exam.percentage.toFixed(1)}%</p></div>
                  <span className={`px-4 py-2 text-md font-bold rounded-full ${getGradeColor(exam.grade)}`}>Grade: {exam.grade}</span>
                </div>
                <div className="ml-4">
                    <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            </div>
          )) : ( <div className="text-center p-12 text-gray-500"><p className="font-semibold">No Exam Records Found</p><p className="text-sm mt-1">Your results will appear here once published.</p></div> )}
        </div>
      </div>

      {/* Modals */}
      <ExamDetailsModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
      <AdmitCardModal isOpen={showAdmitCard} onClose={() => setShowAdmitCard(false)} student={student} />
    </div>
  );
};

export default AcademicRecords;