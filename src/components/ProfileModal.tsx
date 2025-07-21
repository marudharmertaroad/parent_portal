// src/components/ProfileModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import { Student } from '../types';
import ProfileSection from './ProfileSection';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full m-4 max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Student Profile</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto">
          {/* --- THIS IS THE NEW UNIFIED CARD LAYOUT --- */}
          <div className="bg-white rounded-2xl shadow-lg border p-6 md:p-8 flex flex-col lg:flex-row gap-8">
            
            {/* Photo Upload Column (takes up 1/4 of the space on large screens) */}
            <div className="lg:w-1/4 flex-shrink-0">
              <PhotoUpload 
                student={student} 
                onUploadComplete={handlePhotoUploadSuccess} 
              />
            </div>

            {/* Profile Details Column (takes up the remaining 3/4) */}
            <div className="lg:w-3/4">
              <ProfileSection student={student} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;