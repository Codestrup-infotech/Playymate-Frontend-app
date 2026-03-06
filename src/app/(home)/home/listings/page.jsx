"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, MapPin, Star, Home, Compass, Plus, Wallet, Grid3X3, ArrowLeft } from "lucide-react";

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
  {
    id: "elite-football-arena",
    title: "Elite Football Arena",
    price: 350,
    location: "Baner",
    distance: "25 Km",
    rating: 5.0,
    available: true,
    image: "/search/football.jpg",
  },
  {
    id: "pro-cricket-ground",
    title: "Pro Cricket Ground",
    price: 500,
    location: "Wakad",
    distance: "14 Km",
    rating: 4.8,
    available: true,
    image: "/search/cricket.jpg",
  },
  {
    id: "champion-tennis-court",
    title: "Champion Tennis Court",
    price: 280,
    location: "Khadki",
    distance: "18 Km",
    rating: 4.5,
    available: false,
    image: "/search/tennis.jpg",
  },
  {
    id: "olympic-swimming-pool",
    title: "Olympic Swimming Pool",
    price: 450,
    location: "Koregaon Park",
    distance: "8 Km",
    rating: 4.9,
    available: true,
    image: "/search/yoga.jpg",
  },
  {
    id: "basketball-academy",
    title: "Basketball Academy",
    price: 320,
    location: "Hadapsar",
    distance: "12 Km",
    rating: 4.7,
    available: true,
    image: "/explore/3.jpg",
  },
  {
    id: "badminton-hall",
    title: "Badminton Hall",
    price: 200,
    location: "Viman Nagar",
    distance: "20 Km",
    rating: 4.6,
    available: true,
    image: "/explore/1.jpg",
  },
];

// VenueCard Component
function VenueCard({ venue }) {
  const router = useRouter();
  const routableVenueIds = ["elite-football-arena", "pro-cricket-ground", "champion-tennis-court"];
  const isRoutable = routableVenueIds.includes(venue.id);

  return (
    <div 
      onClick={() => isRoutable && router.push(`/home/listings/${venue.id}`)}
      className={`bg-[#111111] rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 ${
        isRoutable
          ? "hover:border-white/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
          : "opacity-90 cursor-default"
      }`}
    >
      {/* Image Section */}
      <div className="relative aspect-video">
        <img
          src={venue.image}
          alt={venue.title}
          className="w-full h-full object-cover"
        />
        {/* Price Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-orange-500 px-3 py-1.5 rounded-lg">
          <span className="text-white font-semibold">₹{venue.price}/session</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title and Availability */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold text-lg">{venue.title}</h3>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${venue.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-xs text-gray-400">{venue.available ? 'Available' : 'Booked'}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-400 mb-2">
          <MapPin size={14} />
          <span className="text-sm">{venue.location} · {venue.distance}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={star <= Math.floor(venue.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
            />
          ))}
          <span className="text-yellow-400 text-sm ml-1 font-medium">{venue.rating}</span>
        </div>
      </div>
    </div>
  );
}

// CategoryTabs Component
function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => setActiveCategory(category.name)}
          className={`
            px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
            ${activeCategory === category.name
              ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
              : "bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]"
            }
          `}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

// SearchBar Component
function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
      />
      <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl border border-pink-500/50 flex items-center justify-center hover:bg-pink-500/10 transition-colors">
        <SlidersHorizontal size={18} className="text-pink-500" />
      </button>
    </div>
  );
}

// BottomNav Component
// function BottomNav() {
//   const [activeTab, setActiveTab] = useState("home");

//   const navItems = [
//     { name: "Home", icon: <Home size={22} />, active: true },
//     { name: "Search", icon: <Compass size={22} />, active: false },
//     { name: "Post", icon: <Plus size={24} />, active: true, isCenter: true },
//     { name: "Map", icon: <Grid3X3 size={22} />, active: false },
//     { name: "Wallet", icon: <Wallet size={22} />, active: false },
//   ];

//   return (
//     <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-white/10 pb-safe">
//       <div className="flex items-center justify-around py-3 px-4">
//         {navItems.map((item) => (
//           <button
//             key={item.name}
//             onClick={() => setActiveTab(item.name.toLowerCase())}
//             className={`
//               flex flex-col items-center gap-1 transition-all duration-300
//               ${item.isCenter ? "relative -top-5" : ""}
//             `}
//           >
//             {item.isCenter ? (
//               <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-transform">
//                 <Plus size={28} className="text-white" />
//               </div>
//             ) : (
//               <div className={`
//                 p-2 rounded-lg transition-colors
//                 ${item.active ? "text-pink-500" : "text-gray-500"}
//               `}>
//                 {item.icon}
//               </div>
//             )}
//             <span className={`text-xs ${item.active ? "text-pink-500" : "text-gray-500"}`}>
//               {item.name}
//             </span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// Main Page Component
export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-24 animate-fade-in">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-2">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <CategoryTabs />
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue, index) => (
            <VenueCard key={index} venue={venue} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      {/* <BottomNav /> */}

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
}
