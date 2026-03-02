'use client';

import Link from 'next/link';
import { useState } from 'react';

const slides = [
  {
    id: 0,
    type: 'intro',
    content: (
      <div className="h-full flex flex-col items-center justify-center px-6 py-8 relative">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500">
          <div className="w-full h-full bg-[#0a0a1b] rounded-[22px]"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Playymate
          </h2>
          <p className="text-xl text-white mt-2 font-medium">Digital Passport</p>
          <p className="text-gray-400 mt-4 text-sm">Your journey, your story</p>
        </div>
        
        {/* Dot pattern background */}
        <div className="absolute inset-0 opacity-10 rounded-3xl" style={{
          backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
    ),
  },
  {
    id: 1,
    type: 'profile',
    content: (
      <div className="h-full flex flex-col">
        {/* Colored band */}
        <div className="h-20 bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-between px-4">
          <span className="text-white font-bold text-sm tracking-wider">PLAYYMATE PASSPORT</span>
          <span className="text-2xl">🎮</span>
        </div>
        
        {/* Card body */}
        <div className="flex-1 bg-[#0a0a1b] p-4">
          {/* Profile photo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
              👤
            </div>
          </div>
          
          {/* Info fields */}
          <div className="space-y-2">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">Full Name</p>
              <p className="text-white text-xl font-bold">Alex Rivera</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">Passport ID</p>
              <p className="text-white font-mono">PM-2024-8847</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Status</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                  ✓ Verified
                </span>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Issue Date</p>
                <p className="text-white text-sm">January 15, 2024</p>
              </div>
            </div>
          </div>
          
          {/* Machine readable zone */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-gray-500 font-mono text-xs leading-tight">
              {"P<PLYM<RIVERA<<ALEX<<<<<<<<<<<<<<<<<<<<<<"}
            </p>
            <p className="text-gray-500 font-mono text-xs leading-tight">
              {"PM20248847<<<<<<<<<2024011500000<<<<<<<6"}
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    type: 'bucket',
    content: (
      <div className="h-full flex flex-col p-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider mb-4">
          Bucket List
        </h3>
        
        <div className="flex-1 space-y-2">
          {[
            { name: 'Travel', count: 2, icon: '✈️' },
            { name: 'Sports', count: 1, icon: '⚽' },
            { name: 'Experiences', count: 1, icon: '🎯' },
            { name: 'Purchases', count: 4, icon: '🛍️' },
            { name: 'Learning', count: 1, icon: '📚' },
          ].map((cat) => (
            <div key={cat.name} className="flex items-center justify-between bg-[#13132b] rounded-lg py-3 px-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.icon}</span>
                <span className="text-white font-medium">{cat.name}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium">
                {cat.count}
              </span>
            </div>
          ))}
        </div>
        
        <p className="text-gray-500 text-center text-sm mt-2">6 Items</p>
      </div>
    ),
  },
  {
    id: 3,
    type: 'stamps',
    content: (
      <div className="h-full flex flex-col p-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider mb-4">
          Stamps Collection
        </h3>
        
        <div className="grid grid-cols-2 gap-3 flex-1">
          {[
            { activity: 'Tennis', location: 'Tokyo, Japan', icon: '🎾' },
            { activity: 'Football', location: 'London, UK', icon: '⚽' },
            { activity: 'Swimming', location: 'Bali', icon: '🏊' },
            { activity: 'Café Hopping', location: 'Paris', icon: '☕' },
          ].map((stamp, idx) => (
            <div key={idx} className="bg-[#13132b] rounded-xl p-3 border-2 border-dashed border-pink-400/50">
              <div className="text-3xl text-center mb-2">{stamp.icon}</div>
              <p className="text-white font-bold text-center text-sm">{stamp.activity}</p>
              <p className="text-gray-400 text-xs text-center">{stamp.location}</p>
              <div className="text-center mt-2">
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">Completed</span>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-gray-400 text-center text-sm mt-2">Jan 15, 2026</p>
      </div>
    ),
  },
  {
    id: 4,
    type: 'badges',
    content: (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider">
            Achievements
          </h3>
          <span className="text-white text-2xl font-bold">3/6</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 flex-1">
          {[
            { name: 'First Booking', icon: '🎫', color: 'bg-orange-500' },
            { name: 'Explorer', icon: '🧭', color: 'bg-blue-500' },
            { name: 'Streak Master', icon: '🔥', color: 'bg-red-500' },
            { name: 'Social Butterfly', icon: '🦋', color: 'bg-purple-500' },
            { name: 'Champion', icon: '🏆', color: 'bg-yellow-500' },
            { name: 'Globe Trotter', icon: '🌍', color: 'bg-green-500' },
          ].map((badge, idx) => (
            <div key={idx} className="bg-[#13132b] rounded-xl p-2 flex flex-col items-center justify-center">
              <div className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center text-xl mb-1`}>
                {badge.icon}
              </div>
              <p className="text-white text-[10px] text-center leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>
        
        <p className="text-gray-400 text-center text-sm mt-2">Collected 3 of 6 badges</p>
      </div>
    ),
  },
];

export default function DigitalPassportPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <Link href="/passport">
          <button className="text-white text-xl">←</button>
        </Link>
        <h1 className="text-xl font-bold text-white">Digital Passport</h1>
        <span className="text-gray-400 text-xs">Swipe to explore →</span>
      </div>

      {/* Card Slider */}
      <div className="px-4">
        <div className="bg-[#0a0a1b] rounded-3xl overflow-hidden border border-purple-500/30 relative h-[480px]">
          {/* Slide Content */}
          <div className="absolute inset-0">
            {slides[currentSlide].content}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 mt-4 flex justify-between items-center">
        {/* Prev Button */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`w-12 h-12 rounded-full bg-[#13132b] border border-purple-500/20 text-white flex items-center justify-center transition-colors ${
            currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#1a1a35]'
          }`}
        >
          ←
        </button>

        {/* Dot Indicators */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === index
                  ? 'w-6 bg-pink-500'
                  : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`w-12 h-12 rounded-full bg-[#13132b] border border-purple-500/20 text-white flex items-center justify-center transition-colors ${
            currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#1a1a35]'
          }`}
        >
          →
        </button>
      </div>
    </div>
  );
}
