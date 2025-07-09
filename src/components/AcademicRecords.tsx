import React from 'react';
import { ExamRecord } from '../types';
import { FileText } from 'lucide-react';
import { getGradeColor } from '../utils'; // Assuming this function exists in utils

const AcademicRecords: React.FC<{ examRecords: ExamRecord[] }> = ({ examRecords }) => (
  <div className="bg-white rounded-xl shadow-md border p-6">
    <h2 className="text-2xl font-bold mb-4">Exam Results</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3">Exam Name</th>
            <th className="p-3">Date</th>
            <th className="p-3">Marks</th>
            <th className="p-3">Percentage</th>
            <th className="p-3">Grade</th>
          </tr>
        </thead>
        <tbody>
          {examRecords.map(exam => (
            <tr key={exam.id} className="border-b">
              <td className="p-3 font-medium">{exam.examType}</td>
              <td className="p-3">{new Date(exam.examDate).toLocaleDateString('en-IN')}</td>
              <td className="p-3">{exam.obtainedMarks} / {exam.totalMarks}</td>
              <td className="p-3">{exam.percentage.toFixed(1)}%</td>
              <td className="p-3">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getGradeColor(exam.grade)}`}>
                  {exam.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AcademicRecords;