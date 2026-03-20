"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, UserMinus, Check, Search, Loader2 } from "lucide-react";
import { userService } from "@/services/user";
import { useTheme } from "@/lib/ThemeContext";

export default function FollowersFollowingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "followers"; // followers or following
  const userId = searchParams.get("userId");
  
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    // Get current user from localStorage or context
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUserId(user?.user_id || user?._id);
  }, []);
  
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [type, userId]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (type === "followers") {
        response = await userService.getFollowers(userId, 20, null);
      } else if (type === "following") {
        response = await userService.getFollowing(userId, 20, null);
      }
      
      // Handle different response structures
      const items = response?.data?.data?.items 
        || response?.data?.data 
        || response?.data 
        || [];
      setData(items);
    } catch (err) {
      console.error("Error fetching " + type + ":", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollowToggle = async (targetUserId, isCurrentlyFollowing) => {
    try {
      if (isCurrentlyFollowing) {
        await userService.unfollowUser(targetUserId);
      } else {
        await userService.followUser(targetUserId);
      }
      // Refresh the list
      fetchData();
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };
  
  const handleUserClick = (targetUserId) => {
    if (targetUserId === currentUserId) {
      router.push("/home/profile");
    } else {
      router.push(`/home/profile/${targetUserId}`);
    }
  };
  
  // Filter data based on search query
  const filteredData = data.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <div className={`min-h-screen ${isDark ? "bg-[#1a1a38]" : "bg-gray-50"}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3 ${isDark ? "bg-[#1a1a38]" : "bg-white"} border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
        <ArrowLeft 
          className={`cursor-pointer ${isDark ? "text-white" : "text-gray-700"}`}
          onClick={() => router.back()}
        />
        <h1 className={`text-lg font-semibold capitalize ${isDark ? "text-white" : "text-gray-900"}`}>
          {type}
        </h1>
      </div>
      
      {/* Search Box */}
      <div className="px-4 py-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <Search size={18} className={isDark ? "text-gray-400" : "text-gray-500"} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent outline-none ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}`}
          />
        </div>
      </div>
      
      {/* List */}
      <div className="px-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            No {type} found
          </div>
        ) : (
          filteredData.map((user) => (
            <div
              key={user.user_id || user.id}
              className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
              onClick={() => handleUserClick(user.user_id || user.id)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.profile_image_url || user.profile_image || user.profile || "/profile.png"}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className={`text-base font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                    {user.username || user.name}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {user.full_name || user.bio}
                  </p>
                  {user.mutual_connections > 0 && (
                    <p className="text-xs text-purple-500">
                      {user.mutual_connections} mutual connection{user.mutual_connections > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              
              {user.user_id !== currentUserId && (
                <button 
                  className={`text-sm px-4 py-2 rounded-lg flex items-center gap-1 ${
                    user.is_following 
                      ? isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700" 
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowToggle(user.user_id || user.id, user.is_following);
                  }}
                >
                  {user.is_following ? (
                    <>
                      <Check size={16} />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
