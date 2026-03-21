"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ComposeEmojiPicker from "../components/Composeemojipicker";

import { io } from "socket.io-client";
import {
  getConversations,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  forwardMessage,
  pinConversation,
  unpinConversation,
  archiveConversation,
  markMessageRead,
  unarchiveConversation,
  createConversation,
  updateConversation,
  leaveConversation,
  uploadMedia,
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

function getAuthToken() {
  if (typeof window === "undefined") return "";
  return (
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
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

// ─── Emoji Picker ──────────────────────────────────────────────────────────────

const EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

function EmojiPicker({ onPick }) {
  return (
    <div className="absolute bottom-8 bg-white border border-gray-200 rounded-2xl shadow-xl px-3 py-2 flex gap-1 z-30 left-0">
      {EMOJIS.map((e) => (
        <button key={e} onClick={() => onPick(e)} className="text-lg hover:scale-125 transition-transform">
          {e}
        </button>
      ))}
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

function Bubble({ msg, myId, profileMap, onReply, onEdit, onDelete, onReact, onForward }) {
  const [hover, setHover] = useState(false);

  // Debug: Log message data for shared content
  useEffect(() => {
    console.log('[Bubble] Message data:', { 
      _id: msg._id, 
      content: msg.content, 
      content_type: msg.content_type,
      shared_content_id: msg.shared_content_id,
      shared_content_type: msg.shared_content_type,
      thumbnail: msg.thumbnail,
      title: msg.title,
      media_url: msg.media_url,
      allKeys: Object.keys(msg)
    });
  }, [msg]);
  const [picker, setPicker] = useState(false);

  const senderId =
    typeof msg.sender_id === "object" && msg.sender_id !== null
      ? msg.sender_id._id || msg.sender_id.id
      : msg.sender_id;

  const isMe = senderId === myId;

  const profile =
    typeof msg.sender_id === "object" && msg.sender_id !== null && msg.sender_id.full_name
      ? msg.sender_id
      : profileMap[senderId] || null;

  const name = profile?.full_name || (isMe ? "Me" : "User");
  const img  = profile?.profile_image_url || null;

  const readBy = (msg.read_by || []).filter((id) => id !== senderId);
  const seen   = readBy.length > 0;

  const reactionGroups = (msg.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});
  const myReaction = (msg.reactions || []).find(
    (r) => r.user_id === myId || r.user_id?._id === myId
  );

  return (
    <div
      className={`flex items-end gap-2 w-full ${isMe ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPicker(false); }}
    >
      <div className="flex-shrink-0 mb-1">
        <Avatar name={name} imgUrl={img} size={8} />
      </div>

      <div className={`flex flex-col gap-1 max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
        <span className="text-[11px] text-gray-400 px-1">{name}</span>

        {msg.reply_to && (
          <div className="text-xs border-l-2 border-pink-400 bg-pink-50 text-gray-500 px-3 py-1.5 rounded-lg max-w-full truncate">
            ↩ {msg.reply_to?.content || "Message"}
          </div>
        )}

        {msg.forwarded_from && (
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Forwarded
          </span>
        )}

        <div className={`flex items-end gap-1.5 relative ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          {hover && !msg.is_deleted && (
            <div className="flex items-center gap-0.5">
              <div className="relative">
                <button onClick={() => setPicker((v) => !v)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs">😊</button>
                {picker && (
                  <EmojiPicker onPick={(emoji) => { onReact(msg._id, emoji, myReaction); setPicker(false); }} />
                )}
              </div>
              <button onClick={() => onReply(msg)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center" title="Reply">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </button>
              <button onClick={() => onForward(msg._id)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center" title="Forward">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              {isMe && (
                <>
                  <button onClick={() => onEdit(msg)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center" title="Edit">
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => onDelete(msg._id)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center" title="Delete">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </>
              )}
            </div>
          )}

          <div
            className={`px-3.5 py-2.5 text-sm leading-relaxed break-words ${
              msg.is_deleted
                ? "bg-gray-100 text-gray-400 italic rounded-2xl"
                : isMe
                ? "text-white rounded-2xl rounded-br-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm"
            }`}
            style={isMe && !msg.is_deleted ? { background: "linear-gradient(135deg, #ec4899, #f97316)" } : {}}
          >
            {msg.is_deleted ? "Message deleted" : msg.content}

            {!msg.is_deleted && msg.media_url && (
              <div className="mt-1 text-xs opacity-70 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Attachment
              </div>
            )}

            <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
              <span className={`text-[10px] ${isMe ? "text-white/60" : "text-gray-400"}`}>
                {formatTime(msg.created_at)}
              </span>
              {isMe && !msg.is_deleted && (
                seen ? (
                  <svg width="18" height="11" viewBox="0 0 18 11" fill="none" className="inline-block">
                    <path d="M1 5.5l3.5 3.5L12 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                    <path d="M6 5.5l3.5 3.5L17 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="inline-block">
                    <path d="M1.5 5.5l3 3 5-6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                  </svg>
                )
              )}
            </div>
          </div>
        </div>

        {Object.keys(reactionGroups).length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <span
                key={emoji}
                onClick={() => onReact(msg._id, emoji, myReaction)}
                className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 shadow-sm cursor-pointer hover:bg-gray-50"
              >
                {emoji}{count > 1 ? ` ${count}` : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Conversation list item ────────────────────────────────────────────────────

function ConvItem({ conv, myId, active, onClick }) {
  const name    = getConvName(conv, myId);
  const img     = getConvImg(conv, myId);
  const unread  = conv.unread_counts?.[myId] || 0;
  const pinned  = (conv.pinned_by || []).includes(myId);
  const lm      = conv.last_message;
  const preview = lm
    ? lm.is_deleted ? "Message deleted" : lm.content || (lm.media_type ? "📎 Media" : "")
    : "No messages yet";

  return (
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
          <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0">{formatTime(conv.last_message_at)}</span>
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
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const myId           = getMyId();
  const bottomRef      = useRef(null);
  const fileRef        = useRef(null);
  const socketRef      = useRef(null);
  const selectedConvRef = useRef(null);

  const [profileMap,    setProfileMap]    = useState({});
  const [conversations, setConversations] = useState([]);
  const [convLoading,   setConvLoading]   = useState(true);
  const [selectedConv,  setSelectedConv]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [msgLoading,    setMsgLoading]    = useState(false);
  const [text,          setText]          = useState("");
  const [sending,       setSending]       = useState(false);
  const [replyTo,       setReplyTo]       = useState(null);
  const [editingMsg,    setEditingMsg]    = useState(null);
  const [search,        setSearch]        = useState("");
  const [uploading,     setUploading]     = useState(false);
  const [showNewConv,   setShowNewConv]   = useState(false);
  const [newConvInput,  setNewConvInput]  = useState("");
  const [showRename,    setShowRename]    = useState(false);
  const [renameInput,   setRenameInput]   = useState("");
  const [typingUsers,   setTypingUsers]   = useState({});
  const [connected,     setConnected]     = useState(false);


  // emoji

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const textareaRef = useRef(null);  // attach this to your <textarea>

const handleEmojiPick = (emoji) => {
  const textarea = textareaRef.current;
  if (!textarea) { setText((prev) => prev + emoji); return; }
  const start = textarea.selectionStart;
  const end   = textarea.selectionEnd;
  const newText = text.slice(0, start) + emoji + text.slice(end);
  setText(newText);
  requestAnimationFrame(() => {
    const pos = start + emoji.length;
    textarea.selectionStart = pos;
    textarea.selectionEnd   = pos;
    textarea.focus();
  });
};

  // ── Merge profiles ───────────────────────────────────────────────────────────

  const mergeProfiles = useCallback((userObjects = []) => {
    setProfileMap((prev) => {
      const next = { ...prev };
      userObjects.forEach((u) => {
        if (!u || typeof u !== "object") return;
        const id = u._id || u.id;
        if (id) next[id] = { ...next[id], ...u };
      });
      return next;
    });
  }, []);

  // ── appendMessage ─────────────────────────────────────────────────────────────

  const appendMessage = useCallback((msg) => {
    if (!msg) return;
    if (msg.sender_id && typeof msg.sender_id === "object" && msg.sender_id.full_name) {
      mergeProfiles([msg.sender_id]);
    }
    setMessages((prev) => {
      if (prev.find((m) => m._id === msg._id)) {
        console.log("[Socket] appendMessage: duplicate skipped", msg._id);
        return prev;
      }
      console.log("[Socket] appendMessage: added message", msg._id);
      return [...prev, msg];
    });
  }, [mergeProfiles]);

  // ── Socket.io setup ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!myId) {
      console.warn("[Socket] No myId found — socket will not connect");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.warn("[Socket] No auth token found — socket will not connect");
      return;
    }

    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (process.env.NEXT_PUBLIC_API_URL || "").replace("/api/v1", "") ||
      "http://localhost:5000";

    console.log("[Socket] Connecting to:", SOCKET_URL, "as user:", myId);

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected. socket.id:", socket.id);
      setConnected(true);

      // Rejoin current conversation room after reconnect
      if (selectedConvRef.current?._id) {
        console.log("[Socket] Rejoining room after reconnect:", selectedConvRef.current._id);
        socket.emit("conversation:join", { conversationId: selectedConvRef.current._id });
      }
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected. Reason:", reason);
      setConnected(false);
    });

    // ── New message ──────────────────────────────────────────────────────────
    socket.on("message:new", (message) => {
      const convId = message.conversation_id;
      console.log("[Socket] message:new received. convId:", convId, "currentConv:", selectedConvRef.current?._id, "msg:", message._id);

      if (selectedConvRef.current?._id === convId) {
        appendMessage(message);

        if (message._id) {
          markMessageRead(message._id).catch((e) => {
            console.warn("[Socket] markMessageRead failed:", e.message);
          });
        }
      } else {
        console.log("[Socket] message:new — NOT for current conv, updating sidebar only");
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c._id !== convId) return c;
          const isOpen = selectedConvRef.current?._id === convId;
          return {
            ...c,
            last_message: message,
            last_message_at: message.created_at,
            unread_counts: {
              ...c.unread_counts,
              [myId]: isOpen ? 0 : (c.unread_counts?.[myId] || 0) + 1,
            },
          };
        })
      );
    });

    // ── Message edited ────────────────────────────────────────────────────────
    socket.on("message:updated", (message) => {
      console.log("[Socket] message:updated received:", message._id);
      if (selectedConvRef.current?._id === message.conversation_id) {
        setMessages((prev) =>
          prev.map((m) => m._id === message._id ? { ...m, ...message } : m)
        );
      }
    });

    // ── Message deleted ───────────────────────────────────────────────────────
    socket.on("message:deleted", ({ messageId, conversationId }) => {
      console.log("[Socket] message:deleted received:", messageId);
      if (selectedConvRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => m._id === messageId ? { ...m, is_deleted: true, content: "" } : m)
        );
      }
    });

    // ── Read receipt ──────────────────────────────────────────────────────────
    socket.on("message:read_ack", ({ messageId, userId, conversationId }) => {
      console.log("[Socket] message:read_ack received. messageId:", messageId, "userId:", userId, "convId:", conversationId);
      if (selectedConvRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, read_by: [...new Set([...(m.read_by || []), userId])] }
              : m
          )
        );
      }
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, unread_counts: { ...c.unread_counts, [userId]: 0 } }
            : c
        )
      );
    });

    // ── Typing indicator ──────────────────────────────────────────────────────
    socket.on("typing:indicator", ({ conversationId, userId, isTyping }) => {
      console.log("[Socket] typing:indicator. convId:", conversationId, "userId:", userId, "isTyping:", isTyping);
      if (userId === myId) return;
      setTypingUsers((prev) => {
        const current = prev[conversationId] || [];
        if (isTyping) {
          return { ...prev, [conversationId]: [...new Set([...current, userId])] };
        } else {
          return { ...prev, [conversationId]: current.filter((id) => id !== userId) };
        }
      });
    });

    // ── Reaction ──────────────────────────────────────────────────────────────
    socket.on("message:reaction", ({ messageId, conversationId, reactions }) => {
      console.log("[Socket] message:reaction received. messageId:", messageId);
      if (selectedConvRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => m._id === messageId ? { ...m, reactions } : m)
        );
      }
    });

    return () => {
      console.log("[Socket] Cleaning up socket connection");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [myId]); // ← IMPORTANT: removed appendMessage from deps to prevent socket reconnect loop

  // ── Load conversations ───────────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    setConvLoading(true);
    try {
      const data  = await getConversations({ limit: 50 });
      const convs = data?.conversations || [];
      setConversations(convs);
      const users = [];
      convs.forEach((c) => {
        (c.participants || []).forEach((p) => {
          if (p.user_id && typeof p.user_id === "object") users.push(p.user_id);
        });
      });
      mergeProfiles(users);
    } catch (e) {
      console.error("fetchConversations:", e.message);
    } finally {
      setConvLoading(false);
    }
  }, [mergeProfiles]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── fetchMessages ────────────────────────────────────────────────────────────

  const fetchMessages = useCallback(async (convId) => {
    setMsgLoading(true);
    try {
      const data = await getMessages(convId, { limit: 50 });
      const msgs = data?.messages || [];
      setMessages(msgs);
      const users = msgs
        .map((m) => m.sender_id)
        .filter((s) => s && typeof s === "object" && s.full_name);
      mergeProfiles(users);
      return msgs;
    } catch (e) {
      console.error("fetchMessages:", e.message);
      return [];
    } finally {
      setMsgLoading(false);
    }
  }, [mergeProfiles]);

  // ── Auto scroll ──────────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select conversation ──────────────────────────────────────────────────────


  
  const handleSelectConv = async (conv) => {
    // Leave previous room
    if (selectedConvRef.current?._id && socketRef.current) {
      console.log("[Socket] Leaving room:", selectedConvRef.current._id);
      socketRef.current.emit("conversation:leave", {
        conversationId: selectedConvRef.current._id,
      });
    }

    setSelectedConv(conv);
    selectedConvRef.current = conv;
    setReplyTo(null);
    setEditingMsg(null);
    setText("");
    setMessages([]);

    // Join new room
    if (socketRef.current) {
      console.log("[Socket] Joining room:", conv._id, "| socket connected:", socketRef.current.connected, "| socket.id:", socketRef.current.id);
      socketRef.current.emit("conversation:join", { conversationId: conv._id });
    } else {
      console.warn("[Socket] socketRef.current is null — cannot join room!");
    }

    const users = (conv.participants || [])
      .map((p) => p.user_id)
      .filter((u) => u && typeof u === "object");
    mergeProfiles(users);

    const msgs = await fetchMessages(conv._id);

    const lastMsg = msgs?.[msgs.length - 1];
    if (lastMsg?._id) {
      try {
        await markMessageRead(lastMsg._id);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conv._id
              ? { ...c, unread_counts: { ...c.unread_counts, [myId]: 0 } }
              : c
          )
        );
      } catch (e) {
        console.error("markRead:", e.message);
      }
    }
  };

  // ── Send / Edit ──────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!text.trim() || !selectedConv) return;

    if (socketRef.current) {
      socketRef.current.emit("typing:stop", { conversationId: selectedConv._id });
    }

    setSending(true);
    try {
      if (editingMsg) {
        await editMessage(editingMsg._id, text.trim());
        setMessages((prev) =>
          prev.map((m) =>
            m._id === editingMsg._id ? { ...m, content: text.trim() } : m
          )
        );
        setEditingMsg(null);
      } else {
        const payload = { message_type: "text", content: text.trim() };
        if (replyTo) payload.reply_to = replyTo._id;

        console.log("[Send] Sending message via HTTP to conv:", selectedConv._id);
        const newMsg = await sendMessage(selectedConv._id, payload);
        console.log("[Send] Message sent. _id:", newMsg?._id);

        appendMessage(newMsg);
        setReplyTo(null);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === selectedConv._id
              ? { ...c, last_message_at: new Date().toISOString(), last_message: newMsg }
              : c
          )
        );
      }
      setText("");
    } catch (e) {
      console.error("handleSend:", e.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); return; }
    if (socketRef.current && selectedConv) {
      socketRef.current.emit("typing:start", { conversationId: selectedConv._id });
    }
  };

  // ── Reactions ────────────────────────────────────────────────────────────────

  const handleReact = async (messageId, emoji, existing) => {
    try {
      if (existing?.emoji === emoji) {
        await removeReaction(messageId, emoji);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, reactions: (m.reactions || []).filter((r) => !(r.user_id === myId || r.user_id?._id === myId)) }
              : m
          )
        );
      } else {
        if (existing) await removeReaction(messageId, existing.emoji);
        await addReaction(messageId, emoji);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? {
                  ...m,
                  reactions: [
                    ...(m.reactions || []).filter((r) => !(r.user_id === myId || r.user_id?._id === myId)),
                    { user_id: myId, emoji, created_at: new Date().toISOString() },
                  ],
                }
              : m
          )
        );
      }
    } catch (e) { console.error("handleReact:", e.message); }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessage(id);
      setMessages((prev) =>
        prev.map((m) => m._id === id ? { ...m, is_deleted: true, content: "" } : m)
      );
    } catch (e) { console.error("handleDelete:", e.message); }
  };

  // ── Forward ──────────────────────────────────────────────────────────────────

  const handleForward = async (msgId) => {
    const targets = conversations.filter((c) => c._id !== selectedConv._id);
    if (!targets.length) return;
    const chosen = prompt(`Forward to:\n${targets.map((c) => getConvName(c, myId)).join("\n")}`);
    if (!chosen) return;
    const target = targets.find((c) =>
      getConvName(c, myId).toLowerCase().includes(chosen.toLowerCase())
    );
    if (!target) return alert("Not found");
    try {
      await forwardMessage(msgId, [target._id]);
    } catch (e) { console.error("handleForward:", e.message); }
  };

  // ── Pin / Archive ────────────────────────────────────────────────────────────

  const handlePin = async () => {
    if (!selectedConv) return;
    const pinned = (selectedConv.pinned_by || []).includes(myId);
    try {
      const u = pinned
        ? await unpinConversation(selectedConv._id)
        : await pinConversation(selectedConv._id);
      setSelectedConv((p) => ({ ...p, pinned_by: u.pinned_by }));
      await fetchConversations();
    } catch (e) { console.error(e.message); }
  };

  const handleArchive = async () => {
    if (!selectedConv) return;
    const archived = (selectedConv.archived_by || []).includes(myId);
    try {
      const u = archived
        ? await unarchiveConversation(selectedConv._id)
        : await archiveConversation(selectedConv._id);
      setSelectedConv((p) => ({ ...p, archived_by: u.archived_by }));
      await fetchConversations();
    } catch (e) { console.error(e.message); }
  };

  // ── New conv ─────────────────────────────────────────────────────────────────

  const handleNewConv = async () => {
    if (!newConvInput.trim()) return;
    try {
      const conv = await createConversation({ participants: [newConvInput.trim()] });
      setShowNewConv(false);
      setNewConvInput("");
      await fetchConversations();
      handleSelectConv(conv);
    } catch (e) { alert("Failed: " + e.message); }
  };

  // ── Rename ───────────────────────────────────────────────────────────────────

  const handleRename = async () => {
    if (!renameInput.trim() || !selectedConv) return;
    try {
      const u = await updateConversation(selectedConv._id, { group_name: renameInput.trim() });
      setSelectedConv((p) => ({ ...p, group_name: u.group_name }));
      setShowRename(false);
      await fetchConversations();
    } catch (e) { alert("Failed: " + e.message); }
  };

  // ── Leave ────────────────────────────────────────────────────────────────────

  const handleLeave = async () => {
    if (!selectedConv || !confirm("Leave this conversation?")) return;
    try {
      if (socketRef.current) {
        socketRef.current.emit("conversation:leave", { conversationId: selectedConv._id });
      }
      await leaveConversation(selectedConv._id);
      setSelectedConv(null);
      selectedConvRef.current = null;
      setMessages([]);
      await fetchConversations();
    } catch (e) { console.error(e.message); }
  };

  // ── Media ────────────────────────────────────────────────────────────────────

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;
    setUploading(true);
    try {
      const key  = await uploadMedia(file);
      const type = file.type.startsWith("image") ? "image"
        : file.type.startsWith("video") ? "video"
        : file.type.startsWith("audio") ? "audio" : "file";
      const newMsg = await sendMessage(selectedConv._id, { message_type: type, media_key: key });
      appendMessage(newMsg);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === selectedConv._id
            ? { ...c, last_message_at: new Date().toISOString() }
            : c
        )
      );
    } catch (e) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filtered    = conversations.filter((c) =>
    getConvName(c, myId).toLowerCase().includes(search.toLowerCase())
  );
  const isPinned    = selectedConv && (selectedConv.pinned_by   || []).includes(myId);
  const isArchived  = selectedConv && (selectedConv.archived_by || []).includes(myId);
  const isTyping    = selectedConv
    ? (typingUsers[selectedConv._id] || []).filter((id) => id !== myId).length > 0
    : false;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#F5F6FA] font-Poppins overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-100">
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

        <div className="flex-1 overflow-y-auto">
          {convLoading ? (
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
                myId={myId}
                active={selectedConv?._id === conv._id}
                onClick={() => handleSelectConv(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Chat ─────────────────────────────────────────────────────────── */}
      {!selectedConv ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#F5F6FA]">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-600">Select a conversation</p>
          <p className="text-xs text-gray-400">Choose from the list to start messaging</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar name={getConvName(selectedConv, myId)} imgUrl={getConvImg(selectedConv, myId)} size={10} />
              <div>
                <p className="text-sm font-semibold text-gray-900">{getConvName(selectedConv, myId)}</p>
                <p className="text-xs text-gray-400">
                  {isTyping ? (
                    <span className="text-pink-400 font-medium">typing...</span>
                  ) : selectedConv.is_group ? (
                    `${selectedConv.participantCount || selectedConv.participants?.length || 0} members`
                  ) : (
                    "Direct message"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePin} className={`px-3 py-1.5 text-xs rounded-xl border transition-colors ${isPinned ? "bg-amber-50 border-amber-200 text-amber-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {isPinned ? "📌 Pinned" : "Pin"}
              </button>
              <button onClick={handleArchive} className={`px-3 py-1.5 text-xs rounded-xl border transition-colors ${isArchived ? "bg-pink-50 border-pink-200 text-pink-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {isArchived ? "Unarchive" : "Archive"}
              </button>
              {selectedConv.is_group && (
                <button onClick={() => { setShowRename(true); setRenameInput(selectedConv.group_name || ""); }} className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  Rename
                </button>
              )}
              <button onClick={handleLeave} className="px-3 py-1.5 text-xs rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
                Leave
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F5F6FA]">
            {msgLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className={`flex items-end gap-2 ${i % 2 ? "flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                    <div className={`h-10 rounded-2xl bg-gray-200 animate-pulse ${i % 2 ? "w-48" : "w-40"}`} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center py-12 text-sm text-gray-400">No messages yet. Say hello! 👋</p>
            ) : (
              messages.map((msg) => (
                <Bubble
                  key={msg._id}
                  msg={msg}
                  myId={myId}
                  profileMap={profileMap}
                  onReply={(m) => { setReplyTo(m); setEditingMsg(null); }}
                  onEdit={(m) => { setEditingMsg(m); setReplyTo(null); setText(m.content); }}
                  onDelete={handleDelete}
                  onReact={handleReact}
                  onForward={handleForward}
                />
              ))
            )}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
            {replyTo && (
              <div className="flex items-center justify-between bg-pink-50 border border-pink-200 rounded-xl px-3 py-2 mb-2">
                <p className="text-xs text-pink-700 truncate">↩ <span className="font-medium">{replyTo.content?.slice(0, 60)}</span></p>
                <button onClick={() => setReplyTo(null)} className="ml-2 text-pink-400 hover:text-pink-600 flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            {editingMsg && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2">
                <p className="text-xs text-amber-700">✏️ Editing message</p>
                <button onClick={() => { setEditingMsg(null); setText(""); }} className="ml-2 text-amber-400 hover:text-amber-600 flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} accept="image/*,video/*,audio/*,.pdf" />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              >
                {uploading
                  ? <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                  : <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                }
              </button>

              <div className="relative flex-shrink-0">
  <button onClick={() => setShowEmojiPicker((v) => !v)} className="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-lg">
    😊
  </button>
  {showEmojiPicker && (
    <ComposeEmojiPicker
      onPick={handleEmojiPick}
      onClose={() => setShowEmojiPicker(false)}
    />
  )}
</div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={editingMsg ? "Edit your message..." : "Type a message..."}
                rows={1}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-pink-400 focus:bg-white transition-colors resize-none"
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}
              >
                {sending
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New conversation modal ────────────────────────────────────────── */}
      {showNewConv && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowNewConv(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-4">New conversation</h3>
            <label className="text-xs text-gray-500 mb-1.5 block">User ID</label>
            <input
              value={newConvInput}
              onChange={(e) => setNewConvInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNewConv()}
              placeholder="Enter user ID..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-400 transition-colors"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button onClick={handleNewConv} className="flex-1 py-2.5 text-white text-sm font-bold rounded-2xl" style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}>
                Start chat
              </button>
              <button onClick={() => setShowNewConv(false)} className="px-4 py-2 border border-gray-200 text-gray-500 text-sm rounded-2xl hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename modal ──────────────────────────────────────────────────── */}
      {showRename && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowRename(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-4">Rename group</h3>
            <input
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              placeholder="New group name..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-400 transition-colors"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button onClick={handleRename} className="flex-1 py-2.5 text-white text-sm font-bold rounded-2xl" style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}>
                Save
              </button>
              <button onClick={() => setShowRename(false)} className="px-4 py-2 border border-gray-200 text-gray-500 text-sm rounded-2xl hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}