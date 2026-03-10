"use client";

import { useState } from "react";
import { Search, Plus, MapPin, MessageCircle, Heart, Users, Filter } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("Trending");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0f0f1a] text-white" : "bg-gray-50 text-gray-900";
  const cardBg = isDark ? "bg-[#1a1a2e] border-gray-700" : "bg-white border-gray-200";
  const innerBg = isDark ? "bg-[#252542] hover:bg-[#2d2d52]" : "bg-gray-100 hover:bg-gray-200";
  const inputBg = isDark ? "bg-[#252542] border-purple-500/30" : "bg-gray-100 border-gray-200";
  const selectBg = isDark ? "bg-[#252542] border-gray-700" : "bg-gray-100 border-gray-200";
  const itemHover = isDark ? "hover:bg-[#252542] text-gray-300 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900";
  const mutedText = isDark ? "text-gray-400" : "text-gray-500";
  const tabActive = isDark ? "text-white border-purple-500" : "text-purple-600 border-purple-500";
  const tabInactive = isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600";

  const tabs = ["Trending", "Popular", "Events", "Community"];
  const categories = [
    { name: "Sports", active: true },
    { name: "Fitness" },
    { name: "Adventure" },
    { name: "Esports" },
  ];
  const trending = [
    { title: "Cricket Match", image: "/explore/1.jpg", likes: 21, comments: 10 },
    { title: "Football Match", image: "/explore/2.jpg", likes: 45, comments: 9 },
    { title: "Basketball", image: "/explore/3.jpg", likes: 62, comments: 11 },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
      <div className="space-y-6">
        <div className="max-w-6xl mx-auto px-4 py-4">

          {/* HEADER */}
          <div className={`rounded-xl p-6 border mb-6 ${cardBg}`}>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Explore</h1>
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`} />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    className={`border rounded-lg px-4 py-2 pl-10 w-72 focus:outline-none focus:border-purple-500 transition-colors ${inputBg} ${isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
                  />
                </div>
                <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                  <Plus size={18} />
                  Create Event
                </button>
              </div>
            </div>
          </div>

          {/* MAIN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT SIDEBAR */}
            <div className={`lg:col-span-3 rounded-xl p-5 border h-fit ${cardBg}`}>
              <h2 className="font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${cat.active
                        ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                        : innerBg
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
                <select className={`w-full p-3 rounded-lg text-sm border focus:outline-none focus:border-purple-500 ${selectBg} ${isDark ? "text-white" : "text-gray-900"}`}>
                  <option>Distance</option>
                  <option>Nearby (5km)</option>
                  <option>10km</option>
                  <option>25km</option>
                </select>
              </div>
            </div>

            {/* CENTER CONTENT */}
            <div className="lg:col-span-6">
              <div className={`rounded-xl p-5 border mb-6 ${cardBg}`}>
                {/* TABS */}
                <div className={`flex gap-6 border-b pb-4 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 -mb-4 font-medium ${activeTab === tab ? tabActive + " border-b-2" : tabInactive}`}
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
                      className={`rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500/50 transition-all cursor-pointer ${isDark ? "bg-[#252542]" : "bg-gray-50"}`}
                    >
                      <img src={item.image} alt={item.title} className="h-48 w-full object-cover" />
                      <div className="p-4">
                        <h4 className="font-semibold">{item.title}</h4>
                        <div className={`flex gap-4 text-sm mt-2 ${mutedText}`}>
                          <span className="flex items-center gap-1"><Heart size={14} />{item.likes}</span>
                          <span className="flex items-center gap-1"><MessageCircle size={14} />{item.comments}</span>
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
                <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full">Volleyball</span>
                <h4 className="mt-4 font-semibold text-white">Beach Volleyball Meetup</h4>
                <p className="text-gray-400 text-sm mt-2 flex items-center gap-1">
                  <MapPin size={14} />
                  Koregaon Park • 12km away
                </p>
                <button className="mt-5 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity">
                  Join Event
                </button>
              </div>

              {/* COMMUNITY CARD */}
              <div className={`p-5 rounded-xl border ${cardBg}`}>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users size={18} />
                  Top Communities
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    { emoji: "🏏", name: "Cricket Lovers" },
                    { emoji: "⚽", name: "Football Club" },
                    { emoji: "🏀", name: "Basketball Squad" },
                    { emoji: "🏃", name: "Fitness Freaks" },
                  ].map((c) => (
                    <div key={c.name} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${itemHover}`}>
                      <span>{c.emoji}</span>
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
