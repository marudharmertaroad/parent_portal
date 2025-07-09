import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Plus, Calendar, Clock, FileText, Upload, Download,
  Edit, Trash2, Eye, CheckCircle, AlertCircle, Search, Filter,
  GraduationCap, Users, Star, MessageSquare
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useMedium } from '../context/MediumContext';
import { formatDate } from '../utils';

interface HomeworkAssignment {
  id: number;
  title: string;
  description: string;
  class: string;
  medium: string;
  subject: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachment_url?: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

interface HomeworkSubmission {
  id: number;
  homework_id: number;
  student_sr_no: string;
  student_name?: string;
  submission_text?: string;
  attachment_url?: string;
  submitted_at: string;
  grade?: string;
  teacher_comments?: string;
  status: 'submitted' | 'graded' | 'late' | 'missing';
}

const HomeworkManagement: React.FC = () => {
  const { medium } = useMedium();
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions' | 'create'>('assignments');
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<HomeworkAssignment | null>(null);

  // Form state for creating assignments
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    class: '',
    subject: '',
    due_date: '',
    priority: 'medium' as const,
    attachment_url: ''
  });

  const fetchAssignments = useCallback(async () => {
    if (!medium) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('homework_assignments')
      .select('*')
      .eq('medium', medium)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
    } else {
      setAssignments(data || []);
    }
    setLoading(false);
  }, [medium]);

  const fetchSubmissions = useCallback(async (homeworkId?: number) => {
    const query = supabase
      .from('homework_submissions')
      .select(`
        *,
        homework_assignments!inner(title, class, medium)
      `)
      .eq('homework_assignments.medium', medium);

    if (homeworkId) {
      query.eq('homework_id', homeworkId);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
    } else {
      // Get student names
      const submissionsWithNames = await Promise.all(
        (data || []).map(async (submission) => {
          const { data: student } = await supabase
            .from('students')
            .select('name')
            .eq('sr_no', submission.student_sr_no)
            .single();
          
          return {
            ...submission,
            student_name: student?.name || 'Unknown Student'
          };
        })
      );
      setSubmissions(submissionsWithNames);
    }
  }, [medium]);

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, [fetchAssignments, fetchSubmissions]);

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.description || !newAssignment.class || !newAssignment.subject || !newAssignment.due_date) {
      alert('Please fill all required fields');
      return;
    }

    const { error } = await supabase
      .from('homework_assignments')
      .insert([{
        ...newAssignment,
        medium,
        created_by: 'Current Teacher' // In real app, get from auth context
      }]);

    if (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
    } else {
      alert('Assignment created successfully!');
      setNewAssignment({
        title: '',
        description: '',
        class: '',
        subject: '',
        due_date: '',
        priority: 'medium',
        attachment_url: ''
      });
      fetchAssignments();
      setActiveTab('assignments');
    }
  };

  const handleGradeSubmission = async (submissionId: number, grade: string, comments: string) => {
    const { error } = await supabase
      .from('homework_submissions')
      .update({
        grade,
        teacher_comments: comments,
        status: 'graded'
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Error grading submission:', error);
      alert('Failed to grade submission');
    } else {
      alert('Submission graded successfully!');
      fetchSubmissions();
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    const { error } = await supabase
      .from('homework_assignments')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment');
    } else {
      alert('Assignment deleted successfully!');
      fetchAssignments();
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || assignment.class === filterClass;
    const matchesSubject = !filterSubject || assignment.subject === filterSubject;
    return matchesSearch && matchesClass && matchesSubject;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'late': return 'bg-orange-100 text-orange-800';
      case 'missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Homework Management</h1>
              <p className="text-gray-600">Create, manage, and grade homework assignments</p>
            </div>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'assignments' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'submissions' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Submissions
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create New
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Grading</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => s.status === 'submitted').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => new Date(a.due_date) < new Date()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <h3 className="text-lg font-semibold text-gray-800">Homework Assignments</h3>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                  <option value="Third">Third</option>
                  <option value="Fourth">Fourth</option>
                  <option value="Fifth">Fifth</option>
                  <option value="Sixth">Sixth</option>
                  <option value="Seventh">Seventh</option>
                  <option value="Eighth">Eighth</option>
                  <option value="Ninth">Ninth</option>
                  <option value="Tenth">Tenth</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-6">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <GraduationCap className="w-4 h-4" />
                          <span>Class {assignment.class}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{assignment.subject}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDate(assignment.due_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>By {assignment.created_by}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => fetchSubmissions(assignment.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Submissions"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Homework Submissions</h3>
          </div>
          <div className="p-6">
            <div className="grid gap-6">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{submission.student_name}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{submission.submission_text}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Submitted: {formatDate(submission.submitted_at)}</span>
                        </div>
                        {submission.grade && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4" />
                            <span>Grade: {submission.grade}</span>
                          </div>
                        )}
                      </div>
                      {submission.teacher_comments && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Teacher Comments:</span>
                          </div>
                          <p className="text-sm text-gray-600">{submission.teacher_comments}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {submission.status === 'submitted' && (
                        <button
                          onClick={() => {
                            const grade = prompt('Enter grade:');
                            const comments = prompt('Enter comments:');
                            if (grade && comments) {
                              handleGradeSubmission(submission.id, grade, comments);
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Grade
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Create New Assignment</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter assignment title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject"
                  value={newAssignment.subject}
                  onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newAssignment.class}
                  onChange={(e) => setNewAssignment({ ...newAssignment, class: e.target.value })}
                >
                  <option value="">Select Class</option>
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                  <option value="Third">Third</option>
                  <option value="Fourth">Fourth</option>
                  <option value="Fifth">Fifth</option>
                  <option value="Sixth">Sixth</option>
                  <option value="Seventh">Seventh</option>
                  <option value="Eighth">Eighth</option>
                  <option value="Ninth">Ninth</option>
                  <option value="Tenth">Tenth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newAssignment.due_date}
                  onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newAssignment.priority}
                  onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachment URL (Optional)</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter attachment URL"
                  value={newAssignment.attachment_url}
                  onChange={(e) => setNewAssignment({ ...newAssignment, attachment_url: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter assignment description and instructions"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              />
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleCreateAssignment}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Assignment
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkManagement;