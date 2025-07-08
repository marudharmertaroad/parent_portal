// src/components/HomeworkSection.tsx (FINAL DEBUGGING VERSION - NO UTILS)

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '/src/lib/supabase';
import { Homework } from '../types';
import { BookOpen, Calendar, Clock, Link as LinkIcon, AlertCircle } from 'lucide-react';
// import { formatDate } from '../utils'; // We are deliberately not using this for the test

interface HomeworkSectionProps {
  student?: {
    class: string;
    medium: string;
  };
}

const HomeworkSection: React.FC<HomeworkSectionProps> = ({ student }) => {
  if (!student) {
    return null; // Safety guard clause
  }

  // --- Using temporary, perfect data for this test ---
  const [homeworkList, setHomeworkList] = useState<Homework[]>([
      {
          id: 1,
          title: 'Test: Chapter 5 Algebra',
          description: 'This is a test homework to see if the UI renders without utility functions.',
          subject: 'Mathematics',
          due_date: '2025-12-31',
          created_at: '2024-01-01',
          attachment_url: 'https://supabase.com'
      }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The isOverdue function is simple and safe
  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  // The data fetching logic is disabled for this test, so we can focus on rendering.

  if (loading) { /* ... */ }
  if (error) { /* ... */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Homework Assignments (Test Mode)</h2>
      </div>
      
      {homeworkList.map((hw) => (
        <div key={hw.id} className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{hw.title}</h3>
              <p className="text-sm font-medium text-gray-500 mt-1">{hw.subject}</p>
            </div>
            {isOverdue(hw.due_date) ? (
              <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                <AlertCircle size={14} className="mr-1.5" /> Overdue
              </span>
            ) : (
              <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                <Clock size={14} className="mr-1.5" /> Pending
              </span>
            )}
          </div>
          
          <p className="text-gray-700 my-4">{hw.description}</p>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 border-t pt-4 mt-4">
            <div className="flex items-center">
              <Calendar size={14} className="mr-2 text-red-500" />
              <strong>Due Date:</strong>
              {/* --- THIS IS THE FIX --- We use a built-in function instead of formatDate */}
              <span className="ml-1">{new Date(hw.due_date).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-2 text-gray-500" />
              <strong>Assigned:</strong>
              {/* --- THIS IS THE FIX --- We use a built-in function instead of formatDate */}
              <span className="ml-1">{new Date(hw.created_at).toLocaleDateString('en-IN')}</span>
            </div>
            {hw.attachment_url && (
                <a href={hw.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                    <LinkIcon size={14} className="mr-2"/>
                    <strong>View Attachment</strong>
                </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeworkSection;