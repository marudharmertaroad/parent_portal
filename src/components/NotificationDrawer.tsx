// src/components/NotificationDrawer.tsx

import React from 'react';
import { Notification } from '../types'; // Make sure your types file exports the Notification interface
import { formatDate } from '../utils';
import { Bell, X, User, Users, Megaphone, AlertTriangle, BookCopy, MessageSquare, Target, Calendar } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, notifications = [] }) => {
  const drawerClasses = `
    fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
  `;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'fee': return { icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'homework': return { icon: BookCopy, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'exam': return { icon: Target, color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'event': return { icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'urgent': return { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      default: return { icon: Megaphone, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose}></div>}

      {/* Drawer */}
      <div className={drawerClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map(notification => {
                   const { icon: Icon, color, bgColor } = getNotificationIcon(notification.type);
                   return (
                    <div key={notification.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full mt-1 ${bgColor}`}>
                          <Icon size={20} className={color} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(notification.created_at)}</p>
                        </div>
                      </div>
                    </div>
                   )
                })}
              </div>
            ) : (
              <div className="text-center p-12 text-gray-500 flex flex-col items-center justify-center h-full">
                <Bell size={40} className="mx-auto mb-4 text-gray-300" />
                <p className="font-semibold">No new notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;