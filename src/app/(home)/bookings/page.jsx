"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Home,
  Map,
  Wallet,
  Plus,
} from "lucide-react";

// 🔹 Import tab pages
import TurfPage from "./turf/TurfPage";
import CoachPage from "./coaching/CoachPage";
import StaycationsPage from "./staycations/StaycationPage";
import GymsPage from "./gyms/GymsPage";
import CafePage from "./cafe/CafePage"

export default function BookingLayout() {
  const [activeTab, setActiveTab] = useState("Turfs");

  const tabs = ["Turfs", "Coaching", "Staycations", "Gyms", "Cafe"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Turfs":
        return <TurfPage />;

      case "Coaching":
        return <CoachPage />;

      case "Gyms":
        return <GymsPage />;

      case "Staycations":
          return <StaycationsPage />;

      case "Cafe":
          return <CafePage />;

      default:
        return <TurfPage />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      <div className="flex-1 px-6 pt-6 pb-24">

        {/* Back */}
        <button className="mb-6">
          <ArrowLeft size={24} />
        </button>

        {/* Heading */}
        <h1 className="text-4xl font-bold leading-tight">
          Find Your{" "}
          <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            Perfect
          </span>
        </h1>

        <p className="text-gray-400 mt-2 mb-6">
          Book Courts, Coaches & More
        </p>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex items-center bg-zinc-900 rounded-xl px-4 py-3 flex-1">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              placeholder="Search"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <button className="bg-zinc-900 rounded-xl px-4 flex items-center justify-center">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm transition
                ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                    : "bg-zinc-900 text-gray-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 🔥 Only This Part Changes */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>

      </div>

      {/* Bottom Nav */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 px-8 py-3 flex justify-between items-center">

        <div className="flex flex-col items-center text-pink-500">
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </div>

        <div className="flex flex-col items-center text-gray-400">
          <Search size={20} />
          <span className="text-xs mt-1">Search</span>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-4 rounded-full -mt-10 shadow-lg">
          <Plus size={22} />
        </div>

        <div className="flex flex-col items-center text-gray-400">
          <Map size={20} />
          <span className="text-xs mt-1">Map</span>
        </div>

        <div className="flex flex-col items-center text-gray-400">
          <Wallet size={20} />
          <span className="text-xs mt-1">Wallet</span>
        </div>

      </div> */}

    </div>
  );
}