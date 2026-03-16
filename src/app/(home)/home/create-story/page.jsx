"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, Circle } from "lucide-react";

export default function CreateStoryPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleShare = async () => {
    setIsUploading(true);
    // TODO: Implement story upload logic here
    // Simulating upload delay
    setTimeout(() => {
      setIsUploading(false);
      router.push("/home");
    }, 2000);
  };

  const handleGoBack = () => {
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1a] p-4 md:p-8">
      <div className="max-w-md mx-auto">
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
                <span>Select Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {imageUrl && (
          <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-4 shadow-sm">
            <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden mb-4">
              <img
                src={imageUrl}
                alt="Story preview"
                className="w-full h-full object-contain"
              />
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0f0f1a] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImageUrl(null);
                  setFile(null);
                }}
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

        {/* Coming Soon Notice */}
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            📱 Story feature is under development. This is a placeholder page.
          </p>
        </div>
      </div>
    </div>
  );
}
