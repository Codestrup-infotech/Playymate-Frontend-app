"use client";
import { useTheme } from "@/lib/ThemeContext";
import SuggestedUserItem from "./SuggestedUserItem";

// Placeholder avatar (same base64 used elsewhere in the project)
const PLACEHOLDER_AVATAR =
    "data:image/png;base64,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";

/** Static mock data — replace with real API data when ready */
const CURRENT_USER = {
    avatar: PLACEHOLDER_AVATAR,
    username: "xyz_playymate",
    fullName: "XYZ",
};

const SUGGESTED_USERS = [
    { id: 1, avatar: null, username: "sarah.wilson", subtitle: "Followed by john_doe" },
    { id: 2, avatar: null, username: "mike_johnson", subtitle: "Followed by sarah.wilson" },
    { id: 3, avatar: null, username: "priya_sharma", subtitle: "New to Playymate" },
    { id: 4, avatar: null, username: "alex_carter", subtitle: "Followed by xyz_playymate" },
    { id: 5, avatar: null, username: "raj.kulkarni", subtitle: "Popular near you" },
];

const FOOTER_LINKS = [
    "About", "Help", "Press", "API", "Jobs", "Privacy", "Terms",
];

export default function SuggestedUsers() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const panelBg = isDark ? "" : "";  // transparent — inherits from layout

    return (
        <div className="w-full">

            {/* ── Current User Row ── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 p-[2px] flex-shrink-0">
                        <img
                            src={CURRENT_USER.avatar}
                            alt={CURRENT_USER.username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                            {CURRENT_USER.username}
                        </p>
                        <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {CURRENT_USER.fullName}
                        </p>
                    </div>
                </div>
                <button className="text-blue-500 text-xs font-semibold hover:text-blue-400 transition-colors ml-3 flex-shrink-0">
                    Switch
                </button>
            </div>

            {/* ── Suggested Header ── */}
            <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Suggested for you
                </p>
                <button className={`text-xs font-semibold hover:opacity-70 transition-opacity ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    See all
                </button>
            </div>

            {/* ── Suggested User List ── */}
            <div className="space-y-0.5">
                {SUGGESTED_USERS.map((user) => (
                    <SuggestedUserItem
                        key={user.id}
                        avatar={user.avatar}
                        username={user.username}
                        subtitle={user.subtitle}
                        onFollow={() => console.log("Follow:", user.username)}
                    />
                ))}
            </div>

            {/* ── Footer Links ── */}
            <div className={`mt-6 flex flex-wrap gap-x-2 gap-y-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                {FOOTER_LINKS.map((link, i) => (
                    <span key={link}>
                        <button className="text-xs hover:underline transition-all">{link}</button>
                        {i < FOOTER_LINKS.length - 1 && (
                            <span className="text-xs ml-2">·</span>
                        )}
                    </span>
                ))}
            </div>

            {/* ── Copyright ── */}
            <p className={`text-xs mt-3 ${isDark ? "text-gray-700" : "text-gray-400"}`}>
                © 2026 Playymate
            </p>
        </div>
    );
}
