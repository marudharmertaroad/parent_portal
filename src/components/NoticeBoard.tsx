// src/components/NoticeBoard.tsx

import React, { useState } from 'react';
import { Notice } from '../types';
import { formatDate } from '../utils';
import { Megaphone, Calendar, Search, AlertTriangle, Check, Users } from 'lucide-react';

interface NoticeBoardProps {
  notices: Notice[];
  studentClass: string;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices = [], studentClass }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter notices to show only active ones and those targeted to the student
  const activeNotices = notices.filter(notice => {
    const isTargeted = !notice.target_class || notice.target_class === 'all' || notice.target_class === studentClass;
    const isActive = notice.is_active;
    // An expiry date in the past also makes a notice inactive
    const isExpired = notice.expires_at ? new Date(notice.expires_at) < new Date() : false;

    return isTargeted && isActive && !isExpired;
  });

  const filteredNotices = activeNotices.filter(notice =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">School Notice Board</h1>
            <p className="text-gray-600 mt-1">Important announcements and updates.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Notice List */}
      <div className="space-y-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const isClassSpecific = !!notice.target_class && notice.target_class !== 'all';
            const noticeColor = isClassSpecific ? 'border-purple-500' : 'border-blue-500';

            return (
              <div key={notice.id} className={`bg-white p-6 rounded-2xl shadow-md border-l-4 ${noticeColor} hover:shadow-lg transition-shadow`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isClassSpecific ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isClassSpecific ? <User size={12} /> : <Users size={12} />}
                        {isClassSpecific ? `For Class ${notice.target_class}` : 'For All'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-2" />
                      <span>Posted on: {formatDate(notice.created_at)}</span>
                    </div>
                  </div>
                  {notice.expires_at && (
                    <div className="flex-shrink-0 flex items-center gap-2 text-sm font-semibold bg-red-50 text-red-700 px-3 py-1.5 rounded-lg">
                      <AlertTriangle size={16} />
                      Expires on: {formatDate(notice.expires_at)}
                    </div>
                  )}
                </div>
                <div className="mt-4 border-t pt-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
            <Check size={48} className="mx-auto text-green-400 mb-4" />
            <p className="text-gray-600 font-medium">No new notices for you.</p>
            <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;