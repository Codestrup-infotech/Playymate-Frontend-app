"use client";
import { useTheme } from "@/lib/ThemeContext";

/**
 * A single row in the suggested-users list.
 * Props:
 *   avatar  – image src string (optional, falls back to gradient placeholder)
 *   username – string
 *   subtitle – string (e.g. "Followed by mutual_friend")
 *   onFollow – callback
 */
export default function SuggestedUserItem({ avatar, username, subtitle, onFollow }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className="flex items-center justify-between py-2">
            {/* Avatar + text */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 p-[2px] flex-shrink-0">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full rounded-full ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                    )}
                </div>

                <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                        {username}
                    </p>
                    <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Follow Button */}
            <button
                onClick={onFollow}
                className="text-blue-500 text-sm font-semibold hover:text-blue-400 transition-colors ml-3 flex-shrink-0"
            >
                Follow
            </button>
        </div>
    );
}
