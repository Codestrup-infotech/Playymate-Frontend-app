"use client";

import { useRouter } from "next/navigation";
import { X, Image, Video } from "lucide-react";

export default function CreateContentModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleCreatePost = () => {
    router.push("/home/create-post");
    onClose();
  };

  const handleCreateReel = () => {
    router.push("/home/create-reel");
    onClose();
  };

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal */}
      <div 
        className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl w-[320px] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Create Content
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-3">
          <button
            onClick={handleCreatePost}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
          >
            <div className="p-2 bg-white/20 rounded-lg">
              <Image size={22} />
            </div>
            <span>Post</span>
          </button>

          <button
            onClick={handleCreateReel}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <Video size={22} />
            </div>
            <span>Reel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
