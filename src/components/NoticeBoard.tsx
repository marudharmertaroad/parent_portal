// src/components/NoticeBoard.tsx

import React from 'react';
import { Notice } from '../types';
import { Megaphone, Calendar } from 'lucide-react';
import { formatDate } from '../utils';

interface NoticeBoardProps {
  notices: Notice[];
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices = [] }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
          <Megaphone className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Notice Board</h1>
          <p className="text-gray-600 mt-1">Important announcements and updates from the school.</p>
        </div>
      </div>

      <div className="space-y-6">
        {notices.length > 0 ? (
          notices.map(notice => (
            <div key={notice.id} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800">{notice.title}</h3>
              <div className="flex items-center text-sm text-gray-500 my-2">
                <Calendar size={14} className="mr-2" />
                <span>Posted on: {formatDate(notice.created_at)}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500">There are no new notices at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;