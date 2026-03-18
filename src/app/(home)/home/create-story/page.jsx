"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, Circle, AlertCircle } from "lucide-react";
import { presignStoryUpload, createStory } from "@/app/user/homefeed";

export default function CreateStoryPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please select a valid image or video file (JPEG, PNG, GIF, WebP, MP4, WebM)");
        return;
      }
      
      // Validate file size (max 50MB for stories)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }
      
      setError(null);
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleShare = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Get presigned URL for upload
      const fileName = file.name;
      const mimeType = file.type;
      const sizeBytes = file.size;

      console.log("[CreateStory] Getting presigned URL for:", { fileName, mimeType, sizeBytes });

      const presignData = await presignStoryUpload(fileName, mimeType, sizeBytes, "story");
      
      console.log("[CreateStory] Presigned URL received:", presignData);

      if (!presignData?.upload_url) {
        throw new Error("Failed to get upload URL");
      }

      // Step 2: Upload the file to the presigned URL
      console.log("[CreateStory] Uploading file to storage...");
      
      const uploadResponse = await fetch(presignData.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': mimeType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      console.log("[CreateStory] File uploaded successfully");

      // Step 3: Create the story record in the database
      // API expects media_url field
      const storyData = {
        media_url: presignData.file_url || presignData.wasabi_url,
        media_type: file.type.startsWith("video") ? "video" : "image",
        caption: caption || "",
      };

      console.log("[CreateStory] Creating story with data:", storyData);

      const createdStory = await createStory(storyData);
      
      console.log("[CreateStory] Create story response:", createdStory);

      console.log("[CreateStory] Story created successfully:", createdStory);

      // Navigate back to home on success with refresh flag
      router.push("/home?storyUploaded=true");
    } catch (err) {
      console.error("[CreateStory] Upload error:", err);
      console.error("[CreateStory] Error response data:", err.response?.data);
      console.error("[CreateStory] Error status:", err.response?.status);
      setError(err.response?.data?.message || err.message || "Failed to upload story. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGoBack = () => {
    router.push("/home");
  };

  const handleRemoveFile = () => {
    setImageUrl(null);
    setFile(null);
    setCaption("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1a] p-4 md:p-8">
      <div className="max-w-md mx-auto ">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleGoBack}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Create Story
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Upload Step */}
        {!imageUrl && (
          <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-8 shadow-sm">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Circle size={40} className="text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Share a Story
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Your story will be visible for 24 hours
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-medium rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                <Upload size={20} />
                <span>Select Image or Video</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-4">
                Supported: JPEG, PNG, GIF, WebP, MP4, WebM (max 50MB)
              </p>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {imageUrl && (
          <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-4 shadow-sm">
            <div className="relative p-4 bg-black rounded-lg overflow-hidden mb-4 px-4">
              {file?.type.startsWith("video") ? (
                <video
                  src={imageUrl}
                  alt="Story preview"
                  className="w-full h-full object-contain"
                  controls
                />
              ) : (
                <img
                  src={imageUrl}
                  alt="Story preview"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Caption (optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                maxLength={150}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0f0f1a] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{caption.length}/150</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRemoveFile}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={isUploading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Sharing...
                  </span>
                ) : (
                  "Share Story"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
