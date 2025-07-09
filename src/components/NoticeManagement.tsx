import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Plus, Calendar, Users, AlertTriangle, Eye, Edit, Trash2,
  Search, Filter, Clock, CheckCircle, Archive, Send, Target
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useMedium } from '../context/MediumContext';
import { formatDate } from '../utils';

interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_audience: 'all' | 'parents' | 'students' | 'class_specific';
  target_class?: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

const NoticeManagement: React.FC = () => {
  const { medium } = useMedium();
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'create'>('active');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAudience, setFilterAudience] = useState('');

  // Form state for creating notices
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    priority: 'medium' as const,
    target_audience: 'all' as const,
    target_class: '',
    expires_at: ''
  });

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notices:', error);
    } else {
      setNotices(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      alert('Please fill all required fields');
      return;
    }

    const noticeData = {
      ...newNotice,
      expires_at: newNotice.expires_at || null,
      target_class: newNotice.target_audience === 'class_specific' ? newNotice.target_class : null
    };

    const { error } = await supabase
      .from('notices')
      .insert([noticeData]);

    if (error) {
      console.error('Error creating notice:', error);
      alert('Failed to create notice');
    } else {
      alert('Notice created successfully!');
      setNewNotice({
        title: '',
        content: '',
        priority: 'medium',
        target_audience: 'all',
        target_class: '',
        expires_at: ''
      });
      fetchNotices();
      setActiveTab('active');
    }
  };

  const handleToggleNoticeStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('notices')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating notice status:', error);
      alert('Failed to update notice status');
    } else {
      fetchNotices();
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notice:', error);
      alert('Failed to delete notice');
    } else {
      alert('Notice deleted successfully!');
      fetchNotices();
    }
  };

  const filteredNotices = notices.filter(notice => {
    const matchesTab = activeTab === 'active' ? notice.is_active : !notice.is_active;
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || notice.priority === filterPriority;
    const matchesAudience = !filterAudience || notice.target_audience === filterAudience;
    return matchesTab && matchesSearch && matchesPriority && matchesAudience;
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

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all': return <Users className="w-4 h-4" />;
      case 'parents': return <Users className="w-4 h-4" />;
      case 'students': return <Users className="w-4 h-4" />;
      case 'class_specific': return <Target className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
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
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notice Management</h1>
              <p className="text-gray-600">Create and manage school notices and announcements</p>
            </div>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Active Notices
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'archived' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Archive className="w-4 h-4 inline mr-2" />
              Archived
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Notice
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notices</p>
              <p className="text-2xl font-bold text-gray-900">{notices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {notices.filter(n => n.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">
                {notices.filter(n => n.priority === 'urgent' && n.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Archive className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-900">
                {notices.filter(n => !n.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {(activeTab === 'active' || activeTab === 'archived') && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <h3 className="text-lg font-semibold text-gray-800">
                {activeTab === 'active' ? 'Active Notices' : 'Archived Notices'}
              </h3>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search notices..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
                >
                  <option value="">All Audiences</option>
                  <option value="all">All</option>
                  <option value="parents">Parents</option>
                  <option value="students">Students</option>
                  <option value="class_specific">Class Specific</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-6">
              {filteredNotices.map((notice) => (
                <div key={notice.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{notice.title}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(notice.priority)}`}>
                          {notice.priority.toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-1 text-gray-500">
                          {getAudienceIcon(notice.target_audience)}
                          <span className="text-sm">
                            {notice.target_audience === 'class_specific' 
                              ? `Class ${notice.target_class}` 
                              : notice.target_audience.charAt(0).toUpperCase() + notice.target_audience.slice(1)
                            }
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-3">{notice.content}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(notice.created_at)}</span>
                        </div>
                        {notice.expires_at && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Expires: {formatDate(notice.expires_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleToggleNoticeStatus(notice.id, notice.is_active)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          notice.is_active 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {notice.is_active ? 'Archive' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Notice"
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

      {activeTab === 'create' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Create New Notice</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notice Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notice title"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newNotice.priority}
                  onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newNotice.target_audience}
                  onChange={(e) => setNewNotice({ ...newNotice, target_audience: e.target.value as any })}
                >
                  <option value="all">All</option>
                  <option value="parents">Parents Only</option>
                  <option value="students">Students Only</option>
                  <option value="class_specific">Specific Class</option>
                </select>
              </div>
              {newNotice.target_audience === 'class_specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Class</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newNotice.target_class}
                    onChange={(e) => setNewNotice({ ...newNotice, target_class: e.target.value })}
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
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newNotice.expires_at}
                  onChange={(e) => setNewNotice({ ...newNotice, expires_at: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notice Content</label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the complete notice content..."
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
              />
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleCreateNotice}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Publish Notice
              </button>
              <button
                onClick={() => setActiveTab('active')}
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

export default NoticeManagement;