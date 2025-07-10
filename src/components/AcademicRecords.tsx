// src/components/AcademicRecords.tsx

import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { ExamRecord, SubjectMark } from '../types';
import { formatDate, getGradeColor, calculateGrade } from '../utils'; // Make sure these are in your utils file
import { Award, TrendingUp, Book, Printer, FileText, X } from 'lucide-react';
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


interface AcademicRecordsProps {
  student: Student;
  examRecords: ExamRecord[];
}

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


const AcademicRecords: React.FC<AcademicRecordsProps> = ({ student, examRecords = [] }) => {
  const [showAdmitCard, setShowAdmitCard] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);

  // --- Calculate Stats using useMemo for performance ---
  const stats = useMemo(() => {
    if (examRecords.length === 0) {
      return { overallPercentage: 0, examsTaken: 0, bestSubject: 'N/A' };
    }

    const totalPercentage = examRecords.reduce((sum, exam) => sum + exam.percentage, 0);
    const overallPercentage = totalPercentage / examRecords.length;

    const allSubjectMarks: { [subject: string]: { total: number, count: number } } = {};
    examRecords.forEach(exam => {
      exam.subjects.forEach(subject => {
        if (!allSubjectMarks[subject.subject]) {
          allSubjectMarks[subject.subject] = { total: 0, count: 0 };
        }
        allSubjectMarks[subject.subject].total += (subject.obtainedMarks / subject.maxMarks) * 100;
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

    return {
      overallPercentage,
      examsTaken: examRecords.length,
      bestSubject,
    };
  }, [examRecords]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Academic Records</h1>
            <p className="text-gray-600 mt-1">View results and print your admit card.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdmitCard(true)}
          className="mt-4 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg"
        >
          <FileText size={18} className="mr-2" />
          View / Print Admit Card
        </button>
      </div>

      {/* --- RESPONSIVE FIX: Stats cards now stack on mobile --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border">
          <p className="text-sm font-medium text-gray-600">Overall Percentage</p>
          <p className="text-3xl font-bold text-green-600">{stats.overallPercentage.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border">
          <p className="text-sm font-medium text-gray-600">Exams Appeared</p>
          <p className="text-3xl font-bold text-blue-600">{stats.examsTaken}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border">
          <p className="text-sm font-medium text-gray-600">Best Subject</p>
          <p className="text-3xl font-bold text-purple-600">{stats.bestSubject}</p>
        </div>
      </div>

      {/* --- RESPONSIVE FIX: Table layout adjusted for mobile --- */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Exam-wise Performance</h3>
        </div>
        
        {/* --- On small screens, we show a card list. On medium screens and up, we show a table. --- */}
        <div className="divide-y divide-gray-200">
          {examRecords.length > 0 ? examRecords.map(exam => (
            <div key={exam.id} className="p-4 md:hidden"> {/* This view is for mobile (hidden on md and up) */}
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-800">{exam.examType}</p>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getGradeColor(exam.grade)}`}>
                  {exam.grade}
                </span>
              </div>
              <p className="text-sm text-gray-500">Date: {formatDate(exam.examDate)}</p>
              <p className="text-sm text-gray-500">Score: <span className="font-bold">{exam.obtainedMarks}/{exam.totalMarks}</span> ({exam.percentage.toFixed(1)}%)</p>
              <button
                onClick={() => setSelectedExam(exam)}
                className="mt-3 w-full px-3 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-lg hover:bg-blue-200"
              >
                View Subject Details
              </button>
            </div>
          )) : (
            <div className="p-8 text-center text-gray-500 md:hidden">No exam records to display.</div>
          )}
        </div>
        
        {/* This table is hidden on mobile and appears on medium screens and up */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            {/* ... The table head `<thead>` remains the same ... */}
            <tbody className="divide-y">
              {examRecords.length > 0 ? examRecords.map(exam => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{exam.examType}</td>
                  <td className="p-4">{formatDate(exam.examDate)}</td>
                  <td className="p-4 text-right font-semibold">{exam.percentage.toFixed(2)}%</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getGradeColor(exam.grade)}`}>
                      {exam.grade}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedExam(exam)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-lg hover:bg-blue-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center p-8 text-gray-500">No exam records to display.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExamDetailsModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
      <AdmitCardModal 
        isOpen={showAdmitCard}
        onClose={() => setShowAdmitCard(false)}
        student={student}
      />
    </div>
  );
};

export default AcademicRecords;