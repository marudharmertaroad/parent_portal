// src/components/NotificationModal.tsx (ENHANCED UI VERSION)

import React from 'react';
import { Notification } from '../types';
import { Bell, X, Calendar, AlertTriangle, FileText, BookOpen, CreditCard } from 'lucide-react';
import { formatDate } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationModal: React.FC<Props> = ({ isOpen, onClose, notifications = [] }) => {
  if (!isOpen) return null;

  // Helper function to get styling based on notification type
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' };
      case 'fee':
        return { icon: CreditCard, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'exam':
        return { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'homework':
        return { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' };
      default:
        return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Bell className="mr-3 text-purple-600" />
            Personal Notifications
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map(notification => {
                const style = getNotificationStyle(notification.type);
                return (
                  <div key={notification.id} className={`p-5 flex items-start space-x-4 border-l-4 rounded-r-lg bg-white shadow-sm ${style.color.replace('text-', 'border-')}`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg}`}>
                      <style.icon className={`w-5 h-5 ${style.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-3">
                        <Calendar size={12} className="mr-1.5" />
                        <span>Received: {formatDate(notification.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">You have no new personal alerts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;