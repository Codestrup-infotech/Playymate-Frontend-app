"use client";

import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

export default function LeaderboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pageBg = isDark ? "text-white" : "text-gray-900";
  const cardBg = isDark ? "bg-[#1a1a2e]" : "bg-white border border-gray-200";
  const chipBg = isDark ? "bg-zinc-800" : "bg-gray-200";
  const mutedText = isDark ? "text-gray-400" : "text-gray-500";

  const topThree = [
    { id: 1, name: "Rohan R", score: 2840, image: "https://i.pravatar.cc/150?img=12" },
    { id: 2, name: "Rhea P", score: 2710, image: "https://i.pravatar.cc/150?img=5" },
    { id: 3, name: "Mehir K", score: 2655, image: "https://i.pravatar.cc/150?img=8" },
  ];

  const leaderboard = [
    { rank: 4, name: "Sruja Y", score: 2500, image: "https://i.pravatar.cc/150?img=20" },
    { rank: 5, name: "Sam J", score: 2380, image: "https://i.pravatar.cc/150?img=22" },
    { rank: 6, name: "You", score: 2290, image: "https://i.pravatar.cc/150?img=15", highlight: true },
    { rank: 7, name: "Pooja C", score: 2067, image: "https://i.pravatar.cc/150?img=25" },
  ];

  const [activeTab, setActiveTab] = useState("Global");
  const [timeFilter, setTimeFilter] = useState("Today");

  const tabs = ["Global", "City", "Category", "Friends"];
  const filters = ["Today", "This Week", "This Month"];

  return (
    <div className={`min-h-screen transition-colors duration-300 px-10 py-8 ${pageBg}`}>

      <h1 className="text-2xl font-semibold mb-6">Leaderboard</h1>

      {/* Tabs */}
      <div className={`rounded-full p-1 flex gap-1 w-fit mb-6 ${chipBg}`}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-1.5 rounded-full text-sm transition ${activeTab === tab
                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                : mutedText
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Time Filters */}
      <div className="flex gap-3 mb-10">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-5 py-1.5 rounded-full text-sm transition ${timeFilter === filter
                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                : `${chipBg} ${mutedText}`
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-12 mb-16">
        <Podium user={topThree[1]} position={2} isDark={isDark} />
        <Podium user={topThree[0]} position={1} big isDark={isDark} />
        <Podium user={topThree[2]} position={3} isDark={isDark} />
      </div>

      {/* Ranking List */}
      <div className="space-y-4 max-w-4xl">
        {leaderboard.map((user) => (
          <div
            key={user.rank}
            className={`p-[1px] rounded-xl ${user.highlight
                ? "bg-gradient-to-r from-pink-500 to-orange-500"
                : isDark ? "bg-zinc-800" : "bg-gray-200"
              }`}
          >
            <div className={`rounded-xl flex items-center justify-between px-6 py-4 ${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium w-6">{user.rank}</span>
                <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                <span className="text-base">{user.name}</span>
              </div>
              <span className={`text-base ${mutedText}`}>{user.score} Coins</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Podium({ user, position, big, isDark }) {
  const mutedText = isDark ? "text-gray-400" : "text-gray-500";
  return (
    <div className="text-center">
      {position === 1 && <div className="text-2xl mb-1">👑</div>}
      <img
        src={user.image}
        alt={user.name}
        className={`rounded-full border-2 border-orange-500 mx-auto object-cover ${big ? "w-24 h-24" : "w-20 h-20"}`}
      />
      <p className="mt-3 text-base font-medium">{user.name}</p>
      <p className={`text-sm ${mutedText}`}>{user.score}</p>
      <div
        className={`mt-4 rounded-lg flex items-center justify-center font-semibold text-xl text-white ${big
            ? "h-28 w-20 bg-gradient-to-b from-orange-400 to-orange-600"
            : "h-20 w-16 bg-gradient-to-b from-orange-700 to-orange-900"
          }`}
      >
        {position}
      </div>
    </div>
  );
}