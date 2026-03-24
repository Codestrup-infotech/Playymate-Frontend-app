"use client";

import { useTheme } from "@/lib/ThemeContext";

export default function NotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`flex items-center justify-center h-full min-h-[60vh] transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}>
      <div className="text-center">
        <div className="text-6xl mb-4">🔔</div>
        <h2 className="text-2xl font-bold mb-2">Notifications</h2>
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>You have no new notifications</p>
      </div>
    </div>
  );
}
