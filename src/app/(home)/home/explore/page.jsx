"use client";

import { useState } from "react";
import { Search, Plus, MapPin, MessageCircle, Heart, Users, Filter } from "lucide-react";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("Trending");

  const tabs = ["Trending", "Popular", "Events", "Community"];

  const categories = [
    { name: "Sports", active: true },
    { name: "Fitness" },
    { name: "Adventure" },
    { name: "Esports" },
  ];

  const trending = [
    {
      title: "Cricket Match",
      image: "/explore/1.jpg",
      likes: 21,
      comments: 10,
    },
    {
      title: "Football Match",
      image: "/explore/2.jpg",
      likes: 45,
      comments: 9,
    },
    {
      title: "Basketball",
      image: "/explore/3.jpg",
      likes: 62,
      comments: 11,
    },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Explore</h1>

            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="bg-[#252542] border border-purple-500/30 rounded-lg px-4 py-2 pl-10 w-72 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                <Plus size={18} />
                Create Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 bg-[#1a1a2e] rounded-xl p-5 border border-gray-700 h-fit">
            <h2 className="font-semibold mb-4">Categories</h2>

            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    cat.active
                      ? "bg-gradient-to-r from-purple-600 to-orange-500"
                      : "bg-[#252542] hover:bg-[#2d2d52]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Filter size={16} />
                Filters
              </h2>
              <select className="w-full bg-[#252542] p-3 rounded-lg text-sm border border-gray-700 focus:outline-none focus:border-purple-500">
                <option>Distance</option>
                <option>Nearby (5km)</option>
                <option>10km</option>
                <option>25km</option>
              </select>
            </div>
          </div>

          {/* CENTER CONTENT */}
          <div className="lg:col-span-6">

            {/* TABS */}
            <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-700 mb-6">
              <div className="flex gap-6 border-b border-gray-700 pb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 -mb-4 font-medium ${
                      activeTab === tab
                        ? "text-white border-b-2 border-purple-500"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TRENDING GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                {trending.map((item) => (
                  <div
                    key={item.title}
                    className="bg-[#252542] rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500/50 transition-all cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-48 w-full object-cover"
                    />

                    <div className="p-4">
                      <h4 className="font-semibold">{item.title}</h4>

                      <div className="flex gap-4 text-sm text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Heart size={14} />
                          {item.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          {item.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-3 space-y-5">

            {/* EVENT CARD */}
            <div className="rounded-xl p-5 bg-gradient-to-br from-purple-800 to-[#1a1a2e] border border-purple-500/40">
              <span className="text-xs bg-purple-600 px-3 py-1 rounded-full">
                Volleyball
              </span>

              <h4 className="mt-4 font-semibold">
                Beach Volleyball Meetup
              </h4>

              <p className="text-gray-400 text-sm mt-2 flex items-center gap-1">
                <MapPin size={14} />
                Koregaon Park • 12km away
              </p>

              <button className="mt-5 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 font-semibold hover:opacity-90 transition-opacity">
                Join Event
              </button>
            </div>

            {/* COMMUNITY CARD */}
            <div className="bg-[#1a1a2e] p-5 rounded-xl border border-gray-700">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users size={18} />
                Top Communities
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-[#252542] transition-colors">
                  <span>🏏</span>
                  <span>Cricket Lovers</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-[#252542] transition-colors">
                  <span>⚽</span>
                  <span>Football Club</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-[#252542] transition-colors">
                  <span>🏀</span>
                  <span>Basketball Squad</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-[#252542] transition-colors">
                  <span>🏃</span>
                  <span>Fitness Freaks</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
