'use client';

import Link from 'next/link';
import { useState } from 'react';

const bucketItems = [
  { id: 1, title: "Run a marathon in Tokyo", category: "Experiences", status: "Planned", location: "Tokyo, Japan", date: "2026-10-8", icon: "🏃" },
  { id: 2, title: "Surf in Bali", category: "Sport", status: "Dream", location: "Bali, Indonesia", date: null, icon: "🏄" },
  { id: 3, title: "Learn Kitesurfing", category: "Learning", status: "Planned", location: "Tarifa, Spain", date: null, icon: "🪁" },
  { id: 4, title: "Attend a Premier League match", category: "Experiences", status: "Dream", location: "London, UK", date: "2027-10-8", icon: "⚽" },
];

const statusColors = {
  Dream: "bg-purple-500/20 text-purple-400",
  Planned: "bg-orange-500/20 text-orange-400",
  Done: "bg-green-500/20 text-green-400",
};

const categoryColors = {
  Sport: "bg-blue-500/20 text-blue-400",
  Experiences: "bg-pink-500/20 text-pink-400",
  Learning: "bg-cyan-500/20 text-cyan-400",
};

export default function BucketListPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = bucketItems.filter(item => {
    const matchesTab = activeTab === 'All' || item.status === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = ['All', 'Dream', 'Planned', 'Done'];

  return (
    <div className="min-h-screen bg-[#0d0d1a] pb-36">
      {/* Header with Back */}
      <div className="flex items-center gap-4 px-4 pt-6 pb-4">
        <Link href="/passport">
          <button className="text-white text-xl">←</button>
        </Link>
        <h1 className="text-xl font-bold text-white">Bucket List</h1>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="bg-[#13132b] rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search bucket list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-gray-500 flex-1 outline-none"
          />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="px-4 mb-4">
        <div className="flex gap-6 border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bucket List Items */}
      <div className="px-4 space-y-3">
        {filteredItems.map((item) => (
          <Link key={item.id} href="/passport/bucket-detail">
            <div className="bg-[#13132b] rounded-2xl p-4 border border-purple-500/20 hover:border-pink-500/40 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[item.category]}`}>
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                    <span>📍 {item.location}</span>
                    {item.date && (
                      <span className="text-gray-500">• Target: {item.date}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No items found
        </div>
      )}

      {/* Bottom CTA Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-pink-500/25">
          + Add to Bucket List
        </button>
      </div>
    </div>
  );
}
