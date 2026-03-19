"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Home, Calendar, User, ShoppingCart, Users, Trophy, Wallet, Map,
  HelpCircle, Compass, Flame, Zap, Menu, BookOpen,
  Search, LogOut, Sun, Moon, PlusSquare, Image, Video, Circle
} from "lucide-react";

import { useTheme } from "@/lib/ThemeContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";
  const [isHover, setIsHover] = useState(false);
  const [openCreateMenu, setOpenCreateMenu] = useState(false);
  const createMenuRef = useRef(null);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpenCreateMenu(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target)) {
        setOpenCreateMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleCreatePost = () => {
    router.push("/home/create-post");
    setOpenCreateMenu(false);
  };

  const handleCreateReel = () => {
    router.push("/home/create-reel");
    setOpenCreateMenu(false);
  };

  const handleCreateStory = () => {
    router.push("/home/create-story");
    setOpenCreateMenu(false);
  };

  const toggleCreateMenu = () => {
    setOpenCreateMenu(!openCreateMenu);
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
    { name: "Subscription", icon: <Zap size={22} />, path: "/home/subscription" },

    // NEW OPTIONS
    { name: "Search", icon: <Search size={22} />, path: "/home/search" },
    { name: "Create Post", icon: <PlusSquare size={22} />, path: "/home/create-post", isCreatePost: true },

    // actions
    { name: "Switch Mode", icon: theme === "dark" ? <Sun size={22}/> : <Moon size={22}/>, action: "theme" },
    { name: "Logout", icon: <LogOut size={22} />, action: "logout" }
  ];
  return (
    <div
      ref={createMenuRef}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={`fixed left-0 top-0 h-screen
      ${isHover ? "w-[240px]" : "w-[72px]"}
      transition-all duration-300 ease-in-out
      z-50 overflow-visible
      ${isDark ? "bg-[#121226]" : "bg-gray-100"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3">
        {/* Show icon only when sidebar is closed (not hovered) */}
        <img
          src="/playymate-icon.png"
          alt="Playymate Icon"
          className={`w-10 h-10 object-contain transition-all duration-300 ${
            isHover ? "opacity-0 w-0" : "opacity-100 w-10 mx-auto"
          }`}
        />

        {/* Show logo only when sidebar is open (hovered) */}
        <img
          src="/playymate-logo.png"
          alt="Playymate Logo"
          className={`h-8 object-contain transition-all duration-300 ${
            isHover ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
          }`}
        />
      </div>

      {/* Menu */}
      <div className="flex flex-col mt-2 px-2 space-y-1 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
        {menu.map((item) => {
          // logout
          if (item.action === "logout") {
            return (
              <button
                key={item.name}
                onClick={handleLogout}
                className="flex items-center gap-4 px-3 py-3 rounded-lg text-red-400 hover:text-red-500"
              >
                <div className="min-w-[22px] flex justify-center">
                  {item.icon}
                </div>

                <span
                  className={`whitespace-nowrap font-medium transition-all duration-300 ${
                    isHover ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          }

          // theme toggle
          if (item.action === "theme") {
            return (
              <button
                key={item.name}
                onClick={toggleTheme}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-300 ${
                  isDark
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
      </button>
    );
  }

  // CREATE POST - Opens Dropdown Menu
  if (item.isCreatePost) {
    return (
      <div key={item.name} className="relative">
        <button
          onClick={toggleCreateMenu}
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-300
          ${pathname === item.path || openCreateMenu
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
          
        </button>

     
        {openCreateMenu && (
          <div 
            className={`ml-4 mt-1 rounded-lg overflow-hidden transition-all duration-200 
            ${isDark ? "bg-[#1a1a2e]" : "bg-white"}
            shadow-lg border ${isDark ? "border-gray-700" : "border-gray-200"}
            ${isHover ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}
            `}
          >
            <button
              onClick={handleCreatePost}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
              ${isDark 
                ? "text-gray-300 hover:bg-gray-800" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Image size={16} />
              <span className="whitespace-nowrap">Post</span>
            </button>
            
            <button
              onClick={handleCreateReel}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
              ${isDark 
                ? "text-gray-300 hover:bg-gray-800" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Video size={16} />
              <span className="whitespace-nowrap">Reel</span>
            </button>
            
            <button
              onClick={handleCreateStory}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
              ${isDark 
                ? "text-gray-300 hover:bg-gray-800" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Circle size={16} />
              <span className="whitespace-nowrap">Story</span>
            </button>
          </div>
        )}
      </div>
    );
  }


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
