import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '/src/lib/supabase';
import { Homework } from '../types';
import { 
    BookOpen, Calendar, Clock, Link as LinkIcon, AlertCircle, FileText, 
    ExternalLink, Download, Eye // <-- ADD 'Eye' HERE
} from 'lucide-react';import { formatDate } from '../utils';

interface HomeworkSectionProps {
  student?: {
    class: string;
    medium: string;
  };
}

const HomeworkSection: React.FC<HomeworkSectionProps> = ({ student }) => {
  // This is a "guard clause". If the student prop isn't ready yet,
  // we render nothing to prevent crashes.
  if (!student) {
    return null;
  }

  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchHomework = useCallback(async () => {
    // This check is redundant because of the guard clause above, but it's safe to keep.
    if (!student.class || !student.medium) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('homework_assignments')
        .select('*')
        .eq('class', student.class)
        .eq('medium', student.medium)
        .eq('is_active', true)
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }
      setHomeworkList(data || []);
    } catch (err) {
      console.error("Error fetching homework:", err);
    } finally {
      setLoading(false);
    }
  }, [student.class, student.medium]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const isOverdue = (dueDate: string) => {
    // Check if the due date is in the past, but not today.
    const due = new Date(dueDate);
    const today = new Date();
    // Set hours to 0 to compare dates only, not times.
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculations are now based on the internal 'homeworkList' state
  const overdueCount = homeworkList.filter(hw => isOverdue(hw.due_date)).length;
  const pendingCount = homeworkList.length - overdueCount;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <p className="text-2xl font-bold text-blue-600">{homeworkList.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <BookOpen size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen size={20} className="mr-2 text-blue-500" />
            Homework Assignments
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {homeworkList.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No homework assignments available</p>
              <p className="text-gray-400 text-sm">Check back later for new assignments</p>
            </div>
          ) : (
            homeworkList.map((hw) => {
              const daysUntilDue = getDaysUntilDue(hw.due_date);
              const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;
              const isItOverdue = isOverdue(hw.due_date);

              return (
                <div key={hw.id} className={`p-6 hover:bg-gray-50 transition-colors ${isDueSoon ? 'bg-yellow-50/50' : ''} ${isItOverdue ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{hw.title}</h4>
                        {isItOverdue ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle size={12} className="mr-1" />Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock size={12} className="mr-1" />Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center"><BookOpen size={14} className="mr-1" />{hw.subject}</span>
                        <span className="flex items-center"><Calendar size={14} className="mr-1" />Due: {formatDate(hw.due_date)}</span>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed line-clamp-3">{hw.description}</p>
                      {hw.attachment_url && (
                        <div className="mb-3">
                          <a href={hw.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                            <FileText size={14} className="mr-1.5" />View Assignment File<ExternalLink size={12} className="ml-1.5" />
                          </a>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">Assigned: {formatDate(hw.created_at)}</div>
                    </div>
                    <div className="ml-4">
                      <button onClick={() => { setSelectedHomework(hw); setShowDetailsModal(true); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm font-medium">
                        <Eye size={16} /><span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showDetailsModal && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full m-4 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-start mb-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedHomework.title}</h3>
                <p className="text-sm text-gray-500">{selectedHomework.subject}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={24} /></button>
            </div>
            <div className="space-y-4 overflow-y-auto">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description & Instructions</h4>
                <div className="bg-gray-50 rounded-lg p-4"><p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedHomework.description}</p></div>
              </div>
              {selectedHomework.attachment_url && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Attachment</h4>
                  <a href={selectedHomework.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                    <Download size={16} className="mr-2" />Download Attachment
                  </a>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Due Date</h4>
                  <p className="text-gray-600">{formatDate(selectedHomework.due_date)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Assigned Date</h4>
                  <p className="text-gray-600">{formatDate(selectedHomework.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end pt-4 border-t">
              <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkSection;