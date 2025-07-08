import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '/src/lib/supabase'; // Using your correct import path
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

  if (!student) {
    return null; // Or you could return a message like <div>Student data not available.</div>
  }
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
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{hw.title}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">{hw.subject}</p>
                </div>
                {isOverdue(hw.due_date) ? (
                  <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    <AlertCircle size={14} className="mr-1.5" />
                    Overdue
                  </span>
                ) : (
                  <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    <Clock size={14} className="mr-1.5" />
                    Pending
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 my-4">{hw.description}</p>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 border-t pt-4 mt-4">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2 text-red-500" />
                  <strong>Due Date:</strong><span className="ml-1">{formatDate(hw.due_date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-2 text-gray-500" />
                  <strong>Assigned:</strong><span className="ml-1">{formatDate(hw.created_at)}</span>
                </div>
                {hw.attachment_url && (
                    <a 
                        href={hw.attachment_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                    >
                        <LinkIcon size={14} className="mr-2"/>
                        <strong>View Attachment</strong>
                    </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeworkSection;