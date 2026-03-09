"use client";

import { useState } from "react";
import { MapPin, Star, Search, SlidersHorizontal, Grid, List, Clock, TrendingUp } from "lucide-react";

export default function SearchPage() {
  const [view, setView] = useState("list");

  const results = [
    {
      title: "Sunset Yoga Session",
      location: "Baner · 25 Km · Open Now",
      rating: 4.8,
      price: 3600,
      image: "/search/yoga.jpg",
      live: true,
    },
    {
      title: "Weekend Tennis Training",
      location: "Wakad · 14 Km · Open Now",
      rating: 5.0,
      price: 2000,
      image: "/search/tennis.jpg",
      live: false,
    },
  ];

  return (
    <div className="space-y-6">

      {/* CENTER WRAPPER */}
      <div className="max-w-6xl mx-auto px-4">

        {/* MAIN CARD */}
        <div className="bg-[#1a1a2e] rounded-xl p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-400 text-sm flex items-center gap-1">
                <MapPin size={14} />
                Location
              </p>
              <h2 className="text-lg font-semibold">Nanded Fata</h2>
            </div>

            <div className="flex gap-3">
              <button className="w-10 h-10 bg-[#252542] rounded-lg flex items-center justify-center hover:bg-[#2d2d52] transition-colors">
                <TrendingUp size={18} />
              </button>
              <button className="w-10 h-10 bg-[#252542] rounded-lg flex items-center justify-center hover:bg-[#2d2d52] transition-colors">
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search activities..."
                className="w-full bg-[#252542] border border-purple-500/30 rounded-lg px-5 py-3 pl-12 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button className="px-5 py-3 bg-[#252542] rounded-lg hover:bg-[#2d2d52] transition-colors">
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* RECENT SEARCHES */}
          <div className="mb-6">
            <h3 className="text-gray-400 mb-3 text-sm font-medium">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {["Yoga near me", "Tennis courts", "Personal trainer", "Swimming Pool"].map(
                (item) => (
                  <span
                    key={item}
                    className="px-4 py-2 bg-[#252542] rounded-lg text-sm text-gray-300 hover:bg-[#2d2d52] cursor-pointer transition-colors"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          {/* TRENDING TAGS */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium">Trending Now</h3>
            <div className="flex flex-wrap gap-2">
              {["Crossfit", "Running clubs", "Hot yoga", "Boxing", "Padel"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-lg border border-orange-500/50 text-orange-400 text-sm hover:bg-orange-500/10 cursor-pointer transition-colors"
                  >
                    🔥 {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* RESULTS HEADER */}
          <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-700">
            <p className="text-gray-400 flex items-center gap-2">
              <Clock size={16} />
              5 results found
            </p>

            <div className="flex bg-[#252542] rounded-lg p-1">
              <button
                onClick={() => setView("list")}
                className={`px-5 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                  view === "list"
                    ? "bg-gradient-to-r from-purple-600 to-orange-500"
                    : "hover:bg-[#2d2d52]"
                }`}
              >
                <List size={16} />
                List
              </button>
              <button
                onClick={() => setView("map")}
                className={`px-5 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                  view === "map"
                    ? "bg-gradient-to-r from-purple-600 to-orange-500"
                    : "hover:bg-[#2d2d52]"
                }`}
              >
                <Grid size={16} />
                Map
              </button>
            </div>
          </div>

          {/* RESULTS GRID (WEB) */}
          <div className="grid grid-cols-2 gap-4">
            {results.map((item) => (
              <div
                key={item.title}
                className="bg-[#252542] rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500/50 transition-all cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-32 object-cover"
                  />

                  {item.live && (
                    <span className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded-full text-xs font-medium">
                      Live
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                        <MapPin size={12} />
                        {item.location}
                      </p>
                    </div>

                    <span className="flex items-center gap-1 text-yellow-400 font-medium text-xs">
                      <Star size={14} fill="currentColor" />
                      {item.rating}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <p className="text-base font-semibold">
                      ₹{item.price.toLocaleString()}
                      <span className="text-gray-400 text-xs ml-1 font-normal">
                        /session
                      </span>
                    </p>

                    <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-xs font-semibold hover:opacity-90 transition-opacity">
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
