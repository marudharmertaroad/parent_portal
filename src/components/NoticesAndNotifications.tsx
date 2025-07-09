// src/components/NoticesAndNotifications.tsx

import React, { useState } from 'react';
import { Notice, Notification } from '../types';
import { Bell, Megaphone, X, Calendar } from 'lucide-react';
import { formatDate } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  notifications: Notification[];
}

const NoticesAndNotifications: React.FC<Props> = ({ isOpen, onClose, notices, notifications }) => {
  const [activeTab, setActiveTab] = useState('notices');

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Updates Center</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b p-2 bg-gray-50">
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex-1 py-3 font-medium transition-all ${activeTab === 'notices' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            <Megaphone className="inline-block mr-2" size={18} /> General Notices
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 font-medium transition-all ${activeTab === 'notifications' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
          >
            <Bell className="inline-block mr-2" size={18} /> Personal Alerts
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'notices' && (
            <div className="space-y-4">
              {notices.length >Excellent! I'm thrilled to hear the main dashboard is loading and the core connection is working. That was the hardest part.

You are right, the `Header`, `NoticesAndNotifications`, and `ProfileSection` components are the final pieces needed to make the portal fully interactive. Let's build them out now.

We will do this in three parts:
1.  Create the `NoticesAndNotifications.tsx` modal.
2.  Create the `ProfileSection.tsx` component.
3.  Update the `StudentPortal.tsx` to correctly show these modals when the header icons are clicked.

---

### **Step 1: The `NoticesAndNotifications.tsx` Modal**

This component will be a modal that appears when the user clicks the bell icon. It will have tabs to switch between viewing school-wide notices and personal notifications.

**Action:** Create a new file at `src/components/NoticesAndNotifications.tsx` and paste this code into it.

```tsx
// src/components/NoticesAndNotifications.tsx

import React, { useState } from 'react';
import { Notice, Notification } from '../types';
import { Bell, Megaphone, X } from 'lucide-react';
import { formatDate } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  notifications: Notification[]; // We'll add this later
}

const NoticesAndNotifications: React.FC<Props> = ({ isOpen, onClose, notices, notifications = [] }) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'notifications'>('notices');

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center 0 ? notices.map(notice => (
                <div key={notice.id} className="p-4 border rounded-lg bg-white">
                  <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-2">Posted on: {formatDate(notice.created_at)}</p>
                  <p className="text-gray-700">{notice.content}</p>
                </div>
              )) : <p className="text-center text-gray-500 py-8">No general notices available.</p>}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map(notification => (
                <div key={notification.id} className={`p-4 border rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                   <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                   <p className="text-sm text-gray-500 mt-1 mb-2">Received: {formatDate(notification.created_at)}</p>
                   <p className="text-gray-700">{notification.message}</p>
                </div>
              )) : <p className="text-center text-gray-500 py-8">No personal alerts.</p>}
            </div>
          )}
        </div>
  );
};

export default NoticesAndNotifications;