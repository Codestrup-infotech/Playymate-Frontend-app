"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

import TurfPage from "./turf/TurfPage";
import CoachPage from "./coaching/CoachPage";
import StaycationsPage from "./staycations/StaycationPage";
import GymsPage from "./gyms/GymsPage";
import CafePage from "./cafe/CafePage";

export default function BookingLayout() {
  const [activeTab, setActiveTab] = useState("Turfs");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0f0f1a] text-white" : "bg-gray-50 text-gray-900";
  const inputBg = isDark ? "bg-[#1a1a2e]" : "bg-white border border-gray-200";
  const filterBg = isDark ? "bg-[#1a1a2e]" : "bg-white border border-gray-200";
  const mutedText = isDark ? "text-gray-400" : "text-gray-500";

  const tabs = ["Turfs", "Coaching", "Staycations", "Gyms", "Cafe"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Turfs": return <TurfPage />;
      case "Coaching": return <CoachPage />;
      case "Gyms": return <GymsPage />;
      case "Staycations": return <StaycationsPage />;
      case "Cafe": return <CafePage />;
      default: return <TurfPage />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${pageBg}`}>
      <div className="flex-1 px-6 pt-6 pb-24">

        {/* Heading */}
        <h1 className="text-4xl font-bold leading-tight mb-1">
          Find Your{" "}
          <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            Perfect
          </span>
        </h1>
        <p className={`mt-1 mb-6 ${mutedText}`}>Book Courts, Coaches & More</p>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className={`flex items-center rounded-xl px-4 py-3 flex-1 ${inputBg}`}>
            <Search size={18} className={`mr-2 ${mutedText}`} />
            <input
              placeholder="Search"
              className={`bg-transparent outline-none text-sm w-full ${isDark ? "placeholder-gray-500" : "placeholder-gray-400"}`}
            />
          </div>
          <button className={`rounded-xl px-4 flex items-center justify-center ${filterBg}`}>
            <SlidersHorizontal size={18} className={mutedText} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm transition whitespace-nowrap ${activeTab === tab
                  ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                  : `${isDark ? "bg-[#1a1a2e] text-gray-300" : "bg-gray-200 text-gray-600"}`
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}