"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home, Calendar, User, ShoppingCart, Users, Trophy, Wallet, Map,
  HelpCircle, Compass, Flame, Zap, Menu, BookOpen, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function Sidebar({ isOpen = true, onToggle }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // default open
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleToggle = () => {
    const next = !isSidebarOpen;
    setIsSidebarOpen(next);
    if (onToggle) onToggle(next);
  };

  const menu = [
    { name: "Home", icon: <Home size={22} />, path: "/home" },
    { name: "Listings", icon: <Menu size={22} />, path: "/home/listings" },
    { name: "Explore", icon: <Compass size={22} />, path: "/home/explore" },
    { name: "Streak", icon: <Flame size={22} />, path: "/home/streak" },
    { name: "Map", icon: <Map size={22} />, path: "/map" },
    { name: "Passport", icon: <BookOpen size={22} />, path: "/passport" },
    { name: "Shopping", icon: <ShoppingCart size={22} />, path: "/shopping" },
    { name: "Events", icon: <Calendar size={22} />, path: "/events" },
    { name: "Teams", icon: <Users size={22} />, path: "/teams" },
    { name: "Leaderboard", icon: <Trophy size={22} />, path: "/leaderboard" },
    { name: "Community", icon: <Users size={22} />, path: "/community" },
    { name: "Bookings", icon: <Calendar size={22} />, path: "/bookings" },
    { name: "Help & Support", icon: <HelpCircle size={22} />, path: "/help" },
    { name: "Wallet", icon: <Wallet size={22} />, path: "/wallet" },
    { name: "Profile", icon: <User size={22} />, path: "/home/profile" },
  ];

  return (
    <div
      className={`
        fixed left-0 top-0 h-screen
        ${isSidebarOpen ? "w-[240px]" : "w-[72px]"}
        transition-all duration-300 ease-in-out
        z-50 overflow-hidden
        ${isDark ? "bg-[#121226]" : "bg-gray-100"}
      `}
    >
      {/* Logo + Toggle Button Row */}
      <div className="flex items-center justify-between h-16 px-3 relative w-full">
        {/* Small Logo (collapsed) */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-200 ${isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
          <img
            src="/playymate-icon.png"
            alt="Playymate Icon"
            className="w-10 h-10 object-contain"
          />
        </div>
        {/* Full Logo (expanded) */}
        <div
          className={`transition-opacity duration-200 flex items-center gap-2 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <img
            src="/playymate-logo.png"
            alt="Playymate Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Toggle Button — always visible, right side */}
        <button
          onClick={handleToggle}
          className={`ml-auto flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md
            transition-colors duration-200
            ${isDark ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}
          `}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Menu Items */}
      <div
        className={`flex flex-col mt-2 space-y-0.5 px-2 pb-20 h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden
          scrollbar-thin scrollbar-track-transparent
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          ${isDark
            ? "[&::-webkit-scrollbar-thumb]:bg-gray-700 scrollbar-thumb-gray-700"
            : "[&::-webkit-scrollbar-thumb]:bg-gray-300 scrollbar-thumb-gray-300"
          }
        `}
      >
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer
              ${pathname === item.path
                ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                : isDark
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            {/* Icon — always visible */}
            <div className="min-w-[22px] flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>

            {/* Label — slides in when hover-open */}
            <span
              className={`whitespace-nowrap text-base font-medium transition-opacity duration-200 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
              {item.name}
            </span>
          </Link>
        ))}

        {/* Upgrade Link */}
        <div className="pt-2 mt-2">
          <Link
            href="/home/upgrade"
            className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer
              ${pathname === "/home/upgrade"
                ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                : isDark
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-100"
              }`}
          >
            <div className="min-w-[22px] flex items-center justify-center flex-shrink-0">
              <Zap size={22} className="text-yellow-400" />
            </div>
            <span
              className={`whitespace-nowrap text-base font-medium text-yellow-400 transition-opacity duration-200 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
              Upgrade
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
