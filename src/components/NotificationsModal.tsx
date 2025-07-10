// src/components/NotificationModal.tsx

import React from 'react';
import { Notification } from '../types';
import { Bell, X } from 'lucide-react';
import { formatDate } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationModal: React.FC<Props> = ({ isOpen, onClose, notifications = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Bell className="mr-3 text-purple-600" />
            Personal Alerts
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
          <div className="space-y-4">
            {notifications.length > 0 ? notifications.map(notification => (
              <div key={notification.id} className="p-5 border rounded-lg bg-white shadow-sm">
                <h3 className="font-bold text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-3">Received: {formatDate(notification.created_at)}</p>
                <p className="text-gray-700 whitespace-pre-wrap">{notification.message}</p>
              </div>
            )) : <p className="text-center text-gray-500 py-10">You have no new personal alerts.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;