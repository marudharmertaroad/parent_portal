import React, { useState } from 'react';
import { Homework } from '../types';
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle, FileText, Download, ExternalLink } from 'lucide-react';

interface HomeworkSectionProps {
  homework: Homework[];
}

const HomeworkSection: React.FC<HomeworkSectionProps> = ({ homework }) => {
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const handleViewDetails = (hw: Homework) => {
    setSelectedHomework(hw);
    setShowDetailsModal(true);
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
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-blue-600">{homework.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <BookOpen size={24} className="text-blue-600" />
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
                      
                      <p className="text-gray-700 mb-3 leading-relaxed line-clamp-2">{hw.description}</p>
                      
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
                            <ExternalLink size={12} className="ml-1" />
                          </a>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Assigned: {new Date(hw.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => handleViewDetails(hw)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                      >
                        <FileText size={16} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedHomework.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <BookOpen size={14} className="mr-1" />
                    {selectedHomework.subject}
                  </span>
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Due: {new Date(selectedHomework.due_date).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Assignment Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{selectedHomework.description}</p>
                </div>
              </div>
              
              {selectedHomework.attachment_url && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Attachment</h4>
                  <a
                    href={selectedHomework.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FileText size={16} className="mr-2" />
                    Open Assignment File
                    <ExternalLink size={14} className="ml-2" />
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedHomework.status)}`}>
                    {getStatusIcon(selectedHomework.status)}
                    <span className="ml-1 capitalize">{selectedHomework.status}</span>
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Assigned Date</h4>
                  <p className="text-gray-600">{new Date(selectedHomework.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkSection;