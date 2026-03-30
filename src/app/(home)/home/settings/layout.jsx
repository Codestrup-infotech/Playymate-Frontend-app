"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Lock, Users, HelpCircle, VolumeX, FileWarning, Trash2 } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const menuItems = [
    {
      name: "Edit Profile",
      path: "/home/profile/edit",
      icon: <User size={20} />,
    },
    {
      name: "Account Privacy",
      path: "/home/settings/account-privacy",
      icon: <Lock size={20} />,
    },
    {
      name: "Close Friends",
      path: "/home/settings/close-friends",
      icon: <Users size={20} />,
    },
    {
      name: "Muted Users",
      path: "/home/settings/muted-user-list",
      icon: <VolumeX size={20} />,
    },
    {
      name: "Withdraw Report",
      path: "/home/settings/withdraw-report",
      icon: <FileWarning size={20} />,
    },
    {
      name: "Delete My Account",
      path: "/home/settings/delete-my-account",
      icon: <Trash2 size={20} className="text-red-500" />,
    },
    {
      name: "Help",
      path: "/home/settings/help",
      icon: <HelpCircle size={20} />,
    },
  ];

  return (
    
    <div className={`flex max-w-full lg:w-3/4   h-screen fixed ${isDark ? 'bg-[#12122A]' : 'bg-white '} ${isDark ? 'text-white' : 'text-black'}`}>
       
      {/* Sidebar */}
      <div className={`w-72 ${isDark ? 'border-r border-gray-800' : 'border-r border-gray-200'} p-4 overflow-y-auto flex-shrink-0 ${isDark ? 'bg-[#12122A]' : 'bg-white'}`}>
        <h2 className="text-lg font-semibold mb-6">Settings</h2>

        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={index}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? isDark ? "bg-gray-800 font-medium" : "bg-gray-200 font-medium"
                    : isDark ? "hover:bg-gray-900 text-white" : "hover:bg-gray-100 text-black"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE CONTENT */}
      <div className="flex-1 overflow-y-auto">
         {children}
      </div>
    </div> 
  ); 
}
