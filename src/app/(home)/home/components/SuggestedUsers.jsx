"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";
import SuggestedUserItem from "./SuggestedUserItem";
import { getSuggestedFollows } from "@/services/feed.service";
import { userService } from "@/services/user";

export default function SuggestedUsers() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    
    const [currentUser, setCurrentUser] = useState(null);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current user
                const userRes = await userService.getMe();
                const userData = userRes?.data?.data || userRes?.data;
                if (userData) {
                    setCurrentUser({
                        avatar: userData.profile_image_url || userData.profile_photos?.[0]?.url,
                        username: userData.username,
                        fullName: userData.full_name
                    });
                }

                // Fetch suggested users
                const suggestedRes = await getSuggestedFollows();
                const suggestedData = suggestedRes?.data?.data || suggestedRes?.data || [];
                
                // Transform API data to match component format
                const formattedUsers = suggestedData.map((user, index) => ({
                    id: user._id || user.id || index,
                    avatar: user.profile_image_url || user.profile_photos?.[0]?.url,
                    username: user.username,
                    subtitle: user.is_following ? "Following" : (user.followers_count > 0 ? `Followed by ${user.followers_count} users` : "New to Playymate")
                }));
                
                setSuggestedUsers(formattedUsers);
            } catch (error) {
                console.error("Error fetching suggested users:", error);
                setSuggestedUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFollow = async (userId) => {
        try {
            await userService.followUser(userId);
            // Update the UI to show following state
            setSuggestedUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, subtitle: "Following" } : user
            ));
        } catch (error) {
            console.error("Error following user:", error);
        }
    };

    if (loading) {
        return (
            <div className="w-full p-4">
                <div className="animate-pulse">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                        <div className="flex-1">
                            <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                            <div className="h-2 bg-gray-300 rounded w-16"></div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-300 rounded w-32 mb-1"></div>
                                    <div className="h-2 bg-gray-300 rounded w-24"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[320px] h-full">

            {/* ── Current User Row ── */}
            {currentUser && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 p-[2px] flex-shrink-0">
                            <img
                                src={currentUser.avatar || "/loginAvatars/profile.png"}
                                alt={currentUser.username}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                {currentUser.username}
                            </p>
                            <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {currentUser.fullName}
                            </p>
                        </div>
                    </div>
                    <button className="text-blue-500 text-xs font-semibold hover:text-blue-400 transition-colors ml-3 flex-shrink-0">
                        Switch
                    </button>
                </div>
            )}

            {/* ── Suggested Header ── */}
            <div className="flex items-center justify-between mb-2 px-3">
                <p className={`text-sm font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Suggested for you
                </p>
                <button className={`text-xs font-semibold hover:opacity-70 transition-opacity ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    See all
                </button>
            </div>

            {/* ── Suggested User List ── */}
            <div className="space-y-1">
                {suggestedUsers.map((user) => (
                    <SuggestedUserItem
                        key={user.id}
                        avatar={user.avatar}
                        username={user.username}
                        subtitle={user.subtitle}
                        onFollow={() => handleFollow(user.id)}
                    />
                ))}
            </div>

            {suggestedUsers.length === 0 && (
                <p className={`text-sm text-center py-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    No suggestions available
                </p>
            )}
          
        </div>
    );
}
