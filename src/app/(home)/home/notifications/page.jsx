"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import {
  getAllNotifications,
  getNotificationsByType,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/app/user/notifications";
import { userService } from "@/services/user";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "post_liked", label: "Likes" },
  { key: "reel_liked", label: "Reels" },
  { key: "comment_on_post", label: "Comments" },
  { key: "user_followed", label: "Follows" },
  { key: "message_received", label: "Messages" },
];

const ActorAvatar = ({ actor, onClick }) => {
  if (!actor?.profile_image_url) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="w-10 h-10"
        >
          {/* Background circle */}
          <circle cx="12" cy="12" r="12" fill="#E5E7EB" />

          {/* Head */}
          <circle cx="12" cy="9" r="4" fill="#9CA3AF" />

          {/* Body */}
          <path
            d="M6 19c0-3.314 2.686-6 6-6s6 2.686 6 6"
            fill="#9CA3AF"
          />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={actor.profile_image_url}
      onClick={onClick}
      className="w-10 h-10 rounded-full object-cover cursor-pointer"
    />
  );
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

export default function NotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [followingUsers, setFollowingUsers] = useState({}); // Track follow status per user
  const notificationsPerPage = 10;

  // Get current notifications for pagination
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(
        res?.data?.unread_count ||
          res?.unread_count ||
          res?.data?.notifications_count ||
          0
      );
    } catch {
      const unread = notifications.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    }
  };

  const fetchNotifications = async (type = "all") => {
    try {
      setLoading(true);
      let res;

      if (type === "all") res = await getAllNotifications();
      else if (type === "unread") res = await getUnreadNotifications();
      else res = await getNotificationsByType(type);

      setNotifications(res?.data?.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((i) => (i._id === id ? { ...i, is_read: true } : i))
    );
    fetchUnreadCount();
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading(true);
    await markAllAsRead();
    setNotifications((prev) =>
      prev.map((i) => ({ ...i, is_read: true }))
    );
    setUnreadCount(0);
    setActionLoading(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((i) => i._id !== id));
    fetchUnreadCount();
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    setActionLoading(true);
    await clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
    setActionLoading(false);
  };

  const handleNotificationClick = async (item) => {
    if (!item.is_read) {
      await markAsRead(item._id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === item._id ? { ...n, is_read: true } : n
        )
      );
      fetchUnreadCount();
    }
  };

  const handleUserClick = (userId) => {
    router.push(`/home/profile/${userId}`);
  };

  const handleFollow = async (userId) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await userService.followUser(userId);
      setFollowingUsers((prev) => ({ ...prev, [userId]: true }));
      setNotifications((prev) =>
        prev.map((n) =>
          n.actor_id?._id === userId ? { ...n, is_following: true } : n
        )
      );
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    fetchNotifications(activeTab);
    fetchUnreadCount();
  }, [activeTab]);

  return (
    <div className={`${isDark ? "bg-black text-white" : "bg-white text-black"} min-h-screen lg:max-w-4xl rounded-2xl py-4 lg:mr-10 lg:px-8 `}>

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-10 bg-inherit px-4 py-4 flex items-center justify-between backdrop-blur-sm bg-opacity-95">
        <h1 className="text-xl font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading}
            className="text-sm text-pink-500 hover:text-pink-600 font-medium"
          >
            {actionLoading ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* STICKY TABS */}
      <div className="sticky top-16 z-10 bg-inherit px-4  border-b border-gray-200 text-sm overflow-x-auto backdrop-blur-sm bg-opacity-95">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-pink-500 border-b-2 border-pink-500"
                  : "text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SCROLLABLE NOTIFICATION LIST */}
      <div className="px-4 space-y-4 lg:mt-6 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
        {currentNotifications.map((item) => (
          <div
            key={item._id}
            onClick={() => handleNotificationClick(item)}
            className="flex items-start gap-3"
          >
            <ActorAvatar 
              actor={item?.actor_id} 
              onClick={() => item?.actor_id?._id && handleUserClick(item.actor_id._id)}
            />

            <div className="flex-1 border-b border-gray-100  pb-3">
              {/* FOR FOLLOWS: Title + Time + Follow Back button on same line */}
              {item.notification_type === "user_followed" ? (
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-sm">
                      <span 
                        className="font-semibold cursor-pointer hover:text-pink-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          item?.actor_id?._id && handleUserClick(item.actor_id._id);
                        }}
                      >
                        {item?.actor_id?.full_name}
                      </span>{" "}
                      {item.title}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {formatTime(item.created_at)}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          item?.actor_id?._id && handleFollow(item.actor_id._id);
                        }}
                        disabled={actionLoading}
                        className="bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] hover:bg-gradient-r hover:from-[#FF8319] hover:to-[#EF3AFF] px-3 py-1.5 font-Poppins text-white text-xs rounded-full disabled:opacity-50"
                      >
                        {followingUsers[item?.actor_id?._id] ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 ">
                    {item.body}
                  </p>
                </div>
              ) : (
                /* FOR OTHER NOTIFICATIONS: Title + Time (time on right with space) */
                <div>
                  <div className="flex  items-start">
                    <p className="text-sm pr-4">
                      <span 
                        className="font-semibold cursor-pointer hover:text-pink-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          item?.actor_id?._id && handleUserClick(item.actor_id._id);
                        }}
                      >
                        {item?.actor_id?.full_name}
                      </span>{" "}
                      {item.title}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatTime(item.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.body}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={(e) => handleDelete(item._id, e)}
              className="text-gray-500 text-xs bg-orange-50 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
        
        {/* PAGINATION - inside scrollable area */}
        {totalPages > 1 && (
          <div className="py-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {indexOfFirstNotification + 1}-{Math.min(indexOfLastNotification, notifications.length)} of {notifications.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}
        
        {/* Read all link inside scrollable area */}
        {notifications.length > notificationsPerPage && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setCurrentPage(totalPages);
              }}
              className="text-sm text-pink-500 hover:text-pink-600 font-medium"
            >
              Read all →
            </button>
          </div>
        )}
      </div>

      {!loading && notifications.length === 0 && (
        <div className="flex justify-center items-center h-[60vh] text-gray-400">
          No notifications
        </div>
      )}
    </div>
  );
}
