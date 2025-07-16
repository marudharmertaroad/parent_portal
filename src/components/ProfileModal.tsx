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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full m-4 max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Student Profile</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Photo Upload Section */}
            <div className="lg:col-span-1">
              <PhotoUpload student={student} onUploadComplete={onDataRefresh} />
            </div>
            {/* Profile Details Section */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border shadow-sm">
              <ProfileSection student={student} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;