import React, { useState } from 'react';
import { ExamRecord } from '../types';
import { FileText, TrendingUp, Award, Download } from 'lucide-react';

interface AcademicRecordsProps {
  examRecords: ExamRecord[];
}

const AcademicRecords: React.FC<AcademicRecordsProps> = ({ examRecords }) => {
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  const semesters = [...new Set(examRecords.map(exam => exam.semester))];
  const filteredRecords = selectedSemester === 'all' 
    ? examRecords 
    : examRecords.filter(exam => exam.semester === selectedSemester);

  const calculateAverage = (records: ExamRecord[]) => {
    if (records.length === 0) return 0;
    return records.reduce((sum, exam) => sum + (exam.obtainedMarks / exam.maxMarks * 100), 0) / records.length;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'text-green-600 bg-green-100';
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B+':
        return 'text-blue-600 bg-blue-100';
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C+':
        return 'text-yellow-600 bg-yellow-100';
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  const subjectWiseAverage = filteredRecords.reduce((acc, exam) => {
    if (!acc[exam.subject]) {
      acc[exam.subject] = { total: 0, count: 0 };
    }
    acc[exam.subject].total += (exam.obtainedMarks / exam.maxMarks * 100);
    acc[exam.subject].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Average</p>
              <p className="text-2xl font-bold text-blue-600">
                {calculateAverage(filteredRecords).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-green-600">{filteredRecords.length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FileText size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Highest Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.max(...filteredRecords.map(exam => exam.obtainedMarks / exam.maxMarks * 100)).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Award size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Academic Records</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Semesters</option>
              {semesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
              <Download size={16} />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subject-wise Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(subjectWiseAverage).map(([subject, data]) => (
            <div key={subject} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{subject}</h4>
              <p className="text-2xl font-bold text-blue-600">
                {(data.total / data.count).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">{data.count} exam(s)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Records</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{exam.examName}</div>
                    <div className="text-sm text-gray-500">{exam.semester}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{exam.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {exam.obtainedMarks}/{exam.maxMarks}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {((exam.obtainedMarks / exam.maxMarks) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(exam.grade)}`}>
                      {exam.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(exam.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AcademicRecords;