import api from '@/services/api';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Step 1: Get presigned URL for cover photo upload
 * @param {string} userId - User ID
 * @param {string} fileName - File name
 * @param {string} mimeType - MIME type of the file
 * @param {number} sizeBytes - Size of the file in bytes
 */
export const getCoverPhotoPresign = async (userId, fileName, mimeType, sizeBytes) => {
  try {
    const res = await api.post(`/users/${userId}/cover-photo/presign`, {
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes
    });
    return res.data;
  } catch (error) {
    console.error('Error getting cover photo presign URL:', error);
    throw error;
  }
};

/**
 * Step 2: Confirm cover photo upload
 * @param {string} userId - User ID
 * @param {string} fileUrl - The file URL from presign response
 * @param {string} fileKey - The file key from presign response
 */
export const confirmCoverPhoto = async (userId, fileUrl, fileKey) => {
  try {
    const res = await api.post(`/users/${userId}/cover-photo/confirm`, {
      file_url: fileUrl,
      file_key: fileKey
    });
    return res.data;
  } catch (error) {
    console.error('Error confirming cover photo:', error);
    throw error;
  }
};

/**
 * Delete cover photo
 * @param {string} userId - User ID
 */
export const deleteCoverPhoto = async (userId) => {
  try {
    const res = await api.delete(`/users/${userId}/cover-photo`);
    return res.data;
  } catch (error) {
    console.error('Error deleting cover photo:', error);
    throw error;
  }
};

/**
 * Upload file to presigned URL
 * @param {string} presignedUrl - The presigned upload URL
 * @param {File} file - The file to upload
 * @param {string} contentType - Content type of the file
 */
export const uploadToPresignedUrl = async (presignedUrl, file, contentType) => {
  try {
    const res = await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': contentType },
    });
    return res;
  } catch (error) {
    console.error('Error uploading to presigned URL:', error);
    throw error;
  }
};

export default {
  getCoverPhotoPresign,
  confirmCoverPhoto,
  deleteCoverPhoto,
  uploadToPresignedUrl
};
