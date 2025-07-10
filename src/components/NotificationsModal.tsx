// src/components/NoticesAndNotifications.tsx

import React, { useState } from 'react';
import { Notice, Notification } from '../types';
import { Bell, Megaphone, X, Calendar, AlertTriangle } from 'lucide-react';
import { formatDate } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  notifications: Notification[];
}

const NoticesAndNotifications: React.FC<Props> = ({ isOpen, onClose, notices, notifications }) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'notifications'>('notices');

  if (!isOpen) return null;

  const getNotificationPillStyle = (type: string) => {
    switch(type) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'fee': return 'bg-yellow-100 text-yellow-800';
      case 'exam': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Updates Center</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><X size={24} /></button>
        </div>

        <div className="flex border-b p-2 bg-gray-50">
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex-1 py-3 font-semibold transition-all ${activeTab === 'notices' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            <Megaphone className="inline-block mr-2" size={18} /> General Notices
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 font-semibold transition-all relative ${activeTab === 'notifications' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
          >
            <Bell className="inline-block mr-2" size={18} /> Personal Alerts
            {notifications.length > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
          {activeTab === 'notices' && (
            <div className="space-y-4">
              {notices.length > 0 ? notices.map(notice => (
                <div key={notice.id} className="p-5 border rounded-lg bg-white shadow-sm">
                  <h3 className="font-bold text-gray-900">{notice.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-3">Posted on: {formatDate(notice.created_at)}</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                </div>
              )) : <p className="text-center text-gray-500 py-10">No general notices available.</p>}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map(notification => (
                <div key={notification.id} className={`p-5 border rounded-lg bg-white shadow-sm`}>
                  <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getNotificationPillStyle(notification.type)}`}>
                        {notification.type.toUpperCase()}
                      </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 mb-3">Received: {formatDate(notification.created_at)}</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{notification.message}</p>
                </div>
              )) : <p className="text-center text-gray-500 py-10">No personal alerts to show.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticesAndNotifications;