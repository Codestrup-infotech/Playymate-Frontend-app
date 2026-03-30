"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { userService } from "@/services/user";
import closeFriendsService from "@/app/user/close-friend.jsx";

export default function CloseFriendsPage() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
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
          
          // Only use followers - API only allows adding followers as close friends
          const allUsers = followersData;
          
          console.log("Followers only:", allUsers);
          
          // Remove duplicates based on _id and filter out users without username
          const uniqueUsers = allUsers.filter((user, index, self) => {
            const userId = user._id;
            // Filter out users without username - they can't be added to close friends
            if (!user.username) {
              console.warn('Skipping user without username:', user);
              return false;
            }
            return index === self.findIndex((u) => u._id === userId);
          });
          
          console.log("Unique users with username:", uniqueUsers);
          console.log("=== ALL USERS FOR CLOSE FRIENDS ===");
          console.log("Total unique users:", uniqueUsers.length);
          console.log("Users list:", uniqueUsers);
          console.log("====================================");
          setUsers(uniqueUsers);
          console.log("Users set to state:", uniqueUsers);
        }
        
        // Fetch current close friends list
        try {
          const closeFriendsRes = await closeFriendsService.getCloseFriends(100, null);
          console.log("Close friends response:", closeFriendsRes);
          console.log("Close friends response.data:", closeFriendsRes?.data);
          console.log("Close friends response.data.data:", closeFriendsRes?.data?.data);
          console.log("Close friends response.data.items:", closeFriendsRes?.data?.items);
          
          // Handle different response formats
          let closeFriendsData = [];
          const cfResData = closeFriendsRes?.data;
          
          // Debug: Log all keys in the response data object
          if (cfResData && typeof cfResData === 'object') {
            console.log("Keys in cfResData:", Object.keys(cfResData));
          }
          
          if (Array.isArray(cfResData)) {
            closeFriendsData = cfResData;
          } else if (cfResData?.items && Array.isArray(cfResData.items)) {
            closeFriendsData = cfResData.items;
          } else if (cfResData?.data?.members && Array.isArray(cfResData.data.members)) {
            // Handle response.data.data.members format
            closeFriendsData = cfResData.data.members;
          } else if (cfResData?.data && Array.isArray(cfResData.data)) {
            closeFriendsData = cfResData.data;
          } else if (cfResData && typeof cfResData === 'object') {
            // Try to find any array property in the object
            for (const key of Object.keys(cfResData)) {
              if (Array.isArray(cfResData[key])) {
                console.log(`Found array in cfResData.${key}:`, cfResData[key]);
                closeFriendsData = cfResData[key];
                break;
              }
            }
          }
          
          console.log("Close friends data parsed:", closeFriendsData);
          
          // Get usernames of close friends for selection state
          // Handle multiple possible field names for username
         const closeFriendIds = closeFriendsData.map(f => f._id).filter(Boolean);
setSelected(closeFriendIds);
          
          console.log("=== CLOSE FRIENDS LIST ===");
          console.log("Total close friends:", closeFriendsData.length);
          console.log("Close friend IDs:", closeFriendIds);
          console.log("Close friends full data:", closeFriendsData);
          console.log("=========================");
        } catch (cfErr) {
          console.error("Error fetching close friends:", cfErr);
        }
        
      } catch (err) {
        console.error(err);
      } finally {
      }

    };

    fetchData();
  }, []);

  // Toggle user selection and save to API
  const toggleUser = async (user) => {
    const userId = user._id;
    const username = user.username;

    if (!userId || !username) return;

    const isCurrentlySelected = selected.includes(userId);

    setSaving(true);

    try {
      if (isCurrentlySelected) {
        await closeFriendsService.removeFromCloseFriends(username);
        setSelected(selected.filter(id => id !== userId));
      } else {
        try {
          await closeFriendsService.addToCloseFriends(username);
          setSelected([...selected, userId]);
        } catch (addErr) {
          // Handle ALREADY_CLOSE_FRIEND error - remove from close friends instead
          if (addErr?.response?.data?.error_code === 'ALREADY_CLOSE_FRIEND') {
            await closeFriendsService.removeFromCloseFriends(username);
            setSelected(selected.filter(id => id !== userId));
          } else {
            throw addErr;
          }
        }
      }
    } catch (err) {
      console.error("Error toggling close friend:", err);
      
      // Handle specific error: USER_NOT_A_FOLLOWER
      if (err?.response?.data?.error_code === 'USER_NOT_A_FOLLOWER') {
        alert('This user is not your follower. You can only add followers as close friends.');
      } else {
        alert('Failed to update close friends. Please try again.');
      }
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
    const aIsCloseFriend = selected.includes(a._id);
    const bIsCloseFriend = selected.includes(b._id);
    if (aIsCloseFriend && !bIsCloseFriend) return -1;
    if (!aIsCloseFriend && bIsCloseFriend) return 1;
    return 0;
  });

  return (
    <div className="bg-white  lg:px-20 lg:py-9 h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0">
        <h1 className="text-xl font-semibold mb-2">
          Close friends
        </h1>

        <p className="text-sm text-gray-500 mb-4">
          We don't send notifications when you edit your close friends list.
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-100 rounded-lg px-4 py-2 mb-4 outline-none"
        />
      </div>

      {/* Selected count - Sticky at top */}
      <div className="sticky top-0 bg-white py-2 z-10 flex-shrink-0">
        <p className="text-sm text-gray-500">
          {selected.length} close friends selected
          {saving && <span className="ml-2 inline-flex items-center"><Loader2 size={14} className="animate-spin" /></span>}
        </p>
      </div>

      {/* User list - Scrollable */}
      <div className="flex-1 overflow-y-auto">
          {sortedUsers.map((user) => {
            const username = user.username;
            const isSelected = selected.includes(user._id);
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
                      ? "bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]  hover:bg-gradient-r hover:from-[#FF8319] hover:to-[#EF3AFF] border-none "
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
    </div>
  );
}
