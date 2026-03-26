"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { userService } from "@/services/user";

export default function AvatarUpload({ 
  userId, 
  currentAvatar, 
  onAvatarUpdate,
  isDark = false 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL
      setUploadProgress(20);
      const presignResponse = await userService.getAvatarPresign(
        userId,
        file.name,
        file.type,
        file.size
      );
      
      const { upload_url, file_url, file_key } = presignResponse.data?.data || presignResponse.data;
      
      if (!upload_url) {
        throw new Error('Failed to get upload URL');
      }

      setUploadProgress(40);

      // Step 2: Upload file to presigned URL (directly to storage)
      await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'image/jpeg'
        }
      });
      
      setUploadProgress(70);

      // Step 3: Confirm the upload
      const confirmResponse = await userService.confirmAvatar(userId, file_url, file_key);
      
      setUploadProgress(100);

      // Get the final avatar URL from the response
      const newAvatarUrl = confirmResponse.data?.data?.profile_image_url || confirmResponse.data?.profile_image_url || file_url;
      
      // Notify parent component
      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }

    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="avatar-upload">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Button - appears on hover over avatar */}
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        title="Change Profile Photo"
      >
        {isUploading ? (
          <Loader2 size={24} className="text-white animate-spin" />
        ) : (
          <Camera size={24} className="text-white" />
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-xs mt-2 absolute -bottom-6 left-0 right-0 text-center">{error}</p>
      )}

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl">
          <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
