"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { userService } from "@/services/user";

export default function CoverPhotoUpload({ 
  userId, 
  currentCoverPhoto, 
  onCoverPhotoUpdate,
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
      const presignResponse = await userService.getCoverPhotoPresign(
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

      // Step 2: Upload file to presigned URL
      await userService.uploadCoverPhotoToPresigned(upload_url, file, file.type);
      
      setUploadProgress(70);

      // Step 3: Confirm the upload
      const confirmResponse = await userService.confirmCoverPhoto(userId, file_url, file_key);
      
      console.log("=== COVER PHOTO CONFIRM RESPONSE ===");
      console.log("confirmResponse:", confirmResponse);
      console.log("confirmResponse.data:", confirmResponse?.data);
      console.log("confirmResponse.data.data:", confirmResponse?.data?.data);
      console.log("=====================================");
      
      setUploadProgress(100);

      // Get the final cover photo URL from the response
      const finalCoverPhotoUrl = confirmResponse.data?.data?.cover_photo?.url || confirmResponse.data?.data?.cover_photo || confirmResponse.data?.cover_photo?.url || file_url;
      
      console.log("=== FINAL COVER PHOTO URL ===");
      console.log("finalCoverPhotoUrl:", finalCoverPhotoUrl);
      console.log("============================");
      
      // Notify parent component
      if (onCoverPhotoUpdate) {
        onCoverPhotoUpdate(finalCoverPhotoUrl);
      }

    } catch (err) {
      console.error('Cover photo upload error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload cover photo');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteCoverPhoto = async () => {
    if (!currentCoverPhoto) return;

    setError(null);
    setIsUploading(true);

    try {
      await userService.deleteCoverPhoto(userId);
      
      // Notify parent component that cover photo was deleted
      if (onCoverPhotoUpdate) {
        onCoverPhotoUpdate(null);
      }
    } catch (err) {
      console.error('Cover photo delete error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete cover photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="cover-photo-upload">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Button */}
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImageIcon size={16} />
            Edit Cover Photo
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}

      {/* Upload progress bar */}
      {isUploading && (
        <div className="mt-2">
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
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
