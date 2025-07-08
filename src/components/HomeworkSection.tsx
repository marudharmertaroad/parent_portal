// src/components/HomeworkSection.tsx (FINAL, RULES OF HOOKS COMPLIANT VERSION)

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '/src/lib/supabase';
import { Homework } from '../types';
import { BookOpen, Calendar, Clock, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils';

interface HomeworkSectionProps {
  student?: {
    class: string;
    medium: string;
  };
}

const HomeworkSection: React.FC<HomeworkSectionProps> = ({ student }) => {
  // --- FIX: ALL HOOKS ARE MOVED TO THE TOP OF THE COMPONENT ---
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomework = useCallback(async () => {
    // We can still have a safety check here, but it's for fetching, not rendering.
    if (!student || !student.class || !student.medium) {
      setLoading(false); // Stop loading if there's no student data
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
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;
      setHomeworkList(data || []);
    } catch (err: any) {
      console.error("Error fetching homework:", err);
      setError("Could not load homework assignments. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [student]); // We can depend on the whole student object now

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  // --- The Guard Clause now comes AFTER the hooks ---
  if (!student) {
    // It's safe to return early here because all hooks have already been called.
    return <div className="p-4 text-center text-gray-500">Select a student to view homework.</div>;
  }
  
  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date() && new Date(dueDate).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;
  }

  // --- The rest of the JSX rendering code is unchanged ---
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Homework Assignments</h2>
      </div>
      
      {homeworkList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No active homework assignments for this class.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworkList.map((hw) => (
            <div key={hw.id} className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow">
              {/* ... The rest of the map function ... */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeworkSection;