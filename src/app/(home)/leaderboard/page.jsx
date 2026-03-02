"use client";

import { useState } from "react";

export default function LeaderboardPage() {
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
    <div className="px-10 py-8"> {/* ✅ Proper medium padding for sidebar layout */}

      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-6">Leaderboard</h1>

      {/* Tabs */}
      <div className="bg-zinc-900 rounded-full p-1 flex gap-1 w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-1.5 rounded-full text-sm transition ${
              activeTab === tab
                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                : "text-gray-400"
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
            className={`px-5 py-1.5 rounded-full text-sm transition ${
              timeFilter === filter
                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                : "bg-zinc-800 text-gray-400"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-12 mb-16">

        {/* 2nd */}
        <Podium user={topThree[1]} position={2} />

        {/* 1st */}
        <Podium user={topThree[0]} position={1} big />

        {/* 3rd */}
        <Podium user={topThree[2]} position={3} />

      </div>

      {/* Ranking List */}
      <div className="space-y-4 max-w-4xl">
        {leaderboard.map((user) => (
          <div
            key={user.rank}
            className={`p-[1px] rounded-xl ${
              user.highlight
                ? "bg-gradient-to-r from-pink-500 to-orange-500"
                : "bg-zinc-800"
            }`}
          >
            <div className="bg-zinc-900 rounded-xl flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium w-6">
                  {user.rank}
                </span>
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-base">{user.name}</span>
              </div>

              <span className="text-base text-gray-300">
                {user.score} Coins
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Smaller Professional Podium */
function Podium({ user, position, big }) {
  return (
    <div className="text-center">

      {position === 1 && (
        <div className="text-2xl mb-1">👑</div>
      )}

      <img
        src={user.image}
        alt={user.name}
        className={`rounded-full border-2 border-orange-500 mx-auto object-cover ${
          big ? "w-24 h-24" : "w-20 h-20"
        }`}
      />

      <p className="mt-3 text-base font-medium">{user.name}</p>
      <p className="text-gray-400 text-sm">{user.score}</p>

      <div
        className={`mt-4 rounded-lg flex items-center justify-center font-semibold text-xl ${
          big
            ? "h-28 w-20 bg-gradient-to-b from-orange-400 to-orange-600"
            : "h-20 w-16 bg-gradient-to-b from-orange-700 to-orange-900"
        }`}
      >
        {position}
      </div>
    </div>
  );
}