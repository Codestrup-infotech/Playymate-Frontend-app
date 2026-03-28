"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Lock, Users, HelpCircle, VolumeX, FileWarning } from "lucide-react";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

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
      name: "Help",
      path: "/home/settings/help",
      icon: <HelpCircle size={20} />,
    },
  ];

  return (
   
   <div className="flex max-w-full h-screen fixed bg-white text-black overflow-hidden">
      
      {/* Sidebar (ALWAYS VISIBLE) */}
      <div className="w-72 border-r border-gray-200 p-4 overflow-y-auto">
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
                    ? "bg-gray-200 font-medium"
                    : "hover:bg-gray-100"
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
     <div className="flex-1 p-4">
        {children}
      </div>
    </div> 
  ); 
}