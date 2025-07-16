// src/components/ProfileSection.tsx

import React from 'react';
import { Student } from '../types';
import { User, Cake, Phone, Home, Book, BookOpen, Bus, Hash, Heart, Shield } from 'lucide-react';
import { formatDate } from '../utils';

interface ProfileSectionProps {
  student: Student;
}

const ProfileDetail: React.FC<{ icon: React.ElementType, label: string, value?: string | null }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
    <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
  </div>
);

const ProfileSection: React.FC<ProfileSectionProps> = ({ student }) => {
  if (!student) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-2">
      {/* Group 1 */}
      <ProfileDetail icon={User} label="Father's Name" value={student.fatherName} />
      <ProfileDetail icon={User} label="Mother's Name" value={student.motherName} />
      <ProfileDetail icon={Cake} label="Date of Birth" value={formatDate(student.dob)} />
      <ProfileDetail icon={Phone} label="Contact" value={student.contact} />

      {/* Group 2 */}
      <ProfileDetail icon={Book} label="Class" value={student.class} />
      <ProfileDetail icon={Hash} label="SR Number" value={student.srNo} />
      <ProfileDetail icon={BookOpen} label="Medium" value={student.medium} />
      <ProfileDetail icon={Shield} label="RTE Status" value={student.isRte ? 'Yes' : 'No'} />

      {/* Group 3 */}
      <ProfileDetail icon={Bus} label="Bus Route" value={student.bus_route} />
      <ProfileDetail icon={Heart} label="Religion" value={student.religion} />
      <ProfileDetail icon={Hash} label="NIC ID" value={student.nicStudentId} />
      <ProfileDetail icon={Home} label="Address" value={student.address} />
    </div>
  );
};

export default ProfileSection;