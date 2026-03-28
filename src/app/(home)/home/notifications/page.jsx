"use client";

import { useEffect, useState } from "react";
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

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "post_liked", label: "Likes" },
  { key: "reel_liked", label: "Reels" },
  { key: "comment_on_post", label: "Comments" },
  { key: "user_followed", label: "Follows" },
  { key: "message_received", label: "Messages" },
];

// Icon component for notification types
const NotificationIcon = ({ type, actor }) => {
  const icons = {
    post_liked: "❤️",
    reel_liked: "🎬",
    comment_on_post: "💬",
    comment_on_reel: "💬",
    reply_to_comment: "↩️",
    user_mentioned: "@",
    user_followed: "👤",
    story_replied: "📖",
    message_received: "✉️",
    incoming_call: "📞",
    livestream_started: "📺",
    livestream_ended: "🔴",
  };
  return <span className="text-2xl">{icons[type] || "🔔"}</span>;
};

// Actor Avatar component
const ActorAvatar = ({ actor }) => {
  if (!actor?.profile_image_url) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
        {actor?.full_name?.charAt(0) || "?"}
      </div>
    );
  }
  return (
    <img
      src={actor.profile_image_url}
      alt={actor.full_name || "User"}
      className="w-10 h-10 rounded-full object-cover"
    />
  );
};

// Format timestamp
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Unread Count
  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      // Handle different response formats
      setUnreadCount(res?.data?.unread_count || res?.unread_count || res?.data?.notifications_count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      // Calculate from notifications if API fails
      const unread = notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async (type = "all") => {
    try {
      setLoading(true);
      let res;

      if (type === "all") {
        res = await getAllNotifications();
      } else if (type === "unread") {
        res = await getUnreadNotifications();
      } else {
        res = await getNotificationsByType(type);
      }

      console.log("📢 Notifications API Response:", res);
      console.log("📢 Notifications Data:", res?.data);
      console.log("📢 Notifications List:", res?.data?.notifications);

      setNotifications(res?.data?.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, is_read: true } : item
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete single notification
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item._id !== item._id !== id));
      fetchUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    try {
      setActionLoading(true);
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error clearing all:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Navigate to related content
  const handleNotificationClick = async (item) => {
    // Mark as read when clicked
    if (!item.is_read) {
      try {
        await markAsRead(item._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === item._id ? { ...n, is_read: true } : n
          )
        );
        fetchUnreadCount();
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }

    // Navigate based on notification type
    // You can add router.push() here based on item.action_url or item.content_id
    console.log("Navigate to:", item.notification_type, item.content_id || item._id);
  };

  useEffect(() => {
    fetchNotifications(activeTab);
    fetchUnreadCount();
  }, [activeTab]);

  return (
    <div
      className={`min-h-screen px-4 py-6 transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
            }`}
          >
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* 🔹 Action Buttons */}
      {notifications.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-full text-sm transition ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {actionLoading ? "Marking..." : "Mark All Read"}
          </button>
          <button
            onClick={handleClearAll}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-full text-sm transition ${
              isDark
                ? "bg-red-900 hover:bg-red-800 text-red-300"
                : "bg-red-100 hover:bg-red-200 text-red-700"
            }`}
          >
            {actionLoading ? "Clearing..." : "Clear All"}
          </button>
        </div>
      )}

      {/* 🔹 Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 border-b pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              activeTab === tab.key
                ? isDark
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : isDark
                ? "bg-gray-800 text-gray-300"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔹 Content */}
      {loading ? (
        <div className="text-center mt-20">Loading...</div>
      ) : notifications.length === 0 ? (
        // Empty State
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold mb-2">Notifications</h2>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              You have no new notifications
            </p>
          </div>
        </div>
      ) : (
        // Notification List
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 rounded-xl shadow-sm border transition cursor-pointer hover:opacity-90 ${
                isDark
                  ? item.is_read
                    ? "bg-gray-900 border-gray-800"
                    : "bg-gray-800 border-gray-700"
                  : item.is_read
                  ? "bg-gray-50 border-gray-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Actor Avatar */}
                <div className="flex-shrink-0 mt-1">
                  <ActorAvatar actor={item.actor_id} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${item.is_read ? "" : "font-bold"}`}>
                        {item?.actor_id?.full_name || "Someone"} {item?.title || ""}
                      </p>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {item?.body || ""}
                      </p>
                    </div>
                    
                    {/* Actions & Type Icon */}
                    <div className="flex items-center gap-2 ml-2">
                      <NotificationIcon type={item.notification_type} />
                      {!item.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {item?.notification_type}
                    </p>
                    <div className="flex items-center gap-2">
                      {!item.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(item._id, e)}
                          className={`p-1 rounded ${
                            isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                          }`}
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(item._id, e)}
                        className={`p-1 rounded ${
                          isDark ? "hover:bg-gray-700 text-red-400" : "hover:bg-gray-200 text-red-500"
                        }`}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {item?.created_at && formatTime(item.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}