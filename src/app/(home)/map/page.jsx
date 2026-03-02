"use client";

import { useEffect, useState } from "react";
import { Search, Trophy, Dumbbell, Bike, MapPin, Plus } from "lucide-react";

export default function MapPage() {
  const [activeTab, setActiveTab] = useState("All");

  const categories = [
    { name: "All", icon: <Trophy size={16} /> },
    { name: "Gym", icon: <Dumbbell size={16} /> },
    { name: "Cycling", icon: <Bike size={16} /> },
  ];

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      
      {/* MAP BACKGROUND */}
      <div className="absolute inset-0">
        <iframe
          width="100%"
          height="100%"
          className="opacity-70"
          src="https://maps.google.com/maps?q=18.5204,73.8567&z=13&output=embed"
        />
      </div>

      {/* TOP SECTION */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-20 space-y-4">

        {/* SEARCH */}
        <div className="bg-black/60 backdrop-blur-md border border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input
            placeholder="Search grounds, events, coach..."
            className="bg-transparent outline-none w-full text-sm placeholder-gray-400"
          />
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveTab(cat.name)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm transition-all
                ${
                  activeTab === cat.name
                    ? "bg-gradient-to-r from-pink-500 to-orange-400"
                    : "bg-white/10 border border-gray-700"
                }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* FLOATING ZOOM CONTROLS */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/50 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-3 border border-gray-700">
        <Plus />
        <span className="text-center text-xl font-light">−</span>
      </div>

      {/* USER LOCATION PULSE */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 z-20">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-red-500/20 rounded-full animate-ping"></div>
          <div className="absolute w-16 h-16 bg-red-500/40 rounded-full animate-ping delay-200"></div>
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
            You
          </div>
        </div>
      </div>

      {/* BOTTOM CARD SECTION */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-20">
        <div className="bg-black/80 backdrop-blur-md border border-orange-500 rounded-3xl p-5 shadow-xl">
          <p className="text-sm text-gray-400 mb-1">Sponsored</p>
          <h3 className="text-lg font-semibold">Victory Football Arena</h3>
          <p className="text-sm text-gray-400">5 vs 5 Turf · Floodlights</p>
          <p className="text-green-400 mt-2">0.5 KM Away</p>
        </div>
      </div>

      {/* BOTTOM NAVBAR */}
      {/* <div className="absolute bottom-0 left-0 w-full bg-black border-t border-gray-800 flex justify-around py-4 z-30">
        <NavItem label="Home" />
        <NavItem label="Search" />
        <div className="bg-gradient-to-r from-pink-500 to-orange-400 w-14 h-14 rounded-full flex items-center justify-center -mt-10 shadow-lg">
          <Plus />
        </div>
        <NavItem label="Map" active />
        <NavItem label="Wallet" />
      </div> */}
    </div>
  );
}

function NavItem({ label, active }) {
  return (
    <div
      className={`text-xs flex flex-col items-center ${
        active ? "text-orange-400" : "text-gray-400"
      }`}
    >
      <MapPin size={18} />
      {label}
    </div>
  );
}