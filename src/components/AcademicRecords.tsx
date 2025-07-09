import React, { useState } from 'react';
import { ExamRecord } from '../types';
import { FileText, TrendingUp, Award, Download, BookOpen, Star } from 'lucide-react';

interface AcademicRecordsProps {
  examRecords: ExamRecord[];
}

const AcademicRecords: React.FC<AcademicRecordsProps> = ({ examRecords }) => {
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [showReportCard, setShowReportCard] = useState(false);

  const calculateAverage = (records: ExamRecord[]) => {
    if (records.length === 0) return 0;
    return records.reduce((sum, exam) => sum + (exam.percentage || 0), 0) / records.length;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  const handleViewReportCard = (exam: ExamRecord) => {
    setSelectedExam(exam);
    setShowReportCard(true);
  };

  const calculateSubjectAverage = () => {
    if (!examRecords.length) return {};
    
    const subjectTotals: Record<string, { total: number; count: number }> = {};
    
    examRecords.forEach(exam => {
      if (exam.subjectMarks) {
        exam.subjectMarks.forEach(subject => {
          if (!subjectTotals[subject.subject]) {
            subjectTotals[subject.subject] = { total: 0, count: 0 };
          }
          subjectTotals[subject.subject].total += (subject.obtained_marks / subject.max_marks * 100);
          subjectTotals[subject.subject].count += 1;
        });
      }
    });
    
    return subjectTotals;
  };

  const subjectAverages = calculateSubjectAverage();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Average</p>
              <p className="text-2xl font-bold text-blue-600">
                {calculateAverage(examRecords).toFixed(1)}%
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
              <p className="text-2xl font-bold text-green-600">{examRecords.length}</p>
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
                {examRecords.length > 0 ? Math.max(...examRecords.map(exam => exam.percentage || 0)).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Award size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Performance */}
      {Object.keys(subjectAverages).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(subjectAverages).map(([subject, data]) => (
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
      )}

      {/* Exam Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Exam Records</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Details
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {examRecords.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{exam.examName}</div>
                    <div className="text-sm text-gray-500">{exam.semester}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {exam.obtainedMarks}/{exam.maxMarks}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {(exam.percentage || 0).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(exam.grade)}`}>
                      {exam.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(exam.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewReportCard(exam)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 text-xs"
                    >
                      <FileText size={14} />
                      <span>View Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Card Modal */}
      {showReportCard && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="Marudhar Defence Educational Group" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Report Card</h2>
                  <p className="text-sm text-gray-600">Marudhar Defence Educational Group</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportCard(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Exam Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedExam.examName}</h3>
                    <p className="text-blue-100">Date: {new Date(selectedExam.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{(selectedExam.percentage || 0).toFixed(1)}%</p>
                    <p className="text-blue-100">Overall Grade: {selectedExam.grade}</p>
                  </div>
                </div>
              </div>

              {/* Subject-wise Marks */}
              {selectedExam.subjectMarks && selectedExam.subjectMarks.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen size={20} className="mr-2 text-blue-500" />
                    Subject-wise Performance
                  </h4>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Max Marks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Obtained Marks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedExam.subjectMarks.map((subject, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{subject.subject}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{subject.max_marks}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{subject.obtained_marks}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-blue-600">
                                {((subject.obtained_marks / subject.max_marks) * 100).toFixed(1)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(subject.grade)}`}>
                                {subject.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Co-Scholastic Activities */}
              {selectedExam.coScholasticMarks && selectedExam.coScholasticMarks.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star size={20} className="mr-2 text-purple-500" />
                    Co-Scholastic Activities
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedExam.coScholasticMarks.map((activity, index) => (
                      <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-medium text-gray-900">{activity.activity}</h5>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getGradeColor(activity.grade)}`}>
                          {activity.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Exam Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Marks</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedExam.maxMarks}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Obtained Marks</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedExam.obtainedMarks}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Overall Grade</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedExam.grade}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => setShowReportCard(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicRecords;