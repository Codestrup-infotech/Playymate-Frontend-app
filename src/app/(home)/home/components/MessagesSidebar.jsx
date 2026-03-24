"use client";

import { useState, useEffect } from "react";
import {
  getConversations,
  getMessageRequests,
  pinConversation,
  unpinConversation,
  leaveConversation,
} from "@/services/messages";

// ─── Token & ID helpers ────────────────────────────────────────────────────────

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

// ─── UI helpers ────────────────────────────────────────────────────────────────

function initials(name = "") {
  const p = (name || "").trim().split(" ");
  return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase();
}

const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

function colorFor(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return COLORS[h % COLORS.length];
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getConvName(conv, myId) {
  if (conv.is_group) return conv.group_name || "Group";
  const other = (conv.participants || []).find(
    (p) => (p.user_id?._id || p.user_id) !== myId
  );
  return other?.user_id?.full_name || "Unknown";
}

function getConvImg(conv, myId) {
  if (conv.is_group) return null;
  const other = (conv.participants || []).find(
    (p) => (p.user_id?._id || p.user_id) !== myId
  );
  return other?.user_id?.profile_image_url || null;
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name = "", imgUrl = null, size = 9 }) {
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0 object-cover`;
  if (imgUrl) return <img src={imgUrl} alt={name} className={cls} />;
  return (
    <div className={`${cls} flex items-center justify-center text-xs font-semibold ${colorFor(name)}`}>
      {initials(name) || "?"}
    </div>
  );
}

// ─── Conversation list item ────────────────────────────────────────────────────

function ConvItem({ conv, myId, active, onClick, menuOpen, onMenuToggle, onPin, onDelete }) {
  const name    = getConvName(conv, myId);
  const img     = getConvImg(conv, myId);
  const unread  = conv.unread_counts?.[myId] || 0;
  const pinned  = (conv.pinned_by || []).includes(myId);
  const lm      = conv.last_message;
  const preview = lm
    ? lm.is_deleted ? "Message deleted" : lm.content || (lm.media_type ? "📎 Media" : "")
    : "No messages yet";
  const isMenuOpen = menuOpen === conv._id;

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 ${
          active ? "bg-pink-50 border-r-2 border-r-pink-500" : "hover:bg-gray-50"
        }`}
      >
        <div className="relative flex-shrink-0">
          <Avatar name={name} imgUrl={img} size={10} />
          {conv.is_group && (
            <span className="absolute -bottom-0.5 -right-0.5 bg-orange-100 text-orange-600 text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">G</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 truncate">{name}</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400">{formatTime(conv.last_message_at)}</span>
              {/* Three dot menu button below time */}
              <button
                onClick={(e) => { e.stopPropagation(); onMenuToggle(conv._id); }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs text-gray-500 truncate">{preview}</span>
            <div className="flex items-center gap-1 ml-1 flex-shrink-0">
              {pinned && <span className="text-[10px]">📌</span>}
              {unread > 0 && (
                <span
                  className="text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}
                >{unread}</span>
              )}
            </div>
          </div>
        </div>

      </button>
      {/* Popup menu */}
      {isMenuOpen && (
        <div className="absolute right-4 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px] conv-menu">
          <button
            onClick={() => { onPin(conv); onMenuToggle(null); }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            {pinned ? "📌 Unpin" : "📌 Pin"}
          </button>
          <button
            onClick={() => { onDelete(conv); onMenuToggle(null); }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-500"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar Component ───────────────────────────────────────────────────

export default function MessagesSidebar({
  connected = false,
  search = "",
  setSearch = () => {},
  setShowNewConv = () => {},
  selectedConv = null,
  onSelectConv = () => {},
  onConversationsChange = () => {},
  onMessageRequestsChange = () => {},
  myId = "",
}) {
  const [localConvLoading, setLocalConvLoading] = useState(true);
  const [localConversations, setLocalConversations] = useState([]);
  const [messageRequests, setMessageRequests] = useState([]);
  const [menuOpenConvId, setMenuOpenConvId] = useState(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpenConvId && !e.target.closest('.conv-menu')) {
        setMenuOpenConvId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpenConvId]);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      setLocalConvLoading(true);
      try {
        const data = await getConversations({ limit: 50 });
        let convs = data?.conversations || [];
        
        // Sort conversations: pinned first, then by most recent message
        const myId = getMyId();
        const pinnedByMe = (conv) => (conv.pinned_by || []).includes(myId);
        
        convs = [...convs].sort((a, b) => {
          // Pinned conversations first
          const aPinned = pinnedByMe(a);
          const bPinned = pinnedByMe(b);
          if (aPinned && !bPinned) return -1;
          if (!aPinned && bPinned) return 1;
          
          // Then sort by most recent message
          const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return bTime - aTime;
        });
        
        setLocalConversations(convs);
        onConversationsChange(convs);
      } catch (e) {
        console.error("fetchConversations:", e.message);
      } finally {
        setLocalConvLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch message requests on mount
  useEffect(() => {
    const fetchMessageRequests = async () => {
      try {
        const response = await getMessageRequests({ limit: 20 });
        console.log('[MessagesSidebar] Message requests response:', response);
        if (response.status === 'success' && response.data) {
          setMessageRequests(response.data.requests || []);
          onMessageRequestsChange(response.data.requests || []);
        }
      } catch (err) {
        console.error('Error fetching message requests:', err);
      }
    };
    fetchMessageRequests();
  }, []);

  // Filter conversations based on search
  const sidebarMyId = getMyId();
  const filtered = localConversations.filter((c) =>
    getConvName(c, sidebarMyId).toLowerCase().includes(search.toLowerCase())
  );

  // Handle menu toggle
  const handleMenuToggle = (convId) => {
    setMenuOpenConvId(menuOpenConvId === convId ? null : convId);
  };

  // Handle pin/unpin conversation
  const handlePin = async (conv) => {
    const isPinned = (conv.pinned_by || []).includes(sidebarMyId);
    try {
      if (isPinned) {
        await unpinConversation(conv._id);
      } else {
        await pinConversation(conv._id);
      }
      // Refresh conversations
      const data = await getConversations({ limit: 50 });
      let convs = data?.conversations || [];
      const pinnedByMe = (c) => (c.pinned_by || []).includes(sidebarMyId);
      convs = [...convs].sort((a, b) => {
        const aPinned = pinnedByMe(a);
        const bPinned = pinnedByMe(b);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bTime - aTime;
      });
      setLocalConversations(convs);
      onConversationsChange(convs);
    } catch (e) {
      console.error("Pin/unpin error:", e.message);
    }
  };

  // Handle delete conversation
  const handleDelete = async (conv) => {
    if (!window.confirm("Are you sure you want to delete this conversation? This will remove all messages.")) {
      return;
    }
    try {
      await leaveConversation(conv._id);
      // Remove from local state
      const updated = localConversations.filter((c) => c._id !== conv._id);
      setLocalConversations(updated);
      onConversationsChange(updated);
      // If this was the selected conversation, clear selection
      if (selectedConv?._id === conv._id) {
        onSelectConv(null);
      }
    } catch (e) {
      console.error("Delete error:", e.message);
    }
  };

  const handleSelectConv = (conv) => {
    onSelectConv(conv);
  };

  const isLoading = localConvLoading;

  return (
    <div className="w-80 lg:h-[560px] flex-shrink-0 flex flex-col bg-white border-r border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-gray-300"}`}
            title={connected ? "Connected" : "Connecting..."}
          />
        </div>
        <button
          onClick={() => setShowNewConv(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Request button */}
      <div className="flex justify-end px-4 py-2">
        <button className="text-xs text-pink-500 hover:text-pink-600 font-medium">
          request
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-400">No conversations</p>
        ) : (
          filtered.map((conv) => (
            <ConvItem
              key={conv._id}
              conv={conv}
              myId={sidebarMyId}
              active={selectedConv?._id === conv._id}
              onClick={() => handleSelectConv(conv)}
              menuOpen={menuOpenConvId}
              onMenuToggle={handleMenuToggle}
              onPin={handlePin}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
