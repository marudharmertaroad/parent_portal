// src/components/NotificationDrawer.tsx

import React from 'react';
import { Notice } from '../types';
import { formatDate } from '../utils';
import { Bell, X, Megaphone, User, Users } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, notices = [] }) => {
  const drawerClasses = `
    fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
  `;

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
            {notices.length > 0 ? (
              <div className="divide-y">
                {notices.map(notice => {
                   const isClassSpecific = !!notice.target_class && notice.target_class !== 'all';
                   return (
                    <div key={notice.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full mt-1 ${isClassSpecific ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          {isClassSpecific ? <User size={20} className="text-purple-600" /> : <Users size={20} className="text-blue-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{notice.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(notice.created_at)}</p>
                        </div>
                      </div>
                    </div>
                   )
                })}
              </div>
            ) : (
              <div className="text-center p-12 text-gray-500">
                <Megaphone size={40} className="mx-auto mb-4" />
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