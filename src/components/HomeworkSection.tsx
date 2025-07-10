// src/components/HomeworkSection.tsx (Polished Parent Portal View)

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Homework } from '../types';
import { BookOpen, Calendar, Clock, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { formatDate } from '../utils';

interface HomeworkSectionProps {
  student?: {
    class: string;
    medium: string;
  };
}

const HomeworkSection: React.FC<HomeworkSectionProps> = ({ student }) => {
  // Safety guard clause
  if (!student) {
    return <div className="p-4 text-center text-gray-500">Loading student data...</div>;
  }

  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('homework_assignments')
        .select('*')
        .eq('class', student.class)
        .eq('medium', student.medium)
        .eq('is_active', true)
        .order('due_date', { ascending: true });

      if (error) throw error;
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
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const pendingCount = homeworkList.filter(hw => !isOverdue(hw.due_date)).length;
  const overdueCount = homeworkList.filter(hw => isOverdue(hw.due_date)).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homework</h1>
          <p className="text-gray-600 mt-1">View all your assigned homework here.</p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full"><Clock size={24} className="text-yellow-600" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full"><AlertCircle size={24} className="text-red-600" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full"><BookOpen size={24} className="text-blue-600" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{homeworkList.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="bg-white rounded-xl shadow-lg border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Assignment List</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {homeworkList.length > 0 ? (
            homeworkList.map((hw) => {
              const isItOverdue = isOverdue(hw.due_date);
              return (
                <div key={hw.id} className={`p-6 ${isItOverdue ? 'bg-red-50/50' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{hw.title}</h4>
                        {isItOverdue ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-500 mb-3">{hw.subject}</p>
                      <p className="text-gray-700 leading-relaxed">{hw.description}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 text-left md:text-right flex-shrink-0">
                      <div className="flex items-center text-red-600 font-semibold">
                        <Calendar size={16} className="mr-2" />
                        <span>Due: {formatDate(hw.due_date)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Assigned on: {formatDate(hw.created_at)}</p>
                    </div>
                  </div>
                  {hw.attachment_url && (
                    <div className="mt-4 border-t pt-4">
                      <a
                        href={hw.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        <FileText size={16} className="mr-2" />
                        View Attachment
                        <ExternalLink size={14} className="ml-2" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No homework assignments found for your class.</p>
              <p className="text-gray-400 text-sm mt-1">Great job, you're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkSection;