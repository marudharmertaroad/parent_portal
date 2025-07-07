import React, { useState } from 'react';
import { Notice, Notification } from '../types';
import { Bell, Calendar, AlertCircle, Info, Star, CheckCircle, X } from 'lucide-react';

interface NoticesAndNotificationsProps {
  notices: Notice[];
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => Promise<any>;
  onMarkAllAsRead: () => Promise<any>;
}

const NoticesAndNotifications: React.FC<NoticesAndNotificationsProps> = ({ 
  notices, 
  notifications, 
  isOpen, 
  onClose,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'notifications'>('notifications');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'medium':
        return <Star size={16} className="text-yellow-600" />;
      case 'low':
        return <Info size={16} className="text-green-600" />;
      default:
        return <Info size={16} className="text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Holiday': 'bg-blue-100 text-blue-800',
      'Meeting': 'bg-purple-100 text-purple-800',
      'Library': 'bg-green-100 text-green-800',
      'Exam': 'bg-red-100 text-red-800',
      'Event': 'bg-yellow-100 text-yellow-800',
      'Sports': 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'info':
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await onMarkAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await onMarkAllAsRead();
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full m-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Bell size={24} className="text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-900">Notices & Notifications</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Notifications {unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'notices'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              School Notices
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {unreadCount > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Mark All as Read
                  </button>
                </div>
              )}
              
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-sm border transition-all ${
                    notification.read ? 'border-gray-200' : `border-l-4 ${getNotificationColor(notification.type)}`
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-gray-500">
                              {new Date(notification.date).toLocaleDateString('en-IN')} at{' '}
                              {new Date(notification.date).toLocaleTimeString()}
                            </p>
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div key={notice.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{notice.title}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                            {getPriorityIcon(notice.priority)}
                            <span className="ml-1 capitalize">{notice.priority}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(notice.date).toLocaleDateString('en-IN')}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                            {notice.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">{notice.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticesAndNotifications;