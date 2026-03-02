"use client";

import { useState } from "react";
import { Flame, ChevronLeft, ChevronRight, Trophy, Zap } from "lucide-react";

export default function StreakPage() {
  const [selectedDay, setSelectedDay] = useState(18);

  const days = [
    "", "", "", "", "", "", "1",
    "2", "3", "4", "5", "6", "7", "8",
    "9", "10", "11", "12", "13", "14", "15",
    "16", "17", "18", "19", "20", "21", "22",
    "23", "24", "25", "26", "27", "28", "29",
    "30", "31"
  ];

  return (
    <div className="space-y-6">

      <div className="max-w-6xl mx-auto px-4">

        {/* PAGE TITLE */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Flame className="text-orange-500" size={28} />
            Day Streak
          </h1>
          <p className="text-gray-400 mt-1">
            Track your activity consistency and earn rewards.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT SIDE - STREAK SUMMARY */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#2a1a12] to-[#1a1a2e] p-8 rounded-xl border border-orange-500/30">

            {/* Flame + Count */}
            <div className="flex flex-col items-center">
              <div className="text-7xl">🔥</div>
              <h2 className="text-6xl font-bold text-orange-500 mt-4">0</h2>
              <p className="text-gray-300 mt-2">Days Streak</p>
            </div>

            {/* Weekly Tracker */}
            <div className="mt-10 flex justify-between text-sm text-gray-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        i < 2
                          ? "bg-green-500"
                          : i === 0
                          ? "bg-red-500"
                          : "bg-[#252542]"
                      }`}
                    >
                      {i < 2 && <Trophy size={14} className="text-white" />}
                    </div>
                    <span>{day}</span>
                  </div>
                )
              )}
            </div>

            {/* Reward Info */}
            <div className="mt-8 text-center text-gray-400 bg-[#252542] rounded-lg p-4">
              <p>5 Days to go & you will achieve</p>
              <span className="text-yellow-400 font-semibold ml-2 flex items-center justify-center gap-1 mt-1">
                <Zap size={16} />
                6 Coins
              </span>
            </div>

          </div>

          {/* RIGHT SIDE - CALENDAR */}
          <div className="lg:col-span-7 bg-[#1a1a2e] p-8 rounded-xl border border-gray-700">

            {/* Month Header */}
            <div className="flex justify-between items-center mb-8">
              <button className="w-10 h-10 rounded-lg bg-[#252542] hover:bg-[#2d2d52] flex items-center justify-center transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-semibold">January 2026</h2>
              <button className="w-10 h-10 rounded-lg bg-[#252542] hover:bg-[#2d2d52] flex items-center justify-center transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Week Labels */}
            <div className="grid grid-cols-7 text-center text-gray-500 text-sm mb-6">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="font-medium">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-3 text-center">
              {days.map((day, i) => {
                const isSelected = Number(day) === selectedDay;

                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(Number(day))}
                    className={`relative cursor-pointer text-base py-3 rounded-lg transition-all ${
                      isSelected
                        ? "text-white font-bold"
                        : day
                        ? "text-gray-400 hover:bg-[#252542]"
                        : "text-transparent"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg scale-110 -z-10"></div>
                    )}

                    {day}

                    {/* Coin Indicator */}
                    {day === "6" || day === "12" || day === "24" ? (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-yellow-400">
                        <Zap size={12} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
