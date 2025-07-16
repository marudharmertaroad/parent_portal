// src/components/PhotoUpload.tsx

import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Student } from '../types';
import { Camera, User, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  student: Student;
    onUploadComplete: () => void;

}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ student, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(student.photoUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !student) return;

    setIsUploading(true);
    const fileExt = selectedFile.name.split('.').pop();
    const filePath = `${student.srNo}/${Date.now()}.${fileExt}`;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User session not found. Please log in again.");
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('student-photos').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('students')
        .update({ photo_url: urlData.publicUrl })
        .eq('sr_no', student.srNo);

      if (updateError) throw updateError;
      
      alert('Photo updated successfully!');
      window.location.reload();
            onUploadComplete();

      
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 md:w-40 md:h-40">
        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
          {previewUrl ? (
            <img src={previewUrl} alt="Student" className="w-full h-full object-cover" />
          ) : (
            <User size={64} className="text-gray-400" />
          )}
        </div>
        <label htmlFor="photo-input" className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 shadow-md">
          <Camera size={20} />
          <input id="photo-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      {selectedFile && (
        <div className="text-center">
          <p className="text-sm text-gray-600 truncate max-w-xs">{selectedFile.name}</p>
          <button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="mt-2 text-sm font-semibold text-blue-600 hover:underline disabled:text-gray-400"
          >
            {isUploading ? <Loader2 className="animate-spin inline-block" /> : "Confirm & Upload"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;