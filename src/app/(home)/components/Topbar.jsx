"use client";

import { Radio, Bell, MessageCircle, Search, LogOut, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";

export default function Topbar({ isSidebarOpen = true }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`h-16 flex items-center justify-end px-4 md:px-6 fixed top-0 right-0 z-50 transition-all duration-300 ${isSidebarOpen ? "left-[240px]" : "left-[70px]"
        } ${isDark
          ? "bg-[#0f0f1a]"
          : "bg-gray-100"
        }`}
    >
      {/* Right Side - Action Icons */}
      <div className="flex items-center gap-5">
        <Radio
          size={22}
          className={`cursor-pointer hover:text-purple-500 transition-colors ${isDark ? "text-white" : "text-gray-600"}`}
        />

        {/* <Link href="/home/livestream">
          <Bell
            size={22}
            className={`cursor-pointer hover:text-purple-500 transition-colors ${isDark ? "text-white" : "text-gray-600"}`}
          />
        </Link> */}

        {/* <MessageCircle
          size={22}
          className={`cursor-pointer hover:text-purple-500 transition-colors ${isDark ? "text-white" : "text-gray-600"}`}
        /> */}

        <Link href="/home/search" className="flex items-center justify-center">
          <Search
            size={22}
            className={`hover:text-purple-500 transition-colors ${isDark ? "text-white" : "text-gray-600"}`}
          />
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 hover:scale-110 ${isDark
            ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}