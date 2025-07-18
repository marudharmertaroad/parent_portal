// src/components/NoticeBoard.tsx

import React, { useState } from 'react';
import { Notice } from '../types';
import { formatDate } from '../utils';
import { Megaphone, Calendar, Search, AlertTriangle, CheckCircle, Users, ScrollText, User, ChevronDown } from 'lucide-react';

interface NoticeBoardProps {
  notices: Notice[];
  studentClass: string;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices = [], studentClass }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);

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
  const handleToggleNotice = (noticeId: number) => {
    // If the clicked notice is already open, close it. Otherwise, open it.
    setExpandedNoticeId(prevId => (prevId === noticeId ? null : noticeId));
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - now responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl">
            <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">School Notice Board</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Important announcements and updates.</p>
          </div>
        </div>
        <div className="relative w-full sm:w-auto">
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
      <div className="space-y-3 sm:space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const isExpanded = expandedNoticeId === notice.id;
            const isClassSpecific = !!notice.target_class && notice.target_class !== 'all';
            const noticeColor = isClassSpecific ? 'border-purple-500' : 'border-blue-500';
            
            return (
              <div key={notice.id} className={`bg-white rounded-xl sm:rounded-2xl shadow-md border-l-4 ${noticeColor} overflow-hidden transition-all duration-300`}>
                {/* Clickable Header */}
                <button
                  onClick={() => handleToggleNotice(notice.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50/50"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 bg-gray-100 rounded-full">
                      <ScrollText size={20} sm:size={24} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{notice.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Posted: {formatDate(notice.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 ml-2">
                     <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isClassSpecific ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isClassSpecific ? <User size={12} /> : <Users size={12} />}
                      {isClassSpecific ? `For Class ${notice.target_class}` : 'For All'}
                    </span>
                    <ChevronDown size={24} className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Collapsible Body with Animation */}
                <div className={`transition-all duration-500 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t pt-4">
                      {notice.expires_at && (
                        <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold bg-red-50 text-red-700 px-3 py-1.5 rounded-lg">
                          <AlertTriangle size={16} />
                          Expires on: {formatDate(notice.expires_at)}
                        </div>
                      )}
                      <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {notice.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
            <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
            <p className="text-gray-600 font-medium">No new notices for you.</p>
            <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;