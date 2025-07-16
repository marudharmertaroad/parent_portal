import React, { useState } from 'react';
import { Student } from '../types';
import { User, Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react';

interface ProfileSectionProps {
  student: Student;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ student }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState(student);

  const handleSave = () => {
    // Here you would typically make an API call to update the student information
    console.log('Saving student data:', editedStudent);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedStudent(student);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {student.profileImage ? (
                <img 
                  src={student.profileImage} 
                  alt={student.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold">{student.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-blue-100">Class {student.class} - Section {student.section}</p>
              <p className="text-blue-100">Roll Number: {student.rollNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User size={20} className="mr-2 text-blue-500" />
            Personal Information
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedStudent.name}
                  onChange={(e) => setEditedStudent({...editedStudent, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{student.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedStudent.dateOfBirth}
                  onChange={(e) => setEditedStudent({...editedStudent, dateOfBirth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-500" />
                  {new Date(student.dateOfBirth).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{student.admissionNumber}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class & Section
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {student.class} - {student.section}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedStudent.email}
                    onChange={(e) => setEditedStudent({...editedStudent, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                    <Mail size={16} className="mr-2 text-gray-500" />
                    {student.email}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedStudent.contactNumber}
                    onChange={(e) => setEditedStudent({...editedStudent, contactNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                    <Phone size={16} className="mr-2 text-gray-500" />
                    {student.contactNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Parent Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedStudent.fatherName}
                    onChange={(e) => setEditedStudent({...editedStudent, fatherName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{student.fatherName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedStudent.motherName}
                    onChange={(e) => setEditedStudent({...editedStudent, motherName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{student.motherName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Address</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Address
              </label>
              {isEditing ? (
                <textarea
                  value={editedStudent.address}
                  onChange={(e) => setEditedStudent({...editedStudent, address: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-start">
                  <MapPin size={16} className="mr-2 text-gray-500 mt-0.5" />
                  {student.address}
                </p>
              )}
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;