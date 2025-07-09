import React, { useState } from 'react';
import { Homework } from '../types';
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle, Upload, FileText, Download } from 'lucide-react';

interface HomeworkSectionProps {
  homework: Homework[];
  onSubmitHomework: (homeworkId: string, file: File) => Promise<any>;
}

const HomeworkSection: React.FC<HomeworkSectionProps> = ({ homework, onSubmitHomework }) => {
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'overdue':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const pendingCount = homework.filter(hw => hw.status === 'pending').length;
  const overdueCount = homework.filter(hw => hw.status === 'overdue').length;
  const submittedCount = homework.filter(hw => hw.status === 'submitted').length;

  const handleSubmission = (hw: Homework) => {
    setSelectedHomework(hw);
    setShowSubmissionModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG)');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedHomework || !selectedFile) return;

    setIsSubmitting(true);
    try {
      const response = await onSubmitHomework(selectedHomework.id.toString(), selectedFile);
      
      if (response.success) {
        alert(`Homework submitted successfully for ${selectedHomework.subject}! Submission ID: ${response.data?.submissionId}`);
        setShowSubmissionModal(false);
        setSelectedHomework(null);
        setSelectedFile(null);
      } else {
        alert(`Submission failed: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
          {homework.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No homework assignments available</p>
              <p className="text-gray-400 text-sm">Check back later for new assignments</p>
            </div>
          ) : (
            homework.map((hw) => {
              const daysUntilDue = getDaysUntilDue(hw.due_date);
              const isUrgent = daysUntilDue <= 2 && daysUntilDue >= 0;
              
              return (
                <div key={hw.id} className={`p-6 hover:bg-gray-50 transition-colors ${isUrgent ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{hw.title}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(hw.status)}`}>
                          {getStatusIcon(hw.status)}
                          <span className="ml-1 capitalize">{hw.status}</span>
                        </span>
                        {isUrgent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <AlertCircle size={12} className="mr-1" />
                            Urgent
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <BookOpen size={14} className="mr-1" />
                          {hw.subject}
                        </span>
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Due: {new Date(hw.due_date).toLocaleDateString('en-IN')}
                        </span>
                        {!isOverdue(hw.due_date) && hw.status !== 'submitted' && (
                          <span className={`flex items-center ${daysUntilDue <= 1 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                            <Clock size={14} className="mr-1" />
                            {daysUntilDue === 0 ? 'Due today' : daysUntilDue === 1 ? 'Due tomorrow' : `${daysUntilDue} days left`}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3 leading-relaxed">{hw.description}</p>
                      
                      {hw.attachment_url && (
                        <div className="mb-3">
                          <a
                            href={hw.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                          >
                            <FileText size={14} className="mr-1" />
                            View Assignment File
                            <Download size={12} className="ml-1" />
                          </a>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Assigned: {new Date(hw.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {hw.status === 'pending' || hw.status === 'overdue' ? (
                        <button
                          onClick={() => handleSubmission(hw)}
                          className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                            hw.status === 'overdue' 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
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
              );
            })
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload size={20} className="mr-2 text-blue-500" />
              Submit Homework
            </h3>
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
                <p className={`font-medium ${isOverdue(selectedHomework.due_date) ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(selectedHomework.due_date).toLocaleDateString('en-IN')}
                  {isOverdue(selectedHomework.due_date) && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">OVERDUE</span>
                  )}
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    {selectedFile ? (
                      <span className="text-blue-600 font-medium">{selectedFile.name}</span>
                    ) : (
                      'Click to upload or drag and drop'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB
                  </p>
                </label>
              </div>
              
              {selectedFile && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-blue-600" />
                      <span className="text-sm text-blue-800">{selectedFile.name}</span>
                    </div>
                    <span className="text-xs text-blue-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
              
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