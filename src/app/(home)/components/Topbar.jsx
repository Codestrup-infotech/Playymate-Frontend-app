"use client";

import { Radio, Bell, MessageCircle, Search, MapPin, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Topbar({ isSidebarOpen = true }) {
  const router = useRouter();

  const handleLogout = () => {
    // Remove auth data (adjust based on your project)
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div
      className={`h-16 border-b border-gray-800 flex items-center justify-between px-4 md:px-6 bg-[#0f0f1a] fixed top-0 right-0 z-50 transition-all duration-300 ${
        isSidebarOpen ? "left-[220px]" : "left-[70px]"
      }`}
    >
      {/* Left Side - Profile Info */}
      <Link
        href="/home/profile"
        className="flex items-center gap-3 cursor-pointer group"
      >
        <img
          src="data:image/png;base64,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"
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover group-hover:ring-2 ring-purple-500 transition-all"
        />
        <div className="group-hover:opacity-80 transition-opacity">
          <p className="font-semibold text-white">XYZ</p>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <MapPin size={14} />
            Vadgaon khurd, Nanded
          </p>
        </div>
      </Link>

      {/* Right Side - Action Icons */}
      <div className="flex items-center gap-5">
        <Radio size={22} className="text-white cursor-pointer hover:text-purple-500 transition-colors" />

        <Link href="/home/livestream">
          <Bell size={22} className="text-white cursor-pointer hover:text-purple-500 transition-colors" />
        </Link>

        <MessageCircle size={22} className="text-white cursor-pointer hover:text-purple-500 transition-colors" />

        <Link href="/home/search" className="flex items-center justify-center">
          <Search size={22} className="text-white hover:text-purple-500 transition-colors" />
        </Link>

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