// src/components/ProfileModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import { Student } from '../types';
import ProfileSection from './ProfileSection';
import PhotoUpload from './PhotoUpload';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen) return null;

  // This function will simply reload the page to get the latest student data (including photo)
  const handlePhotoUploadSuccess = () => {
    window.location.reload();
  };

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
          {/* Use flexbox for a more natural layout than a rigid grid */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Photo Upload Section (takes up less space) */}
            <div className="flex-shrink-0 lg:w-1/4">
              <PhotoUpload 
                student={student} 
                onUploadComplete={handlePhotoUploadSuccess} 
              />
            </div>

            {/* Profile Details Section (takes up all remaining space) */}
            <div className="flex-grow bg-white p-6 rounded-2xl border shadow-sm">
              <ProfileSection student={student} />
            </div>

          </div>
        </div>
        {/* --- END OF CORRECTION --- */}

      </div>
    </div>
  );
};

export default ProfileModal;