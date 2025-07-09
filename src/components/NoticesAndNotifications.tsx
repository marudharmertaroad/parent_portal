// src/components/NoticesAndNotifications.tsx (CORRECTED)

import React, { useState } from 'react';
import { Notice, Notification } from '../types';
import { Bell, Megaphone, X } from 'lucide-react';
import { formatDate } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  notifications: Notification[];
}

const NoticesAndNotifications: React.FC<Props> = ({ isOpen, onClose, notices, notifications = [] }) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'notifications'>('notices');

  if (!isOpen) {
    return null;
  }

  return (
    // This is the corrected line
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Updates & Alerts</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b p-2 bg-gray-50">
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'notices' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'
            }`}
          >
            <Megaphone size={16} className="inline mr-2" /> School Notices
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'notifications' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'
            }`}
          >
            <Bell size={16} className="inline mr-2" /> Personal Notifications
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'notices' && (
            <div className="space-y-4">
              {notices.length > 0 ? notices.map(notice => (
                <div key={notice.id} className="p-4 border rounded-lg bg-blue-50/50">
                  <p className="font-bold text-blue-800">{notice.title}</p>
                  <p className="text-gray-700 mt-1 text-sm">{notice.content}</p>
                  <p className="text-xs text-gray-500 mt-2">Posted on: {formatDate(notice.created_at)}</p>
                </div>
              )) : <p className="text-center text-gray-500 py-8">No new school notices.</p>}
            </div>
          )}

          {activeTab === 'notifications' && (
             <div className="text-center text-gray-500 py-8">
                <p>Personal notifications are coming soon!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticesAndNotifications;