import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '/src/lib/supabase'; // Using your correct import path
import { Homework } from '../types';
import { BookOpen, Calendar, Clock, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils'; // Make sure you have this utility

interface HomeworkSectionProps {
  student: {
    class: string;
    medium: string;
  };
}


const HomeworkSection: React.FC<HomeworkSectionProps> = ({ student }) => {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomework = useCallback(async () => {
    if (!student.class || !student.medium) {
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('homework_assignments')
        .select('*')
        .eq('class', student.class)
        .eq('medium', student.medium)
        .eq('is_active', true)
        .order('due_date', { ascending: true }); // Order by due date

      if (fetchError) throw fetchError;

      setHomeworkList(data || []);
    } catch (err: any) {
      console.error("Error fetching homework:", err);
      setError("Could not load homework assignments. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [student.class, student.medium]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);
  
  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }


  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-green-600">{submittedCount}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen size={20} className="mr-2 text-blue-500" />
            Homework Assignments
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {homework.map((hw) => (
            <div key={hw.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{hw.title}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(hw.status)}`}>
                      {getStatusIcon(hw.status)}
                      <span className="ml-1 capitalize">{hw.status}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <BookOpen size={14} className="mr-1" />
                      {hw.subject}
                    </span>
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Due: {new Date(hw.dueDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{hw.description}</p>
                  
                  {hw.status === 'submitted' && hw.submissionDate && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Submitted:</strong> {new Date(hw.submissionDate).toLocaleDateString('en-IN')}
                      </p>
                      {hw.teacherComments && (
                        <p className="text-sm text-green-800 mt-1">
                          <strong>Teacher Comments:</strong> {hw.teacherComments}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  {hw.status === 'pending' || hw.status === 'overdue' ? (
                    <button
                      onClick={() => handleSubmission(hw)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Upload size={16} />
                      <span>Submit</span>
                    </button>
                  ) : (
                    <div className="text-green-600 font-medium flex items-center space-x-2">
                      <CheckCircle size={16} />
                      <span>Submitted</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Homework</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Subject</p>
                <p className="font-medium text-gray-900">{selectedHomework.subject}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Assignment</p>
                <p className="font-medium text-gray-900">{selectedHomework.title}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedHomework.dueDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                </label>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowSubmissionModal(false);
                    setSelectedFile(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkSection;