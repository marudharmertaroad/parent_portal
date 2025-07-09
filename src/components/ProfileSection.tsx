// src/components/ProfileSection.tsx (CORRECTED VERSION)

import React from 'react';
import { Student } from '../types';
import { User, Cake, Phone, Home, Book, BookOpen, Bus, Hash, Users as UsersIcon } from 'lucide-react'; // Added UsersIcon for Religion
import { formatDate } from '../utils'; // Import formatDate for consistency

interface ProfileSectionProps {
  student: Student;
}

// Correctly defined ProfileDetail component
const ProfileDetail: React.FC<{ icon: React.ElementType, label: string, value?: string | null }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-4">
    <Icon className="w-5 h-5 text-gray-500 mt-1 mr-4 flex-shrink-0" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || 'N/A'}</p>
    </div>
  </div>
);

const ProfileSection: React.FC<ProfileSectionProps> = ({ student }) => {
  return (
    <div className="space-y-10">
      {/* Personal Details */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
          <ProfileDetail icon={User} label="Father's Name" value={student.fatherName} />
          <ProfileDetail icon={User} label="Mother's Name" value={student.motherName} />
          <ProfileDetail icon={Cake} label="Date of Birth" value={formatDate(student.dob)} />
          <ProfileDetail icon={Phone} label="Contact Number" value={student.contact} />
          <ProfileDetail icon={UsersIcon} label="Religion" value={student.religion} />
          <ProfileDetail icon={Home} label="Address" value={student.address} />
        </div>
      </div>
      
      {/* Academic Details */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Academic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
          <ProfileDetail icon={Hash} label="SR Number" value={student.srNo} />
          <ProfileDetail icon={Book} label="Class" value={student.class} />
          <ProfileDetail icon={BookOpen} label="Medium" value={student.medium} />
          <ProfileDetail icon={Hash} label="NIC ID" value={student.nicStudentId} />
          <ProfileDetail icon={Bus} label="Bus Route" value={student.bus_route} />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;