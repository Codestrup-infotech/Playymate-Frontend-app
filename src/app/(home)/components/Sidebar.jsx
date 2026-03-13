"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home, Calendar, User, ShoppingCart, Users, Trophy, Wallet, Map,
  HelpCircle, Compass, Flame, Zap, Menu, BookOpen,
  Search, LogOut, Sun, Moon, PlusSquare
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";
  const [isHover, setIsHover] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
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

  // NEW OPTIONS
  { name: "Search", icon: <Search size={22} />, path: "/home/search" },
  { name: "Create Post", icon: <PlusSquare size={22} />, path: "/home/create-post" },

  // actions
  { name: "Switch Mode", icon: theme === "dark" ? <Sun size={22}/> : <Moon size={22}/>, action: "theme" },
  { name: "Logout", icon: <LogOut size={22} />, action: "logout" }
];
  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={`fixed left-0 top-0 h-screen
      ${isHover ? "w-[240px]" : "w-[72px]"}
      transition-all duration-300 ease-in-out
      z-50 overflow-hidden
      ${isDark ? "bg-[#121226]" : "bg-gray-100"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3">
        <img
          src="/playymate-icon.png"
          alt="icon"
          className={`w-10 h-10 object-contain transition-all duration-300
          ${isHover ? "mr-2" : "mx-auto"}`}
        />

        <img
          src="/playymate-logo.png"
          alt="logo"
          className={`h-8 object-contain transition-all duration-300
          ${isHover ? "opacity-100 w-auto" : "opacity-0 w-0"}
          `}
        />
      </div>

      {/* Menu */}
      <div className="flex flex-col mt-2 px-2 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">

      {menu.map((item) => {

  // LOGOUT BUTTON
  if (item.action === "logout") {
    return (
      <button
        key={item.name}
        onClick={handleLogout}
        className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-300
        text-red-400 hover:text-red-500`}
      >
        <div className="min-w-[22px] flex justify-center">
          {item.icon}
        </div>

        <span
          className={`whitespace-nowrap font-medium transition-all duration-300
          ${isHover ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
        >
          {item.name}
        </span>
      </button>
    );
  }

  // THEME SWITCH
  if (item.action === "theme") {
    return (
      <button
        key={item.name}
        onClick={toggleTheme}
        className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-300
        ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-200"}`}
      >
        <div className="min-w-[22px] flex justify-center">
          {item.icon}
        </div>

        <span
          className={`whitespace-nowrap font-medium transition-all duration-300
          ${isHover ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
        >
          {item.name}
        </span>
      </button>
    );
  }

  // NORMAL LINK
  return (
    <Link
      key={item.name}
      href={item.path}
      className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-300
      ${pathname === item.path
        ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
        : isDark
        ? "text-gray-300 hover:bg-gray-800"
        : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      <div className="min-w-[22px] flex justify-center">
        {item.icon}
      </div>

      <span
        className={`whitespace-nowrap font-medium transition-all duration-300
        ${isHover ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
      >
        {item.name}
      </span>
    </Link>
  );
})}
</div>

    </div>
  );
}