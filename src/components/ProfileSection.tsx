// src/components/ProfileSection.tsx

import React from 'react';
import { Student } from '../types';
import { User, Cake, Phone, Mail, Home, Book, Bus, Hash } from 'lucide-react';

interface ProfileSectionProps {
  student: Student;
}

const ProfileDetail: React.FC<{ icon: React.ElementType, label: string, z-50 p-4">
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
          )} value?: string | number | null }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-3">
    <Icon className="w-5 h-5 text-gray-500 mt-1 mr-4" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || 'N/A'}</p>
    </div>
  </div>
);

const ProfileSection: React.FC<ProfileSectionProps> = ({ student }) => {
  return (
    <div className="space-y-8">
      {/* Personal Details */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 divide-y md:divide-y-0">
          <ProfileDetail icon={User} label="Father's Name" value={student.fatherName} />
          <ProfileDetail icon={User} label="Mother's Name" value={student.motherName} />
          <ProfileDetail icon={Cake} label="Date of Birth" value={new Date(student.dob).toLocaleDateString('en-GB')} />
          <ProfileDetail icon={Phone} label="Contact Number" value={student.contact} />
          <ProfileDetail icon={Home} label="Address" value={student.address} />
        </div>
      </div>
      
      {/* Academic Details */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Academic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 divide-y md:divide-y-0">
          <ProfileDetail icon={Book} label="Class" value={student.class} />
          <ProfileDetail icon={BookOpen} label="Medium" value={student.medium} />
          <ProfileDetail icon={Hash} label="SR Number" value={student.srNo} />
          <ProfileDetail icon={Bus} label="Bus Route" value={student.bus_route} />
          <ProfileDetail icon={Hash} label="NIC ID" value={student.nicStudentId} />
          <ProfileDetail icon={User} label="Religion" value={student.religion} />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;