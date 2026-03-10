"use client";

import { useState } from "react";
import { Flame, ChevronLeft, ChevronRight, Trophy, Zap } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function StreakPage() {
  const [selectedDay, setSelectedDay] = useState(18);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0f0f1a] text-white" : "bg-gray-50 text-gray-900";
  const cardBg = isDark ? "bg-[#1a1a2e] border-gray-700" : "bg-white border-gray-200";
  const chipBg = isDark ? "bg-[#252542] hover:bg-[#2d2d52]" : "bg-gray-100 hover:bg-gray-200";
  const mutedText = isDark ? "text-gray-400" : "text-gray-500";
  const rewardBg = isDark ? "bg-[#252542]" : "bg-gray-100";

  const days = [
    "", "", "", "", "", "", "1",
    "2", "3", "4", "5", "6", "7", "8",
    "9", "10", "11", "12", "13", "14", "15",
    "16", "17", "18", "19", "20", "21", "22",
    "23", "24", "25", "26", "27", "28", "29",
    "30", "31"
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
      <div className="space-y-6">
        <div className="max-w-6xl mx-auto px-4 py-6">

          {/* PAGE TITLE */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Flame className="text-orange-500" size={28} />
              Day Streak
            </h1>
            <p className={`mt-1 ${mutedText}`}>Track your activity consistency and earn rewards.</p>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT SIDE - STREAK SUMMARY */}
            <div className={`lg:col-span-5 p-8 rounded-xl border ${isDark
                ? "bg-gradient-to-b from-[#2a1a12] to-[#1a1a2e] border-orange-500/30"
                : "bg-gradient-to-b from-orange-50 to-white border-orange-200"
              }`}>
              <div className="flex flex-col items-center">
                <div className="text-7xl">🔥</div>
                <h2 className="text-6xl font-bold text-orange-500 mt-4">0</h2>
                <p className={`mt-2 ${mutedText}`}>Days Streak</p>
              </div>

              {/* Weekly Tracker */}
              <div className={`mt-10 flex justify-between text-sm ${mutedText}`}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i < 2 ? "bg-green-500" : isDark ? "bg-[#252542]" : "bg-gray-200"
                      }`}>
                      {i < 2 && <Trophy size={14} className="text-white" />}
                    </div>
                    <span>{day}</span>
                  </div>
                ))}
              </div>

              {/* Reward Info */}
              <div className={`mt-8 text-center rounded-lg p-4 ${rewardBg}`}>
                <p className={mutedText}>5 Days to go & you will achieve</p>
                <span className="text-yellow-400 font-semibold flex items-center justify-center gap-1 mt-1">
                  <Zap size={16} />
                  6 Coins
                </span>
              </div>
            </div>

            {/* RIGHT SIDE - CALENDAR */}
            <div className={`lg:col-span-7 p-8 rounded-xl border ${cardBg}`}>
              {/* Month Header */}
              <div className="flex justify-between items-center mb-8">
                <button className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${chipBg}`}>
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-semibold">January 2026</h2>
                <button className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${chipBg}`}>
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Week Labels */}
              <div className={`grid grid-cols-7 text-center text-sm mb-6 ${mutedText}`}>
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
                      className={`relative cursor-pointer text-base py-3 rounded-lg transition-all ${isSelected
                          ? "text-white font-bold"
                          : day
                            ? `${mutedText} ${isDark ? "hover:bg-[#252542]" : "hover:bg-gray-100"}`
                            : "text-transparent"
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg scale-110 -z-10" />
                      )}
                      {day}
                      {(day === "6" || day === "12" || day === "24") && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-yellow-400">
                          <Zap size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
