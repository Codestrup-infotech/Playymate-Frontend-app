'use client';

import Link from 'next/link';
import { useState } from 'react';

const aiPicks = [
  { 
    id: 1, 
    title: "Kite Beach Surf School", 
    subtitle: "2.3 km away • Surfing", 
    category: "Venues", 
    rating: 5.0, 
    icon: "🏄",
    bgColor: "bg-teal-500"
  },
  { 
    id: 2, 
    title: "Desert Marathon 2025", 
    subtitle: "March 15 • Al Ain", 
    category: "Events", 
    rating: 5.0, 
    icon: "🏃",
    bgColor: "bg-orange-500"
  },
  { 
    id: 3, 
    title: "Coach - Tennis Pro", 
    subtitle: "Sports City • Dubai", 
    category: "Coaches", 
    rating: 5.0, 
    icon: "🎾",
    bgColor: "bg-purple-500"
  },
  { 
    id: 4, 
    title: "Hatta Mountain Lodge", 
    subtitle: "Weekend getaway • Staycation", 
    category: "Staycations", 
    rating: 4.9, 
    icon: "🏔️",
    bgColor: "bg-green-500"
  },
];

const sponsored = [
  { 
    id: 1, 
    title: "Adidas Running Gear", 
    subtitle: "Up to 40% off this week", 
    category: "Sports Brands", 
    isSponsored: true, 
    icon: "👟",
    bgColor: "bg-red-500"
  },
  { 
    id: 2, 
    title: "Dubai Fitness Challenge", 
    subtitle: "30x30 • Free registration", 
    category: "Events", 
    isSponsored: true, 
    icon: "🏋️",
    bgColor: "bg-blue-500"
  },
  { 
    id: 3, 
    title: "Emirates One&Only", 
    subtitle: "Exclusive sports retreat", 
    category: "Travel Deals", 
    isSponsored: true, 
    icon: "🏨",
    bgColor: "bg-yellow-500"
  },
];

export default function SuggestionsPage() {
  const [activeTab, setActiveTab] = useState('ai');

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating));
  };

  const getCategoryColor = (category) => {
    const colors = {
      Venues: 'bg-blue-500/20 text-blue-400',
      Events: 'bg-pink-500/20 text-pink-400',
      Coaches: 'bg-purple-500/20 text-purple-400',
      Staycations: 'bg-green-500/20 text-green-400',
      'Sports Brands': 'bg-orange-500/20 text-orange-400',
      'Travel Deals': 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] pb-24">
      {/* Header with Back */}
      <div className="flex items-center gap-4 px-4 pt-6 pb-4">
        <Link href="/passport">
          <button className="text-white text-xl">←</button>
        </Link>
        <h1 className="text-xl font-bold text-white">Suggestions</h1>
      </div>

      {/* Tab Bar */}
      <div className="px-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-[#13132b] text-gray-400 border border-purple-500/20'
            }`}
          >
            AI Picks
          </button>
          <button
            onClick={() => setActiveTab('sponsored')}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'sponsored'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-[#13132b] text-gray-400 border border-purple-500/20'
            }`}
          >
            Sponsored
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-3">
        {activeTab === 'ai' ? (
          aiPicks.map((item) => (
            <div
              key={item.id}
              className="bg-[#13132b] rounded-2xl p-4 border border-purple-500/20 hover:border-pink-500/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Left Icon */}
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center text-2xl shrink-0`}>
                  {item.icon}
                </div>
                
                {/* Middle Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{item.title}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <p className="text-gray-400 text-sm mt-1">{item.subtitle}</p>
                </div>
                
                {/* Right Rating */}
                <div className="text-right shrink-0">
                  <span className="text-yellow-400 text-sm block">
                    {renderStars(item.rating)} {item.rating}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          sponsored.map((item) => (
            <div
              key={item.id}
              className="bg-[#13132b] rounded-2xl p-4 border border-purple-500/20 hover:border-pink-500/40 transition-colors cursor-pointer relative"
            >
              {/* Sponsored Badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-400">
                  Sponsored
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Left Icon */}
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center text-2xl shrink-0`}>
                  {item.icon}
                </div>
                
                {/* Middle Content */}
                <div className="flex-1 min-w-0 pt-2">
                  <h3 className="text-white font-semibold truncate">{item.title}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <p className="text-gray-400 text-sm mt-1">{item.subtitle}</p>
                </div>
                
                {/* Right Arrow */}
                <div className="text-right shrink-0">
                  <span className="text-gray-400 text-xl">→</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
