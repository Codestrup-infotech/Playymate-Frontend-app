"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, ArrowLeft } from "lucide-react";

export default function SelectProfileTypePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = {
    sports: [
      { id: "cricket", name: "Cricket", icon: "🏏" },
      { id: "football", name: "Football", icon: "⚽" },
      { id: "badminton", name: "Badminton", icon: "🏸" },
      { id: "volleyball", name: "Volleyball", icon: "🏐" },
      { id: "basketball", name: "Basketball", icon: "🏀" },
      { id: "tennis", name: "Tennis", icon: "🎾" },
    ],
    hobbies: [
      { id: "swimming", name: "Swimming", icon: "🏊" },
      { id: "travelling", name: "Travelling", icon: "✈️" },
      { id: "zumba", name: "Zumba", icon: "💃" },
      { id: "cycling", name: "Cycling", icon: "🚴" },
      { id: "gym", name: "Gym", icon: "🏋️" },
      { id: "running", name: "Running", icon: "🏃" },
    ],
  };

  const handleSelect = (typeId, category) => {
    setSelectedType(typeId);
    setSelectedCategory(category);
  };

  const handleSave = () => {
    if (selectedType && selectedCategory) {
      // Save to localStorage or state management
      // For now, just go back to home
      router.push("/home");
    }
  };

  const handleSkip = () => {
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-[#0f1021] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handleSkip}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
            <span>Skip</span>
          </button>
          <h1 className="text-white text-xl font-semibold">Select Profile Type</h1>
          <div className="w-16"></div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-400 text-sm">
            Choose the activity that best represents your profile. This helps Playymate show better player matches, relevant posts, and sports communities.
          </p>
        </div>

        {/* Sports Category */}
        <div className="mb-8">
          <h3 className="text-gray-400 text-sm font-medium mb-4">Sports</h3>
          <div className="grid grid-cols-3 gap-2">
            {categories.sports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => handleSelect(sport.id, "sports")}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedType === sport.id
                    ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                    : "bg-[#1b1d3a] text-gray-300 hover:bg-purple-500/30"
                }`}
              >
                <span className="text-xl mb-1 block">{sport.icon}</span>
                <span className="text-xs font-medium">{sport.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hobbies Category */}
        <div className="mb-8">
          <h3 className="text-gray-400 text-sm font-medium mb-4">Hobbies</h3>
          <div className="grid grid-cols-3 gap-2">
            {categories.hobbies.map((hobby) => (
              <button
                key={hobby.id}
                onClick={() => handleSelect(hobby.id, "hobbies")}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedType === hobby.id
                    ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                    : "bg-[#1b1d3a] text-gray-300 hover:bg-purple-500/30"
                }`}
              >
                <span className="text-xl mb-1 block">{hobby.icon}</span>
                <span className="text-xs font-medium">{hobby.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-8">
          <p className="text-purple-300 text-sm">
            This helps Playymate show better player matches, relevant posts, sports communities, and suggested follows.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!selectedType}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-orange-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check size={20} />
          Save Profile Type
        </button>
      </div>
    </div>
  );
}
