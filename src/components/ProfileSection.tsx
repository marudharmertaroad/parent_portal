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

  const personalDetails = [
    { icon: User, label: "Father's Name", value: student.fatherName, color: 'bg-blue-500' },
    { icon: User, label: "Mother's Name", value: student.motherName, color: 'bg-pink-500' },
    { icon: Cake, label: 'Date of Birth', value: formatDate(student.dob), color: 'bg-orange-500' },
    { icon: Heart, label: 'Religion', value: student.religion, color: 'bg-purple-500' },
  ];

  const academicDetails = [
    { icon: Book, label: 'Class', value: student.class, color: 'bg-green-500' },
    { icon: BookOpen, label: 'Medium', value: student.medium, color: 'bg-teal-500' },
    { icon: Hash, label: 'NIC ID', value: student.nicStudentId, color: 'bg-gray-500' },
    { icon: Shield, label: 'RTE Status', value: student.isRte ? 'Yes' : 'No', color: student.isRte ? 'bg-green-600' : 'bg-red-500' },
  ];
  
  const contactDetails = [
    { icon: Phone, label: 'Contact Number', value: student.contact, color: 'bg-indigo-500' },
    { icon: Bus, label: 'Bus Route', value: student.bus_route, color: 'bg-yellow-500' },
    { icon: Home, label: 'Address', value: student.address, color: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-lg text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 border-4 border-white/50 rounded-full flex items-center justify-center font-bold text-6xl">
              {student.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold">{student.name}</h2>
            <p className="text-xl text-blue-200 mt-1">
              Class: {student.class} | SR No: {student.srNo}
            </p>
          </div>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="space-y-8">
        {/* Personal & Family Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md border">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-3">
                <UsersIcon size={24} className="text-blue-500" />
                Personal & Family Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {personalDetails.map(detail => <ProfileDetail key={detail.label} {...detail} />)}
            </div>
        </div>

        {/* Academic & Transport Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md border">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-3">
                <GraduationCap size={24} className="text-green-500" />
                Academic & Transport Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {academicDetails.map(detail => <ProfileDetail key={detail.label} {...detail} />)}
                {contactDetails.map(detail => <ProfileDetail key={detail.label} {...detail} />)}
            </div>
        </div>
      </div>
    </div>
  );
};