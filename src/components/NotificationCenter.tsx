import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Send, Users, MessageSquare, Calendar, Clock, Target,
  Plus, Search, Filter, Eye, Trash2, CheckCircle, AlertTriangle
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useMedium } from '../context/MediumContext';
import { formatDate } from '../utils';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'general' | 'homework' | 'fee' | 'exam' | 'event' | 'urgent';
  target_audience: 'all' | 'parents' | 'students' | 'class_specific' | 'medium_specific';
  target_class?: string;
  target_medium?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_at?: string;
  sent_at?: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
}

const NotificationCenter: React.FC = () => {
  const { medium } = useMedium();
  const [activeTab, setActiveTab] = useState<'send'  | 'scheduled' | 'sent' | 'templates'>('send');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Form state for sending notifications
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general' as const,
    target_audience: 'all' as const,
    target_class: '',
    target_medium: medium || 'English',
    priority: 'medium' as const,
    scheduled_at: ''
  });

  // Predefined templates
  const templates: NotificationTemplate[] = [
    {
      id: 'fee_reminder',
      name: 'Fee Payment Reminder',
      title: 'Fee Payment Due',
      message: 'Dear Parent, This is a reminder that your child\'s quarterly fees are due. Please make the payment by the due date to avoid late fees.',
      type: 'fee'
    },
    {
      id: 'homework_assigned',
      name: 'New Homework Assignment',
      title: 'New Homework Assigned',
      message: 'New homework has been assigned for {subject}. Please check the homework section for details and due date.',
      type: 'homework'
    },
    {
      id: 'exam_schedule',
      name: 'Exam Schedule Notification',
      title: 'Exam Schedule Released',
      message: 'The examination schedule for {exam_type} has been released. Please check the exam section for detailed timetable.',
      type: 'exam'
    },
    {
      id: 'parent_meeting',
      name: 'Parent-Teacher Meeting',
      title: 'Parent-Teacher Meeting Scheduled',
      message: 'Parent-Teacher meeting is scheduled for {date} from {time}. Please attend to discuss your child\'s academic progress.',
      type: 'event'
    },
    {
      id: 'holiday_notice',
      name: 'Holiday Notice',
      title: 'School Holiday',
      message: 'School will remain closed on {date} due to {reason}. Regular classes will resume from {resume_date}.',
      type: 'general'
    },
    {
      id: 'urgent_notice',
      name: 'Urgent Notice',
      title: 'Urgent: Important Information',
      message: 'This is an urgent notice regarding {subject}. Please read carefully and take necessary action.',
      type: 'urgent'
    }
  ];

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      alert('Please fill all required fields');
      return;
    }

    const notificationData = {
      ...newNotification,
      target_medium: newNotification.target_audience === 'medium_specific' ? newNotification.target_medium : null,
      target_class: newNotification.target_audience === 'class_specific' ? newNotification.target_class : null,
      scheduled_at: newNotification.scheduled_at || null,
      sent_at: !newNotification.scheduled_at ? new Date().toISOString() : null,
      created_by: 'Current User' // In real app, get from auth context
    };

    const { error } = await supabase
      .from('notifications')
      .insert([notificationData]);

    if (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } else {
      alert(newNotification.scheduled_at ? 'Notification scheduled successfully!' : 'Notification sent successfully!');
      setNewNotification({
        title: '',
        message: '',
        type: 'general',
        target_audience: 'all',
        target_class: '',
        target_medium: medium || 'English',
        priority: 'medium',
        scheduled_at: ''
      });
      fetchNotifications();
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    } else {
      alert('Notification deleted successfully!');
      fetchNotifications();
    }
  };

  const handleUseTemplate = (template: NotificationTemplate) => {
    setNewNotification({
      ...newNotification,
      title: template.title,
      message: template.message,
      type: template.type as any
    });
    setActiveTab('send');
  };

  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'exam': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fee': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'homework': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || notification.type === filterType;
    
    switch (activeTab) {
      case 'scheduled':
        return notification.scheduled_at && !notification.sent_at && matchesSearch && matchesType;
      case 'sent':
        return notification.sent_at && matchesSearch && matchesType;
      default:
        return matchesSearch && matchesType;
    }
  });

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
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
              <p className="text-gray-600">Send notifications and manage school notices</p>
            </div>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'send' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Send New
            </button>
            
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'scheduled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Scheduled
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Sent
            </button>
            
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'templates' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.sent_at).length}
              </p>
            </div>
          </div>
        </div>
    
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.scheduled_at && !n.sent_at).length}
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
                {notifications.filter(n => n.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(n.created_at) > weekAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

     
      {activeTab === 'send' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Send New Notification</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as any })}
                >
                  <option value="general">General</option>
                  <option value="homework">Homework</option>
                  <option value="fee">Fee</option>
                  <option value="exam">Exam</option>
                  <option value="event">Event</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newNotification.priority}
                  onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value as any })}
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
                  value={newNotification.target_audience}
                  onChange={(e) => setNewNotification({ ...newNotification, target_audience: e.target.value as any })}
                >
                  <option value="all">All</option>
                  <option value="parents">Parents Only</option>
                  <option value="students">Students Only</option>
                  <option value="class_specific">Specific Class</option>
                  <option value="medium_specific">Specific Medium</option>
                </select>
              </div>
              {newNotification.target_audience === 'class_specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Class</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newNotification.target_class}
                    onChange={(e) => setNewNotification({ ...newNotification, target_class: e.target.value })}
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
              {newNotification.target_audience === 'medium_specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Medium</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newNotification.target_medium}
                    onChange={(e) => setNewNotification({ ...newNotification, target_medium: e.target.value })}
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule For Later (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newNotification.scheduled_at}
                  onChange={(e) => setNewNotification({ ...newNotification, scheduled_at: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your notification message..."
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              />
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleSendNotification}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4 inline mr-2" />
                {newNotification.scheduled_at ? 'Schedule Notification' : 'Send Now'}
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'scheduled' || activeTab === 'sent') && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <h3 className="text-lg font-semibold text-gray-800">
                {activeTab === 'scheduled' ? 'Scheduled Notifications' : 'Sent Notifications'}
              </h3>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="general">General</option>
                  <option value="homework">Homework</option>
                  <option value="fee">Fee</option>
                  <option value="exam">Exam</option>
                  <option value="event">Event</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-6">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{notification.title}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(notification.type)}`}>
                          {notification.type.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-3">{notification.message}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>
                            {notification.target_audience === 'class_specific' 
                              ? `Class ${notification.target_class}` 
                              : notification.target_audience === 'medium_specific'
                              ? `${notification.target_medium} Medium`
                              : notification.target_audience.charAt(0).toUpperCase() + notification.target_audience.slice(1)
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(notification.created_at)}</span>
                        </div>
                        {notification.scheduled_at && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Scheduled: {formatDate(notification.scheduled_at)}</span>
                          </div>
                        )}
                        {notification.sent_at && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Sent: {formatDate(notification.sent_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Notification"
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

      

      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notification Templates</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(template.type)}`}>
                      {template.type.toUpperCase()}
                    </span>
                  </div>
                  <h5 className="font-medium text-gray-800 mb-2">{template.title}</h5>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{template.message}</p>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;