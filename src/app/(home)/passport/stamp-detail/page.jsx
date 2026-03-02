'use client';

import Link from 'next/link';

export default function StampDetailPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] pb-24">
      {/* Header with Back */}
      <div className="flex items-center gap-4 px-4 pt-6 pb-4">
        <Link href="/passport/stamps">
          <button className="text-white text-xl">←</button>
        </Link>
        <h1 className="text-xl font-bold text-white">Stamp Detail</h1>
      </div>

      {/* Full Card */}
      <div className="px-4">
        <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-2xl overflow-hidden border border-purple-500/30">
          {/* Sport Graphic Area */}
          <div className="h-64 flex flex-col items-center justify-center relative">
            {/* Decorative circles */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-pink-500/20 rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-yellow-500/20 rounded-full"></div>
            
            {/* Tennis Icon */}
            <span className="text-8xl relative z-10">🎾</span>
            <h2 className="text-white text-3xl font-bold mt-4 relative z-10">Dubai</h2>
            <p className="text-pink-300 text-lg mt-1 relative z-10">Tennis</p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="px-4 mt-6">
        <div className="bg-[#13132b] rounded-2xl p-5 border border-purple-500/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Location</span>
              <span className="text-white font-medium">Dubai</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Activity</span>
              <span className="text-white font-medium">Tennis</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Date Earned</span>
              <span className="text-white font-medium">Jan 15, 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6">
        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-xl font-medium border border-gray-600 text-white hover:bg-gray-800 transition-colors">
            📤 Share
          </button>
          <button className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25">
            🗺️ View on map
          </button>
        </div>
      </div>
    </div>
  );
}
