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
  // [MOBILE COMPACT] On mobile (default), the layout is simpler. On sm screens and up, it expands.
  <div className="flex items-center p-3 sm:p-4 bg-white rounded-xl shadow-sm border">
    <div className={`flex-shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg mr-3 sm:mr-4 ${color}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </div>
    <div>
      <p className="text-xs sm:text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base sm:text-lg font-semibold text-gray-800 truncate">{value || 'N/A'}</p>
    </div>
  </div>
);


const ProfileSection: React.FC<ProfileSectionProps> = ({ student }) => {
  if (!student) {
    return <div>Loading profile...</div>;
  }

  const allDetails = [
    { icon: User, label: "Father's Name", value: student.fatherName, color: 'bg-blue-500' },
    { icon: User, label: "Mother's Name", value: student.motherName, color: 'bg-pink-500' },
    { icon: Cake, label: 'Date of Birth', value: formatDate(student.dob), color: 'bg-orange-500' },
    { icon: Phone, label: 'Contact Number', value: student.contact, color: 'bg-indigo-500' },
    
    { icon: Book, label: 'Class', value: student.class, color: 'bg-green-500' },
    { icon: BookOpen, label: 'Medium', value: student.medium, color: 'bg-teal-500' },
    { icon: Hash, label: 'SR Number', value: student.srNo, color: 'bg-slate-500' },
    { icon: Hash, label: 'NIC ID', value: student.nicStudentId, color: 'bg-gray-500' },

    { icon: Shield, label: 'RTE Status', value: student.isRte ? 'Yes' : 'No', color: student.isRte ? 'bg-green-600' : 'bg-red-500' },
    { icon: Bus, label: 'Bus Route', value: student.bus_route, color: 'bg-yellow-500' },
    { icon: Heart, label: 'Religion', value: student.religion, color: 'bg-purple-500' },
    { icon: Home, label: 'Address', value: student.address, color: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Profile Card - Now responsive */}
      {/* [MOBILE COMPACT] Reduced padding on mobile */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 rounded-2xl shadow-lg text-white">
        {/* [MOBILE COMPACT] Stack vertically on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
          <div className="relative">
            {/* [MOBILE COMPACT] Smaller avatar on mobile */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/20 border-4 border-white/50 rounded-full flex items-center justify-center font-bold text-5xl sm:text-6xl">
              {student.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            {/* [MOBILE COMPACT] Smaller text on mobile */}
            <h2 className="text-3xl sm:text-4xl font-bold">{student.name}</h2>
            <p className="text-lg sm:text-xl text-blue-200 mt-1">
              Class: {student.class} | SR No: {student.srNo}
            </p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-3">
            <GraduationCap size={20} sm:size={24} className="text-gray-700" />
            Student Information
        </h3>
        {/* [MOBILE COMPACT] The grid is now 2 columns on mobile, then 3 on xl screens */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {allDetails.map(detail => <ProfileDetail key={detail.label} {...detail} />)}
        </div>
      </div>
    </div>
  );
};


export default ProfileSection;