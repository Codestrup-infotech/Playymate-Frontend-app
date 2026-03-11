"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, MapPin, Star } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Categories Data
const categories = [
  { name: "All", active: true },
  { name: "Football", active: false },
  { name: "Cricket", active: false },
  { name: "Hockey", active: false },
  { name: "Tennis", active: false },
  { name: "Basketball", active: false },
  { name: "Swimming", active: false },
  { name: "Badminton", active: false },
];

// Venues Data
const venues = [
  { id: "elite-football-arena", title: "Elite Football Arena", price: 350, location: "Baner", distance: "25 Km", rating: 5.0, available: true, image: "/search/football.jpg" },
  { id: "pro-cricket-ground", title: "Pro Cricket Ground", price: 500, location: "Wakad", distance: "14 Km", rating: 4.8, available: true, image: "/search/cricket.jpg" },
  { id: "champion-tennis-court", title: "Champion Tennis Court", price: 280, location: "Khadki", distance: "18 Km", rating: 4.5, available: false, image: "/search/tennis.jpg" },
  { id: "olympic-swimming-pool", title: "Olympic Swimming Pool", price: 450, location: "Koregaon Park", distance: "8 Km", rating: 4.9, available: true, image: "/search/yoga.jpg" },
  { id: "basketball-academy", title: "Basketball Academy", price: 320, location: "Hadapsar", distance: "12 Km", rating: 4.7, available: true, image: "/explore/3.jpg" },
  { id: "badminton-hall", title: "Badminton Hall", price: 200, location: "Viman Nagar", distance: "20 Km", rating: 4.6, available: true, image: "/explore/1.jpg" },
];

function VenueCard({ venue, isDark }) {
  const router = useRouter();
  const routableVenueIds = ["elite-football-arena", "pro-cricket-ground", "champion-tennis-court"];
  const isRoutable = routableVenueIds.includes(venue.id);
  const cardBg = isDark
    ? "bg-[#1a1a2e] border-white/10 hover:border-white/20"
    : "bg-white border-gray-100 hover:border-purple-200";
  const mutedText = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div
      onClick={() => isRoutable && router.push(`/home/listings/${venue.id}`)}
      className={`rounded-2xl overflow-hidden border transition-all duration-300 ${cardBg} ${isRoutable ? "hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer" : "opacity-90 cursor-default"
        }`}
    >
      <div className="relative aspect-video">
        <img src={venue.image} alt={venue.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-orange-500 px-3 py-1.5 rounded-lg">
          <span className="text-white font-semibold">₹{venue.price}/session</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{venue.title}</h3>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${venue.available ? "bg-green-500" : "bg-red-500"}`} />
            <span className={`text-xs ${mutedText}`}>{venue.available ? "Available" : "Booked"}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 mb-2 ${mutedText}`}>
          <MapPin size={14} />
          <span className="text-sm">{venue.location} · {venue.distance}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={14} className={star <= Math.floor(venue.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} />
          ))}
          <span className="text-yellow-400 text-sm ml-1 font-medium">{venue.rating}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryTabs({ isDark }) {
  const [activeCategory, setActiveCategory] = useState("All");
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => setActiveCategory(category.name)}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeCategory === category.name
              ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
              : isDark
                ? "bg-[#1a1a2e] text-gray-400 hover:bg-[#252542]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

function SearchBar({ isDark }) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputBg = isDark
    ? "bg-[#1a1a2e] border-white/10 text-white placeholder-gray-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400";

  return (
    <div className="relative">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        className={`w-full border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 ${inputBg}`}
      />
      <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl border border-pink-500/50 flex items-center justify-center hover:bg-pink-500/10 transition-colors">
        <SlidersHorizontal size={18} className="text-pink-500" />
      </button>
    </div>
  );
}

export default function ListingsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pageBg = isDark ? "bg-[#0f0f1a] text-white" : "bg-gray-50 text-gray-900";
  const headerBg = isDark ? "bg-[#0f0f1a]/80 border-white/5" : "bg-white/80 border-gray-200";

  return (
    <div className={`min-h-screen pb-10 animate-fade-in transition-colors duration-300 ${pageBg}`}>
      {/* Top Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-lg border-b ${headerBg}`}>
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold">Listings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-4">
        <div className="mb-6"><SearchBar isDark={isDark} /></div>
        <div className="mb-6"><CategoryTabs isDark={isDark} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue, index) => (
            <VenueCard key={index} venue={venue} isDark={isDark} />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}
