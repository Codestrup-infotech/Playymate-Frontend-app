"use client";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getConversations } from "@/services/messages";

// Decode JWT to get logged-in user's ID (same as page.jsx)
function getMyId() {
  if (typeof window === "undefined") return "";
  const token =
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    "";
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || payload._id || payload.userId || "";
  } catch {
    return "";
  }
}

export default function MessagesFloatingButton() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();

    // Refresh every 30 seconds to keep count updated ..


    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const myId = getMyId();
      if (!myId) return;

      const data = await getConversations({ limit: 50 });
      const convs = data?.conversations || [];

      // Sum unread counts across all conversations for this user
      const total = convs.reduce((sum, conv) => {
        return sum + (conv.unread_counts?.[myId] || 0);
      }, 0);

      setUnreadCount(total);
    } catch (e) {
      // Silently fail — don't break the button if API is down
    }
  };

  const displayCount = unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => router.push("/home/messages")}
        className="bg-white dark:bg-[#1a1a2e] rounded-full shadow-xl px-5 py-3 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200 border border-gray-100 dark:border-gray-700 group"
        aria-label="Messages"
      >
        {/* Icon */}
        <MessageCircle
          size={20}
          className="text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors"
        />

        {/* Label */}
        <span className="font-semibold text-sm text-gray-900 dark:text-white whitespace-nowrap">
          Messages
        </span>

        {/* Real unread badge — only shown when count > 0 */}
        {displayCount && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center leading-tight">
            {displayCount}
          </span>
        )}
      </button>
    </div>
  );
}