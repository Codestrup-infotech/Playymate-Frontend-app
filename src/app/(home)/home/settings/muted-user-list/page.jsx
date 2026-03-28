"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, VolumeX, Search } from "lucide-react";
import { userService } from "@/services/user";
import { useRouter } from "next/navigation";

export default function MutedUsersPage() {
  const [mutedUsers, setMutedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [unmuting, setUnmuting] = useState(null);
  const router = useRouter();

  // Fetch muted users
  useEffect(() => {
    const fetchMutedUsers = async () => {
      try {
        const response = await userService.getMutedUsers(100, null);
        console.log("Muted users response:", response);
        
        const data = response?.data?.data || response?.data;
        const users = data?.muted_users || data?.users || data || [];
        
        console.log("Muted users list:", users);
        setMutedUsers(users);
      } catch (err) {
        console.error("Error fetching muted users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMutedUsers();
  }, []);

  // Unmute user
  const handleUnmute = async (userId, username) => {
    setUnmuting(userId);
    
    try {
      await userService.unmuteUser(userId);
      setMutedUsers(mutedUsers.filter(u => {
        const user = u.user || u;
        return user._id !== userId && user.user_id !== userId;
      }));
      console.log("User unmuted successfully");
    } catch (err) {
      console.error("Error unmuting user:", err);
      alert("Failed to unmute user. Please try again.");
    } finally {
      setUnmuting(null);
    }
  };

  // Navigate to user profile
  const handleUserClick = (username) => {
    router.push(`/home/profile/${username}`);
  };

  // Filter users by search query
  const filteredUsers = mutedUsers.filter((item) => {
    const user = item.user || item;
    const q = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(q) ||
      user.full_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-2xl h-full flex flex-col">
      {/* Header */}
      <h1 className="text-xl font-semibold mb-2">
        Muted Users
      </h1>

      <p className="text-sm text-gray-500 mb-4">
        You won't see posts, stories, or notifications from muted users.
      </p>

      {/* Search */}
      {mutedUsers.length > 0 && (
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search muted users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 outline-none"
          />
        </div>
      )}

      {/* User Count */}
      {mutedUsers.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          {mutedUsers.length} muted user{mutedUsers.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Muted Users List */}
      {loading ? (
        <div className="text-center py-8 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          Loading...
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredUsers.map((item) => {
            const user = item.user || item;
            const userId = user._id || user.user_id || user.id;
            const options = item.options || {};
            
            return (
              <div
                key={userId}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                {/* Left - User Info */}
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleUserClick(user.username)}
                >
                  <div className="relative">
                    <img
                      src={user.profile_image_url || user.profilePic || "/profile.png"}
                      alt="user"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {/* Muted indicator */}
                    <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                      <VolumeX size={10} className="text-white" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      @{user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.full_name || user.fullName}
                    </p>
                    {/* Show what is muted */}
                    <div className="flex gap-1 mt-1">
                      {options.mute_posts && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Posts</span>
                      )}
                      {options.mute_stories && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Stories</span>
                      )}
                      {options.mute_notifications && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Notifications</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right - Unmute Button */}
                <button
                  onClick={() => handleUnmute(userId, user.username)}
                  disabled={unmuting === userId}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    unmuting === userId
                      ? "bg-gray-100 text-gray-400"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {unmuting === userId ? (
                    <span className="flex items-center gap-1">
                      <Loader2 size={14} className="animate-spin" />
                      Unmuting...
                    </span>
                  ) : (
                    "Unmute"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <VolumeX size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            {searchQuery ? "No muted users found" : "No muted users"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? "Try a different search" : "Users you mute will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}