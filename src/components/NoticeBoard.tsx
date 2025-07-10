// src/components/NoticeBoard.tsx (ENHANCED UI VERSION)

import React, { useState } from 'react';
import { Notice } from '../types';
import { Megaphone, Calendar, Search } from 'lucide-react';
import { formatDate } from '../utils';

interface NoticeBoardProps {
  notices: Notice[];
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotices = notices.filter(notice =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">School Notice Board</h1>
            <p className="text-gray-600 mt-1">Important announcements and updates from the school.</p>
          </div>
        </div>
        <div className="relative mt-4 sm:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notice List */}
      <div className="space-y-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="bg-white p-6 border-l-4 border-blue-500 rounded-r-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800">{notice.title}</h3>
              <div className="flex items-center text-sm text-gray-500 my-2">
                <Calendar size={14} className="mr-2" />
                <span>Posted on: {formatDate(notice.created_at)}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mt-3">{notice.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
            <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No notices found.</p>
            <p className="text-gray-500 text-sm mt-1">Please check back later for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;