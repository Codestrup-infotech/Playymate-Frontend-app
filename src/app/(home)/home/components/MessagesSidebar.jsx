"use client";

import { useState, useEffect, useRef } from "react";
import {
  getConversations,
  getMessageRequests,
  pinConversation,
  unpinConversation,
  leaveConversation,
} from "@/services/messages";
import { searchAccounts } from "@/app/user/search";

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
  return other?.user_id?.username || other?.user_id?.full_name || "Unknown";
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
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0 object-cover ring-2 ring-white`;
  if (imgUrl) return <img src={imgUrl} alt={name} className={cls} />;
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ring-2 ring-white ${colorFor(name)}`}
    >
      {initials(name) || "@"}
    </div>
  );
}

// ─── Conversation list item ────────────────────────────────────────────────────

function ConvItem({
  conv,
  myId,
  active,
  onClick,
  menuOpen,
  onMenuToggle,
  onPin,
  onDelete,
  onUpdateGroupName,
}) {
  const name   = getConvName(conv, myId);
  const img    = getConvImg(conv, myId);
  const unread = conv.unread_counts?.[myId] || 0;
  const pinned = (conv.pinned_by || []).includes(myId);
  const lm     = conv.last_message;
  const preview = lm
    ? lm.is_deleted
      ? "Message deleted"
      : lm.content || (lm.media_type ? "📎 Media" : "")
    : "No messages yet";
  const isMenuOpen = menuOpen === conv._id;

  return (
    <div className="relative group/item">
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 ${
          active
            ? "bg-gradient-to-r from-pink-50 to-orange-50 border-r-[3px] border-r-pink-500"
            : "hover:bg-gray-50"
        }`}
      >
        {/* Avatar with group badge */}
        <div className="relative flex-shrink-0">
          <Avatar name={name} imgUrl={img} size={10} />
          {conv.is_group && (
            <span className="absolute -bottom-0.5 -right-0.5 bg-orange-400 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-sm">
              G
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span
              className={`text-sm truncate ${
                active ? "font-bold text-gray-900" : "font-semibold text-gray-800"
              }`}
            >
              {name}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[10px] font-medium text-gray-400">
                {formatTime(conv.last_message_at)}
              </span>
              {/* Three-dot menu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuToggle(conv._id);
                }}
                className="w-5 h-5 rounded-full hover:bg-gray-200 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-0.5 gap-1">
            <span
              className={`text-xs truncate ${
                unread > 0 ? "text-gray-700 font-medium" : "text-gray-400"
              }`}
            >
              {preview}
            </span>
            <div className="flex items-center gap-1 ml-1 flex-shrink-0">
              {pinned && (
                <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1v6l2 4v2h-5v8l-1 2-1-2v-8H6v-2l2-4V1h8zM8 3v5.4L6.2 12H17.8L16 8.4V3H8z" />
                </svg>
              )}
              {unread > 0 && (
                <span
                  className="text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm"
                  style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute right-3 top-12 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 min-w-[160px] conv-menu overflow-hidden">
          {conv.is_group && (
            <button
              onClick={() => {
                onUpdateGroupName(conv);
                onMenuToggle(null);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </span>
              Rename Group
            </button>
          )}
          <button
            onClick={() => {
              onPin(conv);
              onMenuToggle(null);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </span>
            {pinned ? "Unpin" : "Pin"}
          </button>
          <div className="mx-3 my-1 h-px bg-gray-100" />
          <button
            onClick={() => {
              onDelete(conv);
              onMenuToggle(null);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </span>
            Delete
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
  conversations = [],
  onSearchUsers = () => {},
  onCreateGroup = () => {},
  onUpdateGroupName = () => {},
  onSelectConversationForRename = () => {},
}) {
  const [localConvLoading,   setLocalConvLoading]   = useState(true);
  const [localConversations, setLocalConversations] = useState([]);
  const [messageRequests,    setMessageRequests]    = useState([]);
  const [menuOpenConvId,     setMenuOpenConvId]     = useState(null);
  const [searchResults,      setSearchResults]      = useState([]);
  const [searchLoading,      setSearchLoading]      = useState(false);
  const searchDebounceRef = useRef(null);

  // Group modal state
  const [showGroupPopup,      setShowGroupPopup]      = useState(false);
  const [selectedGroupUsers,  setSelectedGroupUsers]  = useState([]);
  const [groupName,           setGroupName]           = useState("");
  const [groupSearch,         setGroupSearch]         = useState("");
  const [groupSearchResults,  setGroupSearchResults]  = useState([]);
  const [groupSearchLoading,  setGroupSearchLoading]  = useState(false);
  const groupSearchDebounceRef = useRef(null);

  // Sync with parent conversations
  useEffect(() => {
    if (conversations && Array.isArray(conversations)) {
      const myIdLocal = getMyId();
      const pinnedByMe = (conv) => (conv.pinned_by || []).includes(myIdLocal);
      const sorted = [...conversations].sort((a, b) => {
        const aPinned = pinnedByMe(a);
        const bPinned = pinnedByMe(b);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bTime - aTime;
      });
      setLocalConversations(sorted);
      setLocalConvLoading(false);
    } else if (conversations && conversations.length === 0) {
      setLocalConversations([]);
      setLocalConvLoading(false);
    }
  }, [conversations]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpenConvId && !e.target.closest(".conv-menu")) {
        setMenuOpenConvId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpenConvId]);

  // Fetch conversations on mount
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      setLocalConvLoading(false);
      return;
    }
    const fetchConversations = async () => {
      setLocalConvLoading(true);
      try {
        const data = await getConversations({ limit: 50 });
        let convs = data?.conversations || [];
        const myId = getMyId();
        const pinnedByMe = (conv) => (conv.pinned_by || []).includes(myId);
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
        console.log("[MessagesSidebar] Message requests response:", response);
        if (response.status === "success" && response.data) {
          setMessageRequests(response.data.requests || []);
          onMessageRequestsChange(response.data.requests || []);
        }
      } catch (err) {
        console.error("Error fetching message requests:", err);
      }
    };
    fetchMessageRequests();
  }, []);

  const sidebarMyId = getMyId();
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search effect for users
  useEffect(() => {
    if (!search.trim() || search.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchLoading(false);
      return;
    }
    clearTimeout(searchDebounceRef.current);
    setSearchLoading(true);
    setShowSearchResults(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const response = await searchAccounts(search.trim(), 20);
        if ((response.status === "success" || response.success) && response.data) {
          const results = response.data.items || response.data.results || response.data || [];
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  // Group search effect
  useEffect(() => {
    if (!showGroupPopup) return;
    if (!groupSearch.trim() || groupSearch.trim().length < 2) {
      setGroupSearchResults([]);
      setGroupSearchLoading(false);
      return;
    }
    clearTimeout(groupSearchDebounceRef.current);
    setGroupSearchLoading(true);
    groupSearchDebounceRef.current = setTimeout(async () => {
      try {
        const response = await searchAccounts(groupSearch.trim(), 20);
        if ((response.status === "success" || response.success) && response.data) {
          const results = response.data.items || response.data.results || response.data || [];
          setGroupSearchResults(results);
        } else {
          setGroupSearchResults([]);
        }
      } catch (error) {
        console.error("Group search error:", error);
        setGroupSearchResults([]);
      } finally {
        setGroupSearchLoading(false);
      }
    }, 500);
    return () => clearTimeout(groupSearchDebounceRef.current);
  }, [groupSearch, showGroupPopup]);

  const filtered = localConversations.filter((c) =>
    getConvName(c, sidebarMyId).toLowerCase().includes(search.toLowerCase())
  );

  const handleMenuToggle = (convId) => {
    setMenuOpenConvId(menuOpenConvId === convId ? null : convId);
  };

  const handlePin = async (conv) => {
    const isPinned = (conv.pinned_by || []).includes(sidebarMyId);
    try {
      if (isPinned) {
        await unpinConversation(conv._id);
      } else {
        await pinConversation(conv._id);
      }
      const updatedConv = {
        ...conv,
        pinned_by: isPinned
          ? conv.pinned_by.filter((id) => id !== sidebarMyId)
          : [...(conv.pinned_by || []), sidebarMyId],
      };
      const updated = localConversations.map((c) =>
        c._id === conv._id ? updatedConv : c
      );
      const pinnedByMe = (c) => (c.pinned_by || []).includes(sidebarMyId);
      updated.sort((a, b) => {
        const aPinned = pinnedByMe(a);
        const bPinned = pinnedByMe(b);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bTime - aTime;
      });
      setLocalConversations(updated);
      onConversationsChange(updated);
    } catch (e) {
      console.error("Pin/unpin error:", e.message);
    }
  };

  const handleDelete = async (conv) => {
    if (!window.confirm("Are you sure you want to delete this conversation? This will remove all messages.")) return;
    try {
      await leaveConversation(conv._id);
      const updated = localConversations.filter((c) => c._id !== conv._id);
      setLocalConversations(updated);
      onConversationsChange(updated);
      if (selectedConv?._id === conv._id) {
        onSelectConv(null);
      }
    } catch (e) {
      console.error("Delete error:", e.message);
    }
  };

  const handleUpdateGroupName = (conv) => {
    if (conv.is_group) {
      onSelectConversationForRename(conv);
    }
  };

  const handleSelectConv = (conv) => {
    onSelectConv(conv);
  };

  const handleUserSelect = (user) => {
    if (showGroupPopup) {
      const userId = user._id || user.user_id || user.id;
      const alreadySelected = selectedGroupUsers.some(
        (u) => (u._id || u.user_id || u.id) === userId
      );
      if (!alreadySelected) {
        setSelectedGroupUsers([...selectedGroupUsers, user]);
      }
    } else {
      if (onSearchUsers) {
        onSearchUsers(user);
      }
      setSearch("");
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleRemoveGroupUser = (userId) => {
    setSelectedGroupUsers(
      selectedGroupUsers.filter((u) => (u._id || u.user_id || u.id) !== userId)
    );
  };

  const handleGroupSubmit = async () => {
    if (!groupName.trim() || selectedGroupUsers.length < 2) return;
    const userIds = selectedGroupUsers.map((u) => u._id || u.user_id || u.id);
    await onCreateGroup(groupName.trim(), userIds);
    setShowGroupPopup(false);
    setSelectedGroupUsers([]);
    setGroupName("");
    setGroupSearch("");
    setGroupSearchResults([]);
  };

  const toggleGroupMode = () => {
    setShowGroupPopup(true);
  };

  const isLoading = localConvLoading;

  return (
    <div className="w-80 lg:h-[560px] flex-shrink-0 flex flex-col bg-white border-r border-gray-100">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Messages</h1>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              connected
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-green-400" : "bg-gray-300"
              }`}
            />
            {connected ? "Online" : "Offline"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Create group button */}
          <button
            onClick={toggleGroupMode}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Create New Group"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          {/* New conversation button */}
          <button
            onClick={() => setShowNewConv(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}
            title="New Conversation"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setSearchResults([]); setShowSearchResults(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition-colors"
            >
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Request button ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          {showSearchResults ? "Results" : "All"}
        </span>
        <button className="text-xs text-pink-500 hover:text-pink-600 font-semibold transition-colors flex items-center gap-1">
          {messageRequests.length > 0 && (
            <span className="w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-bold" style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}>
              {messageRequests.length}
            </span>
          )}
          Requests
        </button>
      </div>

      {/* ── Conversation list ── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className={`h-3 rounded-full bg-gray-100 animate-pulse ${i % 2 ? "w-3/4" : "w-1/2"}`} />
                  <div className="h-2.5 rounded-full bg-gray-100 animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : showSearchResults && search.trim().length >= 2 ? (
          searchLoading ? (
            <div className="p-4 space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded-full bg-gray-100 animate-pulse w-1/2" />
                    <div className="h-2.5 rounded-full bg-gray-100 animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div className="px-4 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                People
              </div>
              {searchResults.map((user) => (
                <button
                  key={user._id || user.user_id || user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 group/search"
                >
                  <Avatar
                    name={user.full_name || user.username || ""}
                    imgUrl={user.profile_image_url || user.avatar}
                    size={10}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {user.username || user.full_name || "Unknown"}
                    </div>
                    {user.username && (
                      <div className="text-xs text-gray-400 truncate">@{user.username}</div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 group-hover/search:bg-pink-50 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400 group-hover/search:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No users found</p>
            </div>
          )
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">No conversations yet</p>
            <p className="text-xs text-gray-300 mt-1">Start a new chat to get going</p>
          </div>
        ) : (
          <div>
            {/* Pinned section */}
            {filtered.some((c) => (c.pinned_by || []).includes(sidebarMyId)) && (
              <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 flex items-center gap-1.5">
                <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1v6l2 4v2h-5v8l-1 2-1-2v-8H6v-2l2-4V1h8z" />
                </svg>
                Pinned
              </div>
            )}
            {filtered
              .filter((c) => (c.pinned_by || []).includes(sidebarMyId))
              .map((conv) => (
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
                  onUpdateGroupName={handleUpdateGroupName}
                />
              ))}

            {/* All conversations */}
            {filtered.some((c) => (c.pinned_by || []).includes(sidebarMyId)) &&
              filtered.some((c) => !(c.pinned_by || []).includes(sidebarMyId)) && (
                <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  All Chats
                </div>
              )}
            {filtered
              .filter((c) => !(c.pinned_by || []).includes(sidebarMyId))
              .map((conv) => (
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
                  onUpdateGroupName={handleUpdateGroupName}
                />
              ))}
          </div>
        )}
      </div>

      {/* ── Group Creation Modal ── */}
      {showGroupPopup && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowGroupPopup(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[560px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Create Group</h3>
                <p className="text-xs text-gray-400 mt-0.5">Add at least 2 people</p>
              </div>
              <button
                onClick={() => setShowGroupPopup(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Group name input */}
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name..."
                  className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Search users */}
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  placeholder="Search users to add..."
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                />
                {groupSearchLoading && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Selected users chips */}
            {selectedGroupUsers.length > 0 && (
              <div className="px-5 py-2.5 border-b border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {selectedGroupUsers.map((user) => {
                    const userId = user._id || user.user_id || user.id;
                    return (
                      <span
                        key={userId}
                        className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-full text-xs font-medium"
                      >
                        <Avatar
                          name={user.full_name || user.username || ""}
                          imgUrl={user.profile_image_url || user.avatar}
                          size={5}
                        />
                        {user.username || user.full_name || "User"}
                        <button
                          onClick={() => handleRemoveGroupUser(userId)}
                          className="w-3.5 h-3.5 rounded-full bg-pink-200 hover:bg-pink-300 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-2 h-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search results */}
            <div className="flex-1 overflow-y-auto p-2">
              {groupSearch.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeWidth="2" />
                      <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">Type to search users</p>
                </div>
              ) : groupSearchResults.length === 0 && !groupSearchLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No users found</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {groupSearchResults.map((user) => {
                    const userId = user._id || user.user_id || user.id;
                    const isSelected = selectedGroupUsers.some(
                      (u) => (u._id || u.user_id || u.id) === userId
                    );
                    return (
                      <button
                        key={userId}
                        onClick={() => {
                          if (!isSelected) {
                            setSelectedGroupUsers([...selectedGroupUsers, user]);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                          isSelected ? "bg-pink-50" : "hover:bg-gray-50"
                        }`}
                        disabled={isSelected}
                      >
                        {isSelected ? (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <Avatar
                            name={user.full_name || user.username || ""}
                            imgUrl={user.profile_image_url || user.avatar}
                            size={9}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {user.username || user.full_name || "Unknown"}
                          </div>
                          {user.username && (
                            <div className="text-xs text-gray-400 truncate">@{user.username}</div>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-xs font-semibold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                            Added
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              <button
                onClick={handleGroupSubmit}
                disabled={!groupName.trim() || selectedGroupUsers.length < 2}
                className="w-full py-3 text-white text-sm font-bold rounded-2xl transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}
              >
                Create Group
                {selectedGroupUsers.length > 0 && (
                  <span className="ml-2 bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedGroupUsers.length}
                  </span>
                )}
              </button>
              {selectedGroupUsers.length < 2 && (
                <p className="text-xs text-center text-gray-400">
                  Select at least 2 people to continue
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
