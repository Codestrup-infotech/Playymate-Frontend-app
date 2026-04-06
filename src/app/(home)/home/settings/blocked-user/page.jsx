"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Ban, Search } from "lucide-react";
import { userService } from "@/services/user";
import { useRouter } from "next/navigation";

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [unblocking, setUnblocking] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const response = await userService.getBlockedUsers(100, null);
        console.log("Blocked users response:", response);
        
        const data = response?.data?.data || response?.data;
        const users = data?.blocked_users || data?.users || data || [];
        
        console.log("Blocked users list:", users);
        setBlockedUsers(users);
      } catch (err) {
        console.error("Error fetching blocked users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (userId, username) => {
    setUnblocking(userId);
    
    try {
      await userService.unblockUser(userId);
      setBlockedUsers(blockedUsers.filter(u => {
        const user = u.user || u;
        return user._id !== userId && user.user_id !== userId;
      }));
      console.log("User unblocked successfully");
    } catch (err) {
      console.error("Error unblocking user:", err);
      alert("Failed to unblock user. Please try again.");
    } finally {
      setUnblocking(null);
    }
  };

  const handleUserClick = (username) => {
    router.push(`/home/profile/${username}`);
  };

  const filteredUsers = blockedUsers.filter((item) => {
    const user = item.user || item;
    const q = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(q) ||
      user.full_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-2xl lg:px-20 lg:py-10 h-full flex flex-col">
      <h1 className="text-xl font-semibold mb-2">
        Blocked Users
      </h1>

      <p className="text-sm text-gray-500 mb-4">
        Blocked users won't be able to find you or interact with you.
      </p>

      {blockedUsers.length > 0 && (
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search blocked users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 outline-none"
          />
        </div>
      )}

      {blockedUsers.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          {blockedUsers.length} blocked user{blockedUsers.length !== 1 ? 's' : ''}
        </p>
      )}

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
            const blockedAt = item.blocked_at || item.createdAt;
            
            return (
              <div
                key={userId}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
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
                    <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                      <Ban size={10} className="text-white" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      @{user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.full_name || user.fullName}
                    </p>
                    {blockedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Blocked on {new Date(blockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleUnblock(userId, user.username)}
                  disabled={unblocking === userId}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    unblocking === userId
                      ? "bg-gray-100 text-gray-400"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {unblocking === userId ? (
                    <span className="flex items-center gap-1">
                      <Loader2 size={14} className="animate-spin" />
                      Unblocking...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Check size={14} />
                      Unblock
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Ban size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            {searchQuery ? "No blocked users found" : "No blocked users"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? "Try a different search" : "Users you block will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}