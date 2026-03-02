'use client';

import Link from 'next/link';
import { useState } from 'react';

const stamps = [
  { id: 1, activity: "Tennis", location: "Tokyo", date: "Jan 15, 2026", icon: "🎾", color: "from-yellow-400 to-orange-500" },
  { id: 2, activity: "Football", location: "London", date: "Dec 20, 2025", icon: "⚽", color: "from-green-400 to-blue-500" },
  { id: 3, activity: "Swimming", location: "Bali", date: "Nov 10, 2025", icon: "🏊", color: "from-cyan-400 to-blue-500" },
  { id: 4, activity: "Café Hopping", location: "Paris", date: "Oct 5, 2025", icon: "☕", color: "from-amber-400 to-brown-500" },
  { id: 5, activity: "Running", location: "New York", date: "Sep 15, 2025", icon: "🏃", color: "from-pink-400 to-red-500" },
  { id: 6, activity: "Cycling", location: "Amsterdam", date: "Aug 20, 2025", icon: "🚴", color: "from-orange-400 to-red-500" },
];

export default function StampsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStamps = stamps.filter(stamp =>
    stamp.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stamp.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d1a] pb-24">
      {/* Header with Back */}
      <div className="flex items-center gap-4 px-4 pt-6 pb-4">
        <Link href="/passport">
          <button className="text-white text-xl">←</button>
        </Link>
        <h1 className="text-xl font-bold text-white">Stamps Collection</h1>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="bg-[#13132b] rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search stamps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-gray-500 flex-1 outline-none"
          />
        </div>
      </div>

      {/* Total Stamps */}
      <div className="px-4 mb-6">
        <div className="bg-[#13132b] rounded-2xl p-5 border border-purple-500/20">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">🏆</span>
            <span className="text-white text-2xl font-bold">Total Stamps: {stamps.length}</span>
          </div>
        </div>
      </div>

      {/* Stamps Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredStamps.map((stamp) => (
            <Link key={stamp.id} href="/passport/stamp-detail">
              <div className="bg-[#13132b] rounded-2xl overflow-hidden border border-purple-500/20 hover:border-pink-500/40 transition-colors cursor-pointer">
                {/* Stamp Image Area */}
                <div className={`h-32 bg-gradient-to-br ${stamp.color} flex items-center justify-center`}>
                  <span className="text-5xl">{stamp.icon}</span>
                </div>

                {/* Stamp Info */}
                <div className="p-3">
                  <h3 className="text-white font-semibold">{stamp.activity}</h3>
                  <p className="text-gray-400 text-sm">📍 {stamp.location}</p>
                  <div className="mt-2">
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                      ✓ {stamp.date} Completed
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {filteredStamps.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No stamps found
        </div>
      )}
    </div>
  );
}
