// src/components/ProfileModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import { Student } from '../types'; // Adjust path if needed
import ProfileSection from './ProfileSection';
import PhotoUpload from './PhotoUpload';


interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl max-w-4xl w-full m-4 max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">Student Full Profile</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <ProfileSection student={student} />
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;