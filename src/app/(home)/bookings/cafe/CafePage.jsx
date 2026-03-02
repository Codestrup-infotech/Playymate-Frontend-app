"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { cafes } from "./data/cafes";
import CafeCard from "./components/CafeCard";
import BookingModal from "./components/BookingModal";

export default function CafePage() {
  const router = useRouter();

  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [groupSize, setGroupSize] = useState(2);

  const handleBook = (cafe) => {
    setSelectedCafe(cafe);
    setShowSuccess(true);
  };

  return (
    <div className="bg-black text-white min-h-screen pb-32 px-6 pt-6">

      {/* Heading */}
      <h1 className="text-4xl font-bold leading-tight">
        Cafe{" "}
        <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
          Hopping
        </span>
      </h1>

      <p className="text-gray-400 mt-2 mb-6">
        Curated Cafe Trails For Every Mood
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

      {/* Cards */}
      <div className="space-y-6">
        {cafes.map((cafe) => (
          <CafeCard
            key={cafe.id}
            cafe={cafe}
            groupSize={groupSize}
            setGroupSize={setGroupSize}
            onBook={() => handleBook(cafe)}
          />
        ))}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <BookingModal
          cafe={selectedCafe}
          groupSize={groupSize}
          onClose={() => setShowSuccess(false)}
          onBrowse={() => {
            setShowSuccess(false);
            router.push("/booking");
          }}
        />
      )}
    </div>
  );
}