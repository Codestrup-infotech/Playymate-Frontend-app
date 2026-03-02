"use client";
import { useState, useRef } from "react";
import { MessageCircle, Heart, Send, ShoppingCart, MapPin, Users, Trophy, Image, X } from "lucide-react";

export default function HomePage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);
  
  const handleSelectFromComputer = () => {
    if (fileInputRef?.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);
      // Handle file upload here
      closeUploadModal();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Feed Section */}
      <div className="lg:col-span-2 space-y-6">

        {/* Stories */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* First Story - Current User with Upload */}
          <div key="current-user" className="flex flex-col items-center">
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-orange-500 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={openUploadModal}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                  <img 
                    src="data:image/png;base64,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" 
                    alt="Your Story" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Plus Button */}
              <div 
                className="absolute -bottom-1 -right-1
                                w-6 h-6
                                bg-black
                                rounded-full
                                flex items-center justify-center
                                border-2 border-white
                                text-white text-sm font-bold
                                cursor-pointer hover:bg-gray-900 transition-colors"
                onClick={openUploadModal}
              >
                +
              </div>
            </div>
            <span className="text-sm mt-2">You</span>
          </div>

          {/* Other Stories */}
          {[2,3,4,5].map((item) => (
            <div key={item} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 p-[2px]">
                <img 
                  src="data:image/png;base64,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" 
                  alt={`User ${item}`} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-sm mt-2">User {item}</span>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={closeUploadModal}
          >
            <div 
              className="bg-white rounded-xl p-8 w-[400px] text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={closeUploadModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>

              {/* Drag & Drop Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 hover:border-purple-500 transition-colors cursor-pointer">
                <Image size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Drag photos and videos here</p>
              </div>

              {/* Select Button */}
              <button 
                onClick={handleSelectFromComputer}
                className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full"
              >
                Select from computer
              </button>

              {/* Hidden File Input */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,video/*" 
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}

        {/* Post Card */}
        <div className="bg-[#1a1a2e] rounded-xl p-4">
          <div className="h-60 bg-gray-700 rounded-lg mb-4"></div>
          
          {/* Post Card Footer */}
          <div className="flex justify-between items-center mt-4 text-sm">
            {/* Left Actions */}
            <div className="flex items-center gap-6">
              {/* Comment */}
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <MessageCircle size={20} />
                <span>10</span>
              </button>
              {/* Like */}
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Heart size={20} />
                <span>122</span>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
              {/* Share */}
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Send size={20} />
              </button>
              {/* Add to Cart */}
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-gray-800"></div>
            </div>
            <div>
              <h4 className="font-semibold">John Doe</h4>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <MapPin size={14} />
                New York, USA
              </p>
            </div>
            <span className="ml-auto text-xs text-gray-400">Sponsored</span>
          </div>

          {/* Large Image */}
          <div className="h-72 bg-gray-700"></div>

          {/* Bottom Section */}
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-6 text-gray-400">
              <span className="flex items-center gap-2">
                <MessageCircle size={18} />
                24
              </span>
              <span className="flex items-center gap-2">
                <Heart size={18} />
                156
              </span>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-2 rounded-lg font-semibold">
              Book Now
            </button>
          </div>
        </div>

        {/* Suggested for You */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Suggested for you</h3>
            <span className="text-purple-400 text-sm cursor-pointer">See All</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Suggestion Card 1 */}
            <div className="bg-[#1a1a2e] rounded-xl p-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 p-[2px] mb-3">
                  <div className="w-full h-full rounded-full bg-gray-800"></div>
                </div>
                <h4 className="font-semibold">Sarah Wilson</h4>
                <p className="text-xs text-gray-400 mb-3">Popular</p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 py-2 rounded-lg text-sm font-semibold">
                  Follow
                </button>
              </div>
            </div>

            {/* Suggestion Card 2 */}
            <div className="bg-[#1a1a2e] rounded-xl p-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 p-[2px] mb-3">
                  <div className="w-full h-full rounded-full bg-gray-800"></div>
                </div>
                <h4 className="font-semibold">Mike Johnson</h4>
                <p className="text-xs text-gray-400 mb-3">Popular</p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 py-2 rounded-lg text-sm font-semibold">
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended for You - Tournament Card */}
        <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
          {/* Image with Overlay */}
          <div className="relative h-64 bg-gray-700">
            <span className="absolute top-3 left-3 bg-purple-600 text-xs px-2 py-1 rounded">
              Volleyball
            </span>
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-800"></div>
              </div>
              <span className="text-sm">John Doe</span>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Weekend Volleyball Tournament</h3>
            <p className="text-sm text-gray-400 flex items-center gap-1 mb-4">
              <MapPin size={14} />
              Central Sports Arena, Los Angeles
            </p>

            {/* Joined and Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  12/20 Joined
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={16} />
                  8
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={16} />
                  45
                </span>
              </div>
            </div>

            {/* Join Button */}
            <button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 py-3 rounded-lg font-semibold">
              Join Team
            </button>
          </div>
        </div>

      </div>

      {/* Right Panel */}
      <div className="hidden lg:block space-y-6">

        <div className="bg-[#1a1a2e] p-4 rounded-xl">
          <h3 className="mb-4 font-semibold">Suggested for you</h3>
          <button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 py-2 rounded-lg">
            Follow
          </button>
        </div>

      </div>
    </div>
  );
}
