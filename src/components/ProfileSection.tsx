import React from 'react';
import { Student } from '../types';
import { 
    User, Cake, Phone, Home, Book, BookOpen, 
    Bus, Hash, Users as UsersIcon, GraduationCap, Heart, Shield
} from 'lucide-react';
import { formatDate } from '../utils';

interface ProfileSectionProps {
  student: Student;
}

// A more vibrant, reusable component for each piece of information
const ProfileDetail: React.FC<{ icon: React.ElementType, label: string, value?: string | null, color: string }> = ({ 
  icon: Icon, 
  label, 
  value,
  color
}) => (
  <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border">
    <div className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg mr-4 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
  </div>
);

const ProfileSection: React.FC<ProfileSectionProps> = ({ student }) => {
  if (!student) {
    return <div>Loading profile...</div>;
  }

  return (

      {/* Main Details Grid */}
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