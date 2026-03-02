"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Calendar, User, ShoppingCart, Users, Trophy, HelpCircle, Compass, Flame, Zap, Menu, X, BookOpen } from "lucide-react";

export default function Sidebar({ isOpen = true, onToggle }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen);

  const handleToggle = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (onToggle) onToggle(newState);
  };

  const menu = [
    { name: "Home", icon: <Home size={22} />, path: "/home" },
    { name: "Listings", icon: <Menu size={22} />, path: "/home/listings" },
    { name: "Explore", icon: <Compass size={22} />, path: "/home/explore" },
    { name: "Streak", icon: <Flame size={22} />, path: "/home/streak" },
    { name: "Passport", icon: <BookOpen size={22} />, path: "/passport" },
    { name: "Shopping", icon: <ShoppingCart size={22} />, path: "/shopping" },
    { name: "Events", icon: <Calendar size={22} />, path: "/events" },
    { name: "Teams", icon: <Users size={22} />, path: "/teams" },
    { name: "Leaderboard", icon: <Trophy size={22} />, path: "/leaderboard" },
    { name: "Community", icon: <Users size={22} />, path: "/community" },
    { name: "Bookings", icon: <Calendar size={22} />, path: "/bookings" },
    { name: "Help & Support", icon: <HelpCircle size={22} />, path: "/help" },
    { name: "Profile", icon: <User size={22} />, path: "/home/profile" },
  ];

  return (
    <div className={`
      fixed
      left-0
      top-0
      h-screen
      bg-[#121226]
      border-r border-gray-800
      ${isSidebarOpen ? 'w-[220px]' : 'w-[70px]'}
      transition-all duration-300
      z-50
      overflow-hidden
    `}>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute top-4 right-3 z-50 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? (
          <X size={20} className="text-gray-400 hover:text-white" />
        ) : (
          <Menu size={20} className="text-gray-400 hover:text-white" />
        )}
      </button>

      {/* Logo Section */}
      <div className="flex items-center h-16 border-b border-gray-800 px-4 relative w-full">
        {/* Small Logo (collapsed) */}
        <div className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
          <img 
            src="/playymate-icon.png" 
            alt="Playymate Icon" 
            className="w-10 h-10 object-contain"
          />
        </div>
        {/* Full Logo (expanded) */}
        <div className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 flex items-center gap-2 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
          <img 
            src="/playymate-logo.png" 
            alt="Playymate Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>

      {/* Menu Items - Custom thin scrollbar */}
      <div className="flex flex-col mt-2 space-y-1 px-2 pb-20 h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden
        scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-gray-700
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar]:hover:bg-gray-600
      ">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all relative z-50 cursor-pointer pointer-events-auto
              ${pathname === item.path
                ? "bg-gradient-to-r from-purple-600 to-orange-500"
                : "hover:bg-gray-800"
              }`}
          >
            <div className="min-w-[22px] flex items-center justify-center">
              {item.icon}
            </div>
            <span className={`whitespace-nowrap transition-opacity duration-300 text-sm ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              {item.name}
            </span>
          </Link>
        ))}

        {/* Upgrade Link */}
        <div className="pt-2 mt-2 border-t border-gray-800">
          <Link
            href="/home/upgrade"
            className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all relative z-50 cursor-pointer pointer-events-auto
              ${pathname === "/home/upgrade"
                ? "bg-gradient-to-r from-purple-600 to-orange-500"
                : "hover:bg-gray-800"
              }`}
          >
            <div className="min-w-[22px] flex items-center justify-center">
              <Zap size={22} className="text-yellow-400" />
            </div>
            <span className={`whitespace-nowrap transition-opacity duration-300 text-sm font-medium text-yellow-400 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              Upgrade
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
