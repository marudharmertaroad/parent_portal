// src/components/HomeworkSection.tsx

import React from 'react';
import { Homework, Student } from '../types';
import { formatDate } from '../utils';
import { BookOpen, Calendar, Clock, AlertCircle, FileText, ExternalLink } from 'lucide-react';

interface HomeworkSectionProps {
  homeworkList: Homework[];
  student: Student;
}

const StatCard: React.FC<{ title: string; count: number; icon: React.ElementType; color: string; }> = ({ title, count, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border flex items-center gap-4">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg flex items-center justify-center`}>
      <Icon size={20} sm:size={24} className="text-white" />
    </div>
    <div>
      <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{count}</p>
    </div>
  </div>
);

const HomeworkSection: React.FC<HomeworkSectionProps> = ({ homeworkList = [], student }) => {
  const safeHomeworkList = Array.isArray(homeworkList) ? homeworkList : [];

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    // Compare dates only, ignoring time
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const pendingAssignments = safeHomeworkList.filter(hw => !isOverdue(hw.due_date));
  const overdueAssignments = safeHomeworkList.filter(hw => isOverdue(hw.due_date));

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - now responsive */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl sm:rounded-2xl">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Homework</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Stay on top of your tasks and deadlines.</p>
        </div>
      </div>

      {/* Summary Stat Cards - now responsive */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-grow min-w-[160px]"><StatCard title="Total Assignments" count={safeHomeworkList.length} icon={BookOpen} color="bg-blue-500" /></div>
        <div className="flex-grow min-w-[160px]"><StatCard title="Pending Assignments" count={pendingAssignments.length} icon={Clock} color="bg-yellow-500" /></div>
        <div className="flex-grow min-w-[160px]"><StatCard title="Overdue Assignments" count={overdueAssignments.length} icon={AlertCircle} color="bg-red-500" /></div>
      </div>

      {/* Homework List */}
      <div className="bg-white rounded-xl shadow-md border">
        <div className="p-4 sm:p-6 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Your Assignment List</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {safeHomeworkList.length > 0 ? (
            safeHomeworkList.map((hw) => {
              const overdue = isOverdue(hw.due_date);
              
              return (
                // [MOBILE COMPACT] Each homework item is now a more compact card
                <div key={hw.id} className={`p-4 ${overdue ? 'bg-red-50/30' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    {/* Main content area */}
                    <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <p className="font-bold text-gray-800">{hw.subject}</p>
                         <span className={`inline-block sm:hidden px-2 py-1 text-xs font-semibold rounded-full ${overdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {overdue ? 'Overdue' : 'Pending'}
                         </span>
                       </div>
                       <h4 className="text-base sm:text-lg font-semibold text-gray-900 mt-1">{hw.title}</h4>
                       <p className="text-sm text-gray-600 mt-2 leading-relaxed">{hw.description}</p>
                    </div>

                    {/* Right side: Dates and Attachment button */}
                    <div className="sm:text-right flex flex-row sm:flex-col justify-between items-center mt-2 sm:mt-0">
                      <div>
                        <p className={`font-semibold ${overdue ? 'text-red-600' : 'text-gray-800'}`}>Due: {formatDate(hw.due_date)}</p>
                        <p className="text-xs text-gray-400 mt-1">Assigned: {formatDate(hw.created_at)}</p>
                      </div>
                      {hw.attachment_url && (
                        <a
                          href={hw.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0 sm:mt-3 shrink-0 inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                        >
                          <FileText size={16} className="mr-2" />
                          Attachment
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-gray-500 font-medium">No homework assignments found.</p>
              <p className="text-gray-400 text-sm mt-1">Great job, you're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkSection;