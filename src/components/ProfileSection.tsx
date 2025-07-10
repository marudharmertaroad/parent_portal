// src/components/ProfileSection.tsx (READ-ONLY, POLISHED UI)

import React from 'react';
import { Student } from '../types';
import { 
    User, Cake, Phone, Home, Book, BookOpen, 
    Bus, Hash, Users as UsersIcon, Mail 
} from 'lucide-react';
import { formatDate } from '../utils';

interface ProfileSectionProps {
  student: Student;
}

// A small, reusable component to display each piece of information
const ProfileDetail: React.FC<{ icon: React.ElementType, label: string, value?: string | null }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 mr-4">
        <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
  </div>
);

const ProfileSection: React.FC<ProfileSectionProps> = ({ student }) => {
  if (!student) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-10">
      {/* Personal Details Card */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">
          Personal Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
          <ProfileDetail icon={User} label="Father's Name" value={student.fatherName} />
          <ProfileDetail icon={User} label="Mother's Name" value={student.motherName} />
          <ProfileDetail icon={Cake} label="Date of Birth" value={formatDate(student.dob)} />
          <ProfileDetail icon={Phone} label="Contact Number" value={student.contact} />
          <ProfileDetail icon={UsersIcon} label="Religion" value={student.religion} />
          <ProfileDetail icon={Home} label="Address" value={student.address} />
        </div>
      </div>
      
      {/* Academic Details Card */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">
          Academic Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
          <ProfileDetail icon={Hash} label="SR Number" value={student.srNo} />
          <ProfileDetail icon={Book} label="Class" value={student.class} />
          <ProfileDetail icon={BookOpen} label="Medium" value={student.medium} />
          <ProfileDetail icon={Hash} label="NIC ID" value={student.nicStudentId} />
          <ProfileDetail icon={Bus} label="Bus Route" value={student.bus_route} />
          <ProfileDetail icon={User} label="RTE Status" value={student.isRte ? 'Yes' : 'No'} />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;