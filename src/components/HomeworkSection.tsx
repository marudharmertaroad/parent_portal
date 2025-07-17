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
  <div className="bg-white rounded-xl p-6 shadow-md border flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Homework & Assignments</h1>
          <p className="text-gray-600 mt-1">Stay on top of your tasks and deadlines.</p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Assignments" count={safeHomeworkList.length} icon={BookOpen} color="bg-blue-500" />
        <StatCard title="Pending Assignments" count={pendingAssignments.length} icon={Clock} color="bg-yellow-500" />
        <StatCard title="Overdue Assignments" count={overdueAssignments.length} icon={AlertCircle} color="bg-red-500" />
      </div>

      {/* Homework List */}
      <div className="bg-white rounded-xl shadow-md border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Your Assignment List</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {safeHomeworkList.length > 0 ? (
            safeHomeworkList.map((hw) => {
              const overdue = isOverdue(hw.due_date);
              const statusColor = overdue ? 'border-red-500 bg-red-50/50' : 'border-yellow-500 bg-yellow-50/50';
              const iconColor = overdue ? 'text-red-500' : 'text-yellow-500';
              const statusIcon = overdue ? AlertCircle : Clock;
              
              return (
                <div key={hw.id} className={`p-6 hover:bg-gray-50 transition-colors`}>
                  <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-start">
                    <div className="md:col-span-1 flex justify-center pt-1">
                      <statusIcon size={24} className={iconColor} />
                    </div>

                    <div className="md:col-span-6">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${overdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {overdue ? 'Overdue' : 'Pending'}
                        </span>
                        <p className="font-bold text-gray-800">{hw.subject}</p>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">{hw.title}</h4>
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed">{hw.description}</p>
                    </div>

                    <div className="md:col-span-3 md:text-right">
                      <p className="font-semibold text-red-600">Due: {formatDate(hw.due_date)}</p>
                      <p className="text-xs text-gray-400 mt-1">Assigned: {formatDate(hw.created_at)}</p>
                       {hw.attachment_url && (
                        <a
                          href={hw.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                        >
                          <FileText size={16} className="mr-2" />
                          View Attachment
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