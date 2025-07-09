import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, FileText, Printer, Eye, Filter, Download, BookOpen,
  Trophy, Users, TrendingUp, FileSpreadsheet, Calendar, Award, Trash, ChevronDown,
  Settings, Edit3, Save, X, BookCopy
} from 'lucide-react';
import { calculateGrade, formatDate, getGradeColor } from '/src/utils/index.ts';
import { ExamRecord, SubjectMark, Student } from '../types'; 
import { supabase } from '../utils/supabaseClient';
import { useMedium } from '../context/MediumContext';
import { useClassOptions } from '../hooks/useClassOptions';
import { ALL_SUBJECTS } from '../utils/curriculum';
import { getSubjectsForClass } from '../utils/curriculum';




// Enhanced interfaces for multi-exam support
interface EnhancedExamRecord extends ExamRecord {
  academicYear: string;
}

interface StudentExamHistory {
  studentId: string;
  studentName: string;
  class: string; // MODIFIED: Class is now a string
  section: string;
  rollNumber: string;
  fatherName: string;
  motherName?: string;
  dateOfBirth?: string;
  exams: EnhancedExamRecord[];
  overallPerformance: {
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
    result: 'PASS' | 'FAIL';
  };
}

interface ExamCellProps {
  students: Student[];
  loadingStudents: boolean;
}
const SubjectManagerModal = ({ isOpen, onClose, classOptions, medium }: any) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [checkedSubjects, setCheckedSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAndSetSubjects = async () => {
      if (!selectedClass || !medium) {
        setCheckedSubjects([]); // Use the correct setter
        return;
      }
      setIsLoading(true);
      const savedSubjects = await getSubjectsForClass(selectedClass, medium);
      // THIS IS THE FIX: Use the correct state setter function
      setCheckedSubjects(savedSubjects); 
      setIsLoading(false);
    };

    fetchAndSetSubjects();
  }, [selectedClass, medium]);

  const handleCheckboxChange = (subject: string, isChecked: boolean) => {
    if (isChecked) {
      // Add the subject to the array if it's not already there
      setCheckedSubjects(prev => [...prev, subject]);
    } else {
      // Remove the subject from the array
      setCheckedSubjects(prev => prev.filter(s => s !== subject));
    }
  };


  const handleSaveSubjects = async () => {
    if (!selectedClass || !medium) return;
    setIsLoading(true);
        const { error } = await supabase
      .from('curriculum')
      .upsert(
        { class_name: selectedClass, medium: medium, subjects: checkedSubjects }, 
        { onConflict: 'class_name,medium' }
      );

    setIsLoading(false);
    if (error) {
      alert("Error saving subjects: " + error.message);
    } else {
      alert(`Subjects for Class ${selectedClass} (${medium} Medium) updated successfully!`);
      onClose();
    }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
        <h3 className="text-2xl font-bold mb-4">Edit Subjects by Class</h3>
        <p className="text-gray-600 mb-6">Select a class to view or edit its list of subjects for the {medium} Medium portal.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Select Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
              <option value="">-- Select a class --</option>
              {classOptions.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          {selectedClass && (
            <div>
              <label className="block text-sm font-semibold mb-2">Select Subjects</label>
              {isLoading ? (
                <p className="text-gray-500">Loading subjects...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {ALL_SUBJECTS.map(subject => (
                    <label key={subject} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={checkedSubjects.includes(subject)}
                        onChange={(e) => handleCheckboxChange(subject, e.target.checked)}
                      />
                      <span className="font-medium text-gray-800">{subject}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSaveSubjects} disabled={isLoading || !selectedClass} className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save Subjects'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ExamCell: React.FC<ExamCellProps> = ({ students, loadingStudents }) => {
  const { medium } = useMedium();
    const classOptions = useClassOptions();
const [showSubjectManager, setShowSubjectManager] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-25');
  
  const [examRecords, setExamRecords] = useState<EnhancedExamRecord[]>([]);
  const [studentExamHistories, setStudentExamHistories] = useState<StudentExamHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<StudentExamHistory | null>(null);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showExcelExportModal, setShowExcelExportModal] = useState(false);
  const [showReportCustomizer, setShowReportCustomizer] = useState(false);
  


  // Report customization settings
  const [reportSettings, setReportSettings] = useState({
    schoolName: 'MARUDHAR DEFENCE SCHOOL',
    schoolAddress: 'Merta Road, Nagaur, Rajasthan - 341511',
    schoolPhone: '+91-9610983800',
    schoolEmail: 'info@mds.edu.in',
    principalName: 'Principal Name',
    session: '2024-25',
    showPhoto: true,
    showGrades: true,
    showRemarks: true,
    gradeSystem: 'A+_to_F',
    passingMarks: 35,
    maxMarksPerSubject: 100
  });

  const examTypes = ['Unit Test 1', 'Unit Test 2', 'Unit Test 3', 'Quarterly', 'Half Yearly', 'Yearly Exam', 'Pre-Board'];
  
  const fetchExamData = useCallback(async () => {
    if (!medium) {
      setExamRecords([]);
      setStudentExamHistories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    
    const { data: recordsData, error: recordsError } = await supabase
    .from('exam_records')
    .select(`
      id, exam_type, exam_date, total_marks, obtained_marks, percentage, grade,
      students!inner(sr_no, name, class, father_name, mother_name, dob, medium),
      subject_marks ( subject, max_marks, obtained_marks, grade )
    `)
    .eq('students.medium', medium) // Now this filter will work correctly
    .order('exam_date', { ascending: false });

  if (recordsError) {
    console.error('Error fetching exam records:', recordsError);
    setLoading(false);
    return;
  }

    const transformedRecords = recordsData.map((record: any) => ({
      id: record.id,
      studentId: record.students.sr_no,
      studentName: record.students.name,
      class: record.students.class,
      rollNumber: record.students.sr_no,
      fatherName: record.students.father_name,
      motherName: record.students.mother_name,
      dateOfBirth: record.students.dob,
      examType: record.exam_type,
      examDate: record.exam_date,
      subjects: record.subject_marks.map((sm: any) => ({
        subject: sm.subject,
        maxMarks: sm.max_marks,
        obtainedMarks: sm.obtained_marks,
        grade: sm.grade
      })),
      totalMarks: record.total_marks,
      obtainedMarks: record.obtained_marks,
      percentage: record.percentage,
      grade: record.grade,
      academicYear: selectedAcademicYear
    }));
    
    setExamRecords(transformedRecords);

    const studentHistories = groupExamsByStudent(transformedRecords);
    setStudentExamHistories(studentHistories);
    
    setLoading(false);
  }, [selectedAcademicYear, medium]);

  const groupExamsByStudent = (records: EnhancedExamRecord[]): StudentExamHistory[] => {
    const grouped = records.reduce((acc: Record<string, any>, record) => {
      if (!acc[record.studentId]) {
        acc[record.studentId] = {
          studentId: record.studentId,
          studentName: record.studentName,
          class: record.class,
          rollNumber: record.rollNumber,
          fatherName: record.fatherName,
          motherName: record.motherName,
          dateOfBirth: record.dateOfBirth,
          exams: []
        };
      }
      
      acc[record.studentId].exams.push(record);
      return acc;
    }, {});
    
     return Object.values(grouped).map(student => {
      const exams: EnhancedExamRecord[] = student.exams || [];
      
      const allMarks = exams.reduce((total, exam) => total + (exam.obtainedMarks || 0), 0);
      const allMaxMarks = exams.reduce((total, exam) => total + (exam.totalMarks || 0), 0);
      const overallPercentage = allMaxMarks > 0 ? (allMarks / allMaxMarks) * 100 : 0;
      
      return {
        ...student,
        overallPerformance: {
          totalMarks: allMaxMarks,
          obtainedMarks: allMarks,
          percentage: overallPercentage,
          grade: calculateGrade(overallPercentage),
          result: overallPercentage >= reportSettings.passingMarks ? 'PASS' : 'FAIL'
        }
      } as StudentExamHistory;
    });
};

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  const filteredHistories = studentExamHistories.filter(history => {
    const matchesSearch = history.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (history.class && history.class.includes(searchTerm));
    const matchesClass = selectedClass === 'all' || (history.class && history.class === selectedClass);
    
    // No need to filter by medium here anymore. The data is pre-filtered.
    return matchesSearch && matchesClass;
  });

  const EnhancedReportCardModal = () => {
    if (!selectedStudentHistory) return null;
    const handlePrint = () => window.print();
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-auto shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 no-print">
              <h3 className="text-xl font-bold text-gray-800">Enhanced Report Card</h3>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowReportCustomizer(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Settings className="w-4 h-4 mr-2" />Customize
                </button>
                <button 
                  onClick={handlePrint} 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4 mr-2" />Print
                </button>
                <button 
                  onClick={() => setShowReportCardModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="border-2 border-blue-600 p-8 bg-white print:border-0 print:p-0 rounded-xl" id="report-card">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-6">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-blue-800">{reportSettings.schoolName}</h1>
                    <p className="text-gray-600 text-lg">Excellence in Education & Character</p>
                    <p className="text-sm text-gray-500">{reportSettings.schoolAddress}</p>
                    <p className="text-sm text-gray-500">Phone: {reportSettings.schoolPhone} | Email: {reportSettings.schoolEmail}</p>
                  </div>
                </div>
                
                {reportSettings.showPhoto && (
                  <div className="w-24 h-32 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-400">
                      <Users className="w-8 h-8 mx-auto mb-1" />
                      <span className="text-xs">Student Photo</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t-2 border-b-2 border-blue-600 py-4 mb-6 bg-blue-50">
                <h2 className="text-2xl font-bold text-center text-blue-800">PROGRESS REPORT</h2>
                <p className="text-center text-lg mt-2 text-blue-600">Academic Session: {reportSettings.session}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold text-lg mb-4 text-blue-800">Student Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedStudentHistory.studentName}</p>
                    <p><strong>Class:</strong> {selectedStudentHistory.class}{selectedStudentHistory.section ? `-${selectedStudentHistory.section}` : ''}</p>
                    <p><strong>Roll Number:</strong> {selectedStudentHistory.rollNumber}</p>
                    <p><strong>Father's Name:</strong> {selectedStudentHistory.fatherName}</p>
                    {selectedStudentHistory.motherName && <p><strong>Mother's Name:</strong> {selectedStudentHistory.motherName}</p>}
                    {selectedStudentHistory.dateOfBirth && <p><strong>Date of Birth:</strong> {formatDate(selectedStudentHistory.dateOfBirth)}</p>}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-lg mb-4 text-green-800">Overall Performance</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Marks:</strong> {selectedStudentHistory.overallPerformance.totalMarks}</p>
                    <p><strong>Marks Obtained:</strong> {selectedStudentHistory.overallPerformance.obtainedMarks}</p>
                    <p><strong>Percentage:</strong> {selectedStudentHistory.overallPerformance.percentage.toFixed(2)}%</p>
                    <p className="flex items-center"><strong>Overall Grade:</strong> <span className={`ml-2 inline-flex px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(selectedStudentHistory.overallPerformance.grade)}`}>{selectedStudentHistory.overallPerformance.grade}</span></p>
                    <p className="flex items-center"><strong>Result:</strong><span className={`ml-2 inline-flex px-3 py-1 rounded-full text-sm font-bold ${selectedStudentHistory.overallPerformance.result === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{selectedStudentHistory.overallPerformance.result}</span></p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-blue-800">Academic Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-400 text-sm">
                    <thead>
                      <tr className="bg-blue-100">
                        <th rowSpan={2} className="border border-gray-400 p-2 text-center font-bold">Subject Name</th>
                        <th rowSpan={2} className="border border-gray-400 p-2 text-center font-bold">Max Marks</th>
                        {selectedStudentHistory.exams.map(exam => (
                      <th key={exam.id} colSpan={2} className="border border-gray-400 p-2 text-center font-bold bg-blue-200">
                        {exam.examType}
                      </th>
                    ))}
                    <th colSpan={3} className="border border-gray-400 p-2 text-center font-bold bg-green-200">Total</th>
                  </tr>
                  <tr className="bg-blue-50">
                    {/* UPDATED: Dynamically create sub-headers for each recorded exam */}
                    {selectedStudentHistory.exams.map(exam => (
                      <React.Fragment key={exam.id}>
                        <th className="border border-gray-400 p-1 text-center text-xs">Marks</th>
                        <th className="border border-gray-400 p-1 text-center text-xs">Grade</th>
                      </React.Fragment>
                    ))}
                    <th className="border border-gray-400 p-1 text-center text-xs bg-green-100">Marks</th>
                    <th className="border border-gray-400 p-1 text-center text-xs bg-green-100">Grade</th>
                    <th className="border border-gray-400 p-1 text-center text-xs bg-green-100">%</th>
                  </tr>
                </thead>
                    <tbody>
                      {(() => {
                        const allSubjects = new Set<string>();
                        Object.values(selectedStudentHistory.exams).forEach(exam => {
                          exam?.subjects.forEach(subject => allSubjects.add(subject.subject));
                        });
                        
                        return Array.from(allSubjects).map(subjectName => {
                          let totalObtained = 0;
                          let totalMaxMarks = 0;
                          
                          return (
                            <tr key={subjectName} className="hover:bg-gray-50">
                              <td className="border border-gray-400 p-2 font-medium">{subjectName}</td>
                              <td className="border border-gray-400 p-2 text-center">{reportSettings.maxMarksPerSubject}</td>
                              
                              {selectedStudentHistory.exams.map(exam => {
            const subject = exam.subjects.find(s => s.subject === subjectName);
            
            if (subject) {
              // Add to the total for the final 'Total' column
              totalObtained += subject.obtainedMarks;
              totalMaxMarks += subject.maxMarks;
              
              return (
                <React.Fragment key={exam.id}>
                  <td className="border border-gray-400 p-1 text-center">{subject.obtainedMarks}</td>
                  <td className="border border-gray-400 p-1 text-center">
                    <span className={`px-1 py-0.5 rounded text-xs ${getGradeColor(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </td>
                </React.Fragment>
              );
            } else {
              // If the student didn't take this subject in this exam, show placeholders.
              return (
                <React.Fragment key={exam.id}>
                  <td className="border border-gray-400 p-1 text-center text-gray-400">-</td>
                  <td className="border border-gray-400 p-1 text-center text-gray-400">-</td>
                </React.Fragment>
              );
            }
          })}
          
          {/* The "Total" column calculation */}
          <td className="border border-gray-400 p-1 text-center font-bold bg-green-50">{totalObtained}</td>
          <td className="border border-gray-400 p-1 text-center bg-green-50">
            <span className={`px-1 py-0.5 rounded text-xs font-bold ${getGradeColor(calculateGrade((totalObtained / totalMaxMarks) * 100))}`}>
              {calculateGrade((totalObtained / totalMaxMarks) * 100)}
            </span>
          </td>
          <td className="border border-gray-400 p-1 text-center font-bold bg-green-50">
            {totalMaxMarks > 0 ? ((totalObtained / totalMaxMarks) * 100).toFixed(1) : 0}%
          </td>
        </tr>
      );
    });
  })()}
  
  {/* The Total Row at the bottom */}
  <tr className="bg-blue-100 font-bold">
    <td className="border border-gray-400 p-2">TOTAL</td>
    
    {/* --- FIX: Loop over the student's actual exams for the footer totals --- */}
    {selectedStudentHistory.exams.map(exam => (
      <React.Fragment key={exam.id}>
        <td className="border border-gray-400 p-1 text-center">{exam.obtainedMarks}</td>
        <td className="border border-gray-400 p-1 text-center">
          <span className={`px-1 py-0.5 rounded text-xs ${getGradeColor(exam.grade)}`}>
            {exam.grade}
          </span>
        </td>
      </React.Fragment>
    ))}

    {/* The Overall Total columns */}
    <td className="border border-gray-400 p-1 text-center bg-green-100">{selectedStudentHistory.overallPerformance.obtainedMarks}</td>
    <td className="border border-gray-400 p-1 text-center bg-green-100">
      <span className={`px-1 py-0.5 rounded text-xs ${getGradeColor(selectedStudentHistory.overallPerformance.grade)}`}>
        {selectedStudentHistory.overallPerformance.grade}
      </span>
    </td>
    <td className="border border-gray-400 p-1 text-center bg-green-100">{selectedStudentHistory.overallPerformance.percentage.toFixed(1)}%</td>
  </tr>
</tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                {reportSettings.showGrades && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-bold mb-4 text-gray-800">Grading Scale</h4>
                    <div className="text-sm space-y-1">
                      <p>A+ : 95% & above (Outstanding)</p>
                      <p>A  : 85-94% (Excellent)</p>
                      <p>B+ : 75-84% (Very Good)</p>
                      <p>B  : 65-74% (Good)</p>
                      <p>C+ : 55-64% (Satisfactory)</p>
                      <p>C  : 45-54% (Acceptable)</p>
                      <p>D  : 35-44% (Needs Improvement)</p>
                      <p>F  : Below 35% (Fail)</p>
                    </div>
                  </div>
                )}
                
                {reportSettings.showRemarks && (
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h4 className="font-bold mb-4 text-yellow-800">Teacher's Remarks</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Class Teacher:</p>
                        <div className="border-b border-gray-400 w-full h-8 mt-2"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Subject Teacher:</p>
                        <div className="border-b border-gray-400 w-full h-8 mt-2"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-end pt-8 border-t border-gray-300">
                <div>
                  <div className="border-t border-gray-400 w-40 mb-2"></div>
                  <p className="text-sm font-medium">Class Teacher</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-400 w-40 mb-2"></div>
                  <p className="text-sm font-medium">Principal</p>
                  <p className="text-xs text-gray-600">{reportSettings.principalName}</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-400 w-40 mb-2"></div>
                  <p className="text-sm font-medium">Parent's Signature</p>
                </div>
              </div>
              
              <div className="mt-8 text-center text-xs text-gray-500">
                <p>This is a computer generated report card. For any queries, contact the examination cell.</p>
                <p className="mt-1">Generated on: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
 const ReportCustomizerModal = () => {
    if (!showReportCustomizer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Customize Report Card</h3>
              <button 
                onClick={() => setShowReportCustomizer(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* School Information */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-3">School Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                    <input
                      type="text"
                      value={reportSettings.schoolName}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={reportSettings.schoolAddress}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, schoolAddress: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={reportSettings.schoolPhone}
                        onChange={(e) => setReportSettings(prev => ({ ...prev, schoolPhone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={reportSettings.schoolEmail}
                        onChange={(e) => setReportSettings(prev => ({ ...prev, schoolEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 mb-3">Display Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportSettings.showPhoto}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, showPhoto: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm">Show Student Photo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportSettings.showGrades}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, showGrades: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm">Show Grading Scale</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportSettings.showRemarks}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, showRemarks: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm">Show Teacher Remarks</span>
                  </label>
                </div>
              </div>

              {/* Academic Settings */}
              <div className="bg-yellow-50 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">Academic Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
                    <input
                      type="text"
                      value={reportSettings.session}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, session: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
                    <input
                      type="text"
                      value={reportSettings.principalName}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, principalName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks (%)</label>
                    <input
                      type="number"
                      value={reportSettings.passingMarks}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, passingMarks: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks per Subject</label>
                    <input
                      type="number"
                      value={reportSettings.maxMarksPerSubject}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, maxMarksPerSubject: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => setShowReportCustomizer(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowReportCustomizer(false)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddExamModal = () => {
    const [modalSelectedClass, setModalSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [examType, setExamType] = useState('Unit Test 1');
    const [subjects, setSubjects] = useState<SubjectMark[]>([]);
    
    const selectedStudent = students.find(s => s.srNo === selectedStudentId);
    const filteredStudentsForModal = students.filter(s => s.class === modalSelectedClass);
    
    useEffect(() => {
      const fetchSubjectsForStudent = async () => {
        if (selectedStudent && medium) {
          const classSubjects = await getSubjectsForClass(selectedStudent.class, medium);
          const initialMarks = classSubjects.map(subjectName => ({
            subject: subjectName, maxMarks: 100, obtainedMarks: 0, grade: 'F',
          }));
          setSubjects(initialMarks);
        } else {
          setSubjects([]);
        }
      };
      fetchSubjectsForStudent();
    }, [selectedStudent, medium]);

    const handleSubjectChange = (index: number, field: keyof SubjectMark, value: string | number) => {
        const newSubjects = [...subjects];
        const subjectToUpdate = { ...newSubjects[index] };
        (subjectToUpdate as any)[field] = value;
        const obtained = typeof subjectToUpdate.obtainedMarks === 'number' ? subjectToUpdate.obtainedMarks : 0;
        const max = typeof subjectToUpdate.maxMarks === 'number' && subjectToUpdate.maxMarks > 0 ? subjectToUpdate.maxMarks : 100;
        if (field === 'obtainedMarks' || field === 'maxMarks') {
            subjectToUpdate.grade = calculateGrade((obtained / max) * 100);
        }
        newSubjects[index] = subjectToUpdate;
        setSubjects(newSubjects);
    };

    const handleSubmit = async () => {
        if (!selectedStudentId) return alert("Please select a student.");
        if (subjects.length === 0) return alert("No subjects found for this class. Please configure them first.");

        try {
            const { data: existingRecord, error: checkError } = await supabase
              .from('exam_records').select('id').eq('student_id', selectedStudentId).eq('exam_type', examType).single();

            if (checkError && checkError.code !== 'PGRST116') throw checkError;
            if (existingRecord) {
                alert(`Error: An exam record with type '${examType}' already exists for this student.`);
                return;
            }

            const { data: studentData, error: studentError } = await supabase.from('students').select('id').eq('sr_no', selectedStudentId).eq('medium', medium).single();
            if (studentError || !studentData) throw new Error('Could not find the database record for the selected student.');
            
            const totalMarks = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
            const obtainedMarks = subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
            const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

            const recordToInsert = {
               student_primary_id: studentData.id, student_id: selectedStudentId, exam_type: examType,
               exam_date: new Date().toISOString().split('T')[0], total_marks: totalMarks, obtained_marks: obtainedMarks,
               percentage: percentage, grade: calculateGrade(percentage),
            };

            const { data: newRecord, error: recordError } = await supabase.from('exam_records').insert(recordToInsert).select().single();
            if (recordError || !newRecord) throw recordError || new Error("Failed to create exam record.");

            const subjectMarksToInsert = subjects.map(s => ({ exam_record_id: newRecord.id, subject: s.subject, max_marks: s.maxMarks, obtained_marks: s.obtainedMarks, grade: s.grade }));
            const { error: subjectsError } = await supabase.from('subject_marks').insert(subjectMarksToInsert);
            if (subjectsError) throw subjectsError;

            alert("Exam record added successfully!");
            setShowAddExamModal(false);
            fetchExamData();
        } catch (error: any) {
            alert("An error occurred: " + error.message);
            console.error("Error in handleSubmit:", error);
        }
    };

    if (!showAddExamModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col">
          <div className="p-8 border-b">
            <h3 className="text-2xl font-bold text-gray-800">Add Exam Record</h3>
          </div>

          <div className="p-8 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">1. Select Class *</label>
                    <select value={modalSelectedClass} onChange={(e) => { setModalSelectedClass(e.target.value); setSelectedStudentId(''); }} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Select a class --</option>
                        {classOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">2. Select Student *</label>
                    <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" disabled={!modalSelectedClass}>
                        <option value="">-- Select a student --</option>
                        {filteredStudentsForModal.map(student => <option key={student.srNo} value={student.srNo}>{student.name} (SR: {student.srNo})</option>)}
                    </select>
                </div>
            </div>
            
            {selectedStudentId && (
              <>
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">3. Exam Type *</label>
                  <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
                    {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">4. Enter Marks for "{selectedStudent?.name}"</h4>
                  {subjects.length > 0 ? (
                    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-32">Max Marks</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-40">Obtained Marks</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-24">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {subjects.map((subject, index) => (
                            <tr key={subject.subject} className="hover:bg-white">
                              <td className="px-6 py-2 font-medium text-gray-800">{subject.subject}</td>
                              <td className="px-6 py-2"><input type="number" value={subject.maxMarks} onChange={(e) => handleSubjectChange(index, 'maxMarks', parseInt(e.target.value) || 0)} className="w-full text-center p-2 border rounded-md"/></td>
                              <td className="px-6 py-2"><input type="number" value={subject.obtainedMarks} onChange={(e) => handleSubjectChange(index, 'obtainedMarks', parseInt(e.target.value) || 0)} className="w-full text-center p-2 border rounded-md"/></td>
                              <td className="px-6 py-2 text-center"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(subject.grade)}`}>{subject.grade}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="text-center py-10 text-gray-500">No subjects configured for this class.</p>}
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50 rounded-b-2xl">
            <button onClick={() => setShowAddExamModal(false)} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 font-medium">Cancel</button>
            <button onClick={handleSubmit} disabled={!selectedStudentId || subjects.length === 0} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50">
              <Save className="w-4 h-4 inline mr-2" />Save Exam Record
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const handleDeleteStudentHistory = async (studentId: string, studentName: string) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete all exam records for ${studentName} for the session ${selectedAcademicYear}? This action cannot be undone.`
    );
    if (!isConfirmed) return;

    const historyToDelete = studentExamHistories.find(h => h.studentId === studentId);
    if (!historyToDelete) {
      alert("Error: Could not find the student's records to delete.");
      return;
    }

    const recordIdsToDelete = Object.values(historyToDelete.exams)
      .filter(exam => exam != null)
      .map(exam => exam!.id);

    if (recordIdsToDelete.length === 0) {
      alert("This student has no exam records to delete.");
      return;
    }

    const { error } = await supabase.from('exam_records').delete().in('id', recordIdsToDelete);

    if (error) {
      console.error('Error deleting exam records:', error);
      alert(`Failed to delete records for ${studentName}. Please check the console for details.`);
    } else {
      alert(`Successfully deleted all records for ${studentName}.`);
      fetchExamData();
    }
  };

  if (loading || loadingStudents) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Exam Data...</div>
        </div>
      </div>
    );
  }

  const stats = {
    totalStudents: studentExamHistories.length,
    avgPercentage: studentExamHistories.length > 0 ? (studentExamHistories.reduce((sum, history) => sum + history.overallPerformance.percentage, 0) / studentExamHistories.length).toFixed(1) : '0',
    passedStudents: studentExamHistories.filter(history => history.overallPerformance.result === 'PASS').length,
    aPlusStudents: studentExamHistories.filter(history => history.overallPerformance.grade === 'A+').length,
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Exam Cell</h2>
            <p className="text-gray-600">Manage multi-period exams and generate comprehensive report cards</p>
          </div>
          <div className="mt-6 lg:mt-0 flex flex-wrap gap-3">
            <button onClick={() => setShowAddExamModal(true)} className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg">
              <Plus className="w-5 h-5 mr-2" />Add Exam Record
            </button>
            <button onClick={() => setShowExcelExportModal(true)} className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 font-medium shadow-lg">
              <FileSpreadsheet className="w-5 h-5 mr-2" />Export Excel
            </button>
            <button 
              onClick={() => setShowSubjectManager(true)}
              className="flex items-center px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 font-medium shadow-lg"
            >
              <BookCopy className="w-5 h-5 mr-2" />Edit Subjects
            </button>
            <button onClick={() => setShowReportCustomizer(true)} className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium shadow-lg">
              <Settings className="w-5 h-5 mr-2" />Customize Reports
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Percentage</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgPercentage}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">A+ Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.aPlusStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents > 0 ? ((stats.passedStudents / stats.totalStudents) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by student name or class..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)} 
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classes</option>
              {classOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select 
              value={selectedAcademicYear} 
              onChange={(e) => setSelectedAcademicYear(e.target.value)} 
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Performance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Result</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistories.map((history) => (
                <tr key={history.studentId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">{history.studentName.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{history.studentName}</div>
                        <div className="text-sm text-gray-500">Class {history.class}{history.section ? `-${history.section}`: ''} | Roll: {history.rollNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {history.exams.length} exam(s) recorded
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{history.overallPerformance.obtainedMarks}/{history.overallPerformance.totalMarks}</div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(history.overallPerformance.grade)}`}>
                        {history.overallPerformance.grade}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                        history.overallPerformance.result === 'PASS' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {history.overallPerformance.result}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => { setSelectedStudentHistory(history); setShowReportCardModal(true); }}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Enhanced Report Card"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudentHistory(history.studentId, history.studentName)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete All Records for this Student"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <SubjectManagerModal
        isOpen={showSubjectManager}
        onClose={() => setShowSubjectManager(false)}
        classOptions={classOptions}
        medium={medium}
      />
      {showReportCardModal && <EnhancedReportCardModal />}
      {showAddExamModal && <AddExamModal />}
      <ReportCustomizerModal />
    </div>
  );
};

export default ExamCell;