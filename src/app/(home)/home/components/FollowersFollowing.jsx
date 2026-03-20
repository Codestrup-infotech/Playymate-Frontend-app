"use client";

import { useState, useEffect } from "react";
import { X, Check, UserPlus } from "lucide-react";
import { userService } from "@/services/user";
import { useTheme } from "@/lib/ThemeContext";
import { useRouter } from "next/navigation";

export default function FollowModal({
  type,
  isOpen,
  onClose,
  userId,
  currentUserId,
  followersData,
  followingData,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // CONFIRM POPUP STATE
  const [confirmUser, setConfirmUser] = useState(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  useEffect(() => {
    if (isOpen && type) {
      if (followersData || followingData) {
        setData(type === "followers" ? followersData || [] : followingData || []);
        setLoading(false);
      } else if (userId) {
        fetchData();
      }
    }
  }, [isOpen, type, userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;

      if (type === "followers") {
        response = await userService.getFollowers(userId, 20, null);
      } else {
        response = await userService.getFollowing(userId, 20, null);
      }

      const items =
        response?.data?.data?.items ||
        response?.data?.data ||
        response?.data ||
        [];

      setData(items);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (targetUserId) => {
    onClose();
    if (targetUserId === currentUserId) {
      router.push("/home/profile");
    } else {
      router.push(`/home/profile/${targetUserId}`);
    }
  };

  // REMOVE / UNFOLLOW CONFIRM
  const handleConfirmAction = async () => {
    try {
      if (!confirmUser) return;

      if (type === "followers") {
        await userService.removeFollower(confirmUser.id);
      } else {
        await userService.unfollowUser(confirmUser.id);
      }

      setConfirmUser(null);
      // Close the modal after successful action
      onClose();
    } catch (err) {
      console.error(err);
      setConfirmUser(null);
    }
  };

  const filteredData = data.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(q) ||
      user.full_name?.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <>
      {/* MAIN MODAL */}
      <div 
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={`w-[400px] max-h-[500px] rounded-xl flex flex-col ${
            isDark ? "bg-[#1a1a38]" : "bg-white"
          }`}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h2 className="font-semibold capitalize">{type}</h2>
            <X onClick={onClose} className="cursor-pointer" />
          </div>

          {/* SEARCH */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 rounded-md outline-none"
            />
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-6">Loading...</div>
            ) : (
              filteredData.map((user) => {
                const id = user.user_id || user.id || user._id;

                return (
                  <div
                    key={id}
                    className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleUserClick(id)}
                  >
                    {/* USER */}
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profile_image_url || "/profile.png"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.full_name}
                        </p>
                      </div>
                    </div>

                    {/* BUTTON */}
                    {id !== currentUserId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmUser({
                            id: id,
                            username: user.username,
                            image: user.profile_image_url,
                          });
                        }}
                        className={`text-sm px-3 py-1 rounded-md ${
                          type === "followers"
                            ? "bg-gray-200 text-black"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        {type === "followers" ? "Remove" : "Following"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM POPUP */}
      {confirmUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="w-[350px] bg-white rounded-xl text-center p-5">
            <img
              src={confirmUser.image || "/profile.png"}
              className="w-16 h-16 rounded-full mx-auto mb-3"
            />

            {type === "followers" ? (
              <>
                <h3 className="font-semibold text-lg">Remove follower?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Playymate won't tell @{confirmUser.username}
                </p>

                <button
                  onClick={handleConfirmAction}
                  className="w-full text-red-500 py-2 mt-4 border-t"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  If you change your mind, you'll have to request to follow
                  @{confirmUser.username} again.
                </p>

                <button
                  onClick={handleConfirmAction}
                  className="w-full text-red-500 py-2 mt-4 border-t"
                >
                  Unfollow
                </button>
              </>
            )}

            <button
              onClick={() => setConfirmUser(null)}
              className="w-full py-2 border-t"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}