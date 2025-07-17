import React, { useState, useMemo } from 'react';
import { ExamRecord, Student } from '../types';
import { formatDate, getGradeColor } from '../utils';
import { Award, TrendingUp, Book, Printer, FileText, X, Check, Star as StarIcon } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { FileText as ReportIcon } from 'lucide-react';

const AdmitCardModal: React.FC<{ isOpen: boolean; onClose: () => void; student: Student }> = ({ isOpen, onClose, student }) => {
  // This modal will have its own logic to fetch the datesheet
  const [datesheet, setDatesheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
      const fetchDatesheet = async () => {
        setLoading(true);
        const { data, error } = await supabase
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
      <style>{`@media print { .no-print { display: none; } #printable-admit-card { margin: 0; padding: 0; border: none; box-shadow: none; } }`}</style>
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div id="printable-admit-card" className="p-8 overflow-y-auto">
          {loading ? (
            <p>Loading Exam Schedule...</p>
          ) : datesheet ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">MARUDHAR DEFENCE SCHOOL</h2>
                <h3 className="text-lg font-semibold text-gray-700">{datesheet.exam_title}</h3>
                <h4 className="text-md text-gray-600">ADMIT CARD</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><p><strong>Student:</strong> {student.name}</p><p><strong>Class:</strong> {student.class} ({student.medium})</p></div>
                <div className="text-right"><p><strong>SR No:</strong> {student.srNo}</p><p><strong>Father's Name:</strong> {student.fatherName}</p></div>
              </div>
              <table className="w-full border-collapse">
                <thead className="bg-gray-100"><tr><th className="border p-2">Date</th><th className="border p-2">Day</th><th className="border p-2">Subject</th><th className="border p-2">Time</th></tr></thead>
                <tbody>
                  {datesheet.schedule.map((row: any) => (
                    <tr key={row.subject}><td className="border p-2">{formatDate(row.date)}</td><td className="border p-2">{row.day}</td><td className="border p-2 font-medium">{row.subject}</td><td className="border p-2">{row.time}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-center text-red-500">No admit card or exam schedule has been published for your class yet.</p>
          )}
        </div>
        <div className="p-4 border-t flex justify-end space-x-3 no-print">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Close</button>
          <button onClick={handlePrint} disabled={!datesheet} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Printer size={16} className="inline mr-2" />Print Admit Card
          </button>
        </div>
      </div>
    </div>
  );
};

// --- A new modal to show subject-wise details for a single exam ---
const ExamDetailsModal: React.FC<{ exam: ExamRecord | null, onClose: () => void }> = ({ exam, onClose }) => {
  if (!exam) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{exam.examType} - Detailed Marks</h3>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 font-semibold text-sm">Subject</th>
                <th className="p-3 font-semibold text-sm text-center">Max Marks</th>
                <th className="p-3 font-semibold text-sm text-center">Obtained Marks</th>
                <th className="p-3 font-semibold text-sm text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {exam.subjects.map(subject => (
                <tr key={subject.subject}>
                  <td className="p-3 font-medium">{subject.subject}</td>
                  <td className="p-3 text-center">{subject.maxMarks}</td>
                  <td className="p-3 text-center font-bold">{subject.obtainedMarks}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getGradeColor(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-md border flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);


// --- The Main AcademicRecords Component ---
interface AcademicRecordsProps {
  student: Student;
  examRecords: ExamRecord[];
  onViewReport: () => void;
}

const AcademicRecords: React.FC<AcademicRecordsProps> = ({ student, examRecords = [] }) => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Academic Records</h1>
            <p className="text-gray-600 mt-1">Your performance overview and report cards.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdmitCard(true)}
          className="w-full sm:w-auto flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg transition-transform hover:scale-105"
        >
          <FileText size={18} className="mr-2" />
          View / Print Admit Card
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Overall Percentage" value={`${stats.overallPercentage.toFixed(1)}%`} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Exams Appeared" value={stats.examsTaken} icon={Book} color="bg-blue-500" />
        <StatCard title="Top Subject" value={stats.bestSubject} icon={StarIcon} color="bg-yellow-500" />
      </div>

      {/* Exam Results List */}
      <div className="bg-white rounded-xl shadow-md border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Exam Report Cards</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {examRecords.length > 0 ? examRecords.map((exam) => (
            <div key={exam.id} className="p-4 md:p-6 grid md:grid-cols-4 gap-4 items-center hover:bg-gray-50 transition-colors">
              
              <div className="md:col-span-1">
                <p className="font-bold text-lg text-gray-800">{exam.examType}</p>
                <p className="text-sm text-gray-500">{formatDate(exam.examDate)}</p>
              </div>

              <div className="md:col-span-1 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="font-semibold text-gray-800">{exam.obtainedMarks}/{exam.totalMarks}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Percentage</p>
                  <p className="font-semibold text-gray-800">{exam.percentage.toFixed(1)}%</p>
                </div>
              </div>

              <div className="md:col-span-1 flex justify-start md:justify-center">
                <span className={`px-4 py-2 text-md font-bold rounded-full ${getGradeColor(exam.grade)}`}>
                  Grade: {exam.grade}
                </span>
              </div>
              
              <div className="md:col-span-1 flex justify-end">
                <button
                  onClick={() => setSelectedExam(exam)}
                  className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-lg hover:bg-blue-200"
                >
                  View Details
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center p-12 text-gray-500">
              <p className="font-semibold">No Exam Records Found</p>
              <p className="text-sm mt-1">Your results will appear here once published.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ExamDetailsModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
      <AdmitCardModal isOpen={showAdmitCard} onClose={() => setShowAdmitCard(false)} student={student} />
    </div>
  );
};
export default AcademicRecords;