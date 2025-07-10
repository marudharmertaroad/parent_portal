// src/components/AcademicRecords.tsx

import React, { useState, useMemo } from 'react';
import { ExamRecord, SubjectMark } from '../types';
import { formatDate, getGradeColor, calculateGrade } from '../utils'; // Make sure these are in your utils file
import { Award, TrendingUp, Book, FileText, X } from 'lucide-react';

interface AcademicRecordsProps {
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


const AcademicRecords: React.FC<AcademicRecordsProps> = ({ examRecords = [] }) => {
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
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Award className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-800">Academic Records</h1>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border">
          <p className="text-sm font-medium text-gray-600">Overall Percentage</p>
          <p className="text-3xl font-bold text-green-600">{stats.overallPercentage.toFixed(2)}%</p>
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

      {/* Detailed Exam Records Table */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Exam-wise Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-medium text-sm">Exam Name</th>
                <th className="p-4 font-medium text-sm">Date</th>
                <th className="p-4 font-medium text-sm text-right">Percentage</th>
                <th className="p-4 font-medium text-sm text-center">Grade</th>
                <th className="p-4 font-medium text-sm text-center">Action</th>
              </tr>
            </thead>
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
    </div>
  );
};

export default AcademicRecords;