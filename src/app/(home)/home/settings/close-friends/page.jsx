"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { userService } from "@/services/user";
import closeFriendsService from "@/app/user/close-friend.jsx";

export default function CloseFriendsPage() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user's profile and followers/following
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user profile which includes followers and following
        const meRes = await userService.getMe();
        const meData = meRes?.data?.data || meRes?.data;
        
        console.log("User data response:", meRes);
        
        if (meData) {
          setCurrentUserId(meData._id);
          
          // Get followers and following from the user data
          // Handle different possible field names
          let followersData = meData?.followers || meData?.follower_list || meData?.followers_list || [];
          let followingData = meData?.following || meData?.following_list || meData?.following_list || [];
          
          console.log("Followers from getMe:", followersData);
          console.log("Following from getMe:", followingData);
          
          // If no data from getMe, try fetching separately
          if ((!followersData || followersData.length === 0) && (!followingData || followingData.length === 0) && meData._id) {
            try {
              const [followersRes, followingRes] = await Promise.all([
                userService.getFollowers(meData._id, 100, null),
                userService.getFollowing(meData._id, 100, null)
              ]);
              
              followersData = followersRes?.data?.data?.items || followersRes?.data?.data || followersRes?.data || [];
              followingData = followingRes?.data?.data?.items || followingRes?.data?.data || followingRes?.data || [];
              
              console.log("Followers from API:", followersData);
              console.log("Following from API:", followingData);
            } catch (apiErr) {
              console.error("Error fetching followers/following:", apiErr);
            }
          }
          
          // Combine followers and following into one list
          const allUsers = [
            ...followersData,
            ...followingData
          ];
          
          console.log("All users combined:", allUsers);
          
          // Remove duplicates based on _id
          const uniqueUsers = allUsers.filter((user, index, self) => {
            const userId = user._id;
            return index === self.findIndex((u) => u._id === userId);
          });
          
          console.log("Unique users:", uniqueUsers);
          setUsers(uniqueUsers);
          console.log("Users set to state:", uniqueUsers);
        }
        
        // Fetch current close friends list
        try {
          const closeFriendsRes = await closeFriendsService.getCloseFriends(100, null);
          
          // Handle different response formats
          let closeFriendsData = [];
          const cfResData = closeFriendsRes?.data;
          
          if (Array.isArray(cfResData)) {
            closeFriendsData = cfResData;
          } else if (cfResData?.items && Array.isArray(cfResData.items)) {
            closeFriendsData = cfResData.items;
          } else if (cfResData?.data && Array.isArray(cfResData.data)) {
            closeFriendsData = cfResData.data;
          }
          
          // Get usernames of close friends for selection state
          const closeFriendUsernames = closeFriendsData.map(f => f.username);
          setSelected(closeFriendUsernames);
        } catch (cfErr) {
          console.error("Error fetching close friends:", cfErr);
        }
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle user selection and save to API
  const toggleUser = async (user) => {
    const username = user.username;
    const isCurrentlySelected = selected.includes(username);
    
    setSaving(true);
    
    try {
      if (isCurrentlySelected) {
        // Remove from close friends
        await closeFriendsService.removeFromCloseFriends(username);
        setSelected(selected.filter(s => s !== username));
      } else {
        // Add to close friends
        await closeFriendsService.addToCloseFriends(username);
        setSelected([...selected, username]);
      }
    } catch (err) {
      console.error("Error updating close friends:", err);
    } finally {
      setSaving(false);
    }
  };

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(q) ||
      user.full_name?.toLowerCase().includes(q)
    );
  });

  // Sort users: close friends first, then others
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aIsCloseFriend = selected.includes(a.username);
    const bIsCloseFriend = selected.includes(b.username);
    if (aIsCloseFriend && !bIsCloseFriend) return -1;
    if (!aIsCloseFriend && bIsCloseFriend) return 1;
    return 0;
  });

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <h1 className="text-xl font-semibold mb-2">
        Close friends
      </h1>

      <p className="text-sm text-gray-500 mb-4">
        We don't send notifications when you edit your close friends list.
        <span className="text-blue-500 ml-1 cursor-pointer">
          How it works.
        </span>
      </p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-gray-100 rounded-lg px-4 py-2 mb-4 outline-none"
      />

      {/* Selected count */}
      <p className="text-sm text-gray-500 mb-4">
        {selected.length} close friends selected
        {saving && <span className="ml-2 inline-flex items-center"><Loader2 size={14} className="animate-spin" /></span>}
      </p>

      {/* User List - All Followers & Following */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-2">
          {sortedUsers.map((user) => {
            const username = user.username;
            const isSelected = selected.includes(username);
            const userId = user.user_id || user.id || user._id;

            return (
              <div
                key={userId}
                onClick={() => !saving && toggleUser(user)}
                className={`flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 ${saving ? "opacity-50 pointer-events-none" : ""}`}
              >
                {/* Left - User Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={user.profile_image_url || user.profilePic || "/profile.png"}
                    alt="user"
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.full_name || user.fullName}
                    </p>
                  </div>
                </div>

                {/* Right - Circular Ring Button */}
                <button
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    isSelected
                      ? "bg-orange-500 border-orange-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    !saving && toggleUser(user);
                  }}
                >
                  {isSelected && (
                    <Check size={16} className="text-white" />
                  )}
                </button>
              </div>
            );
          })}
          
          {sortedUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
