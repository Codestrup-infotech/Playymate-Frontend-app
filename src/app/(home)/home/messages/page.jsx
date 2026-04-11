"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ComposeEmojiPicker from "../components/Composeemojipicker";
import UserPostDetailModal from "../components/UserPostDetailModal";
import { getPostById, getStoryPreview } from "@/app/user/homefeed";
import UserStory from "../profile/user-story";
import postService from "@/app/user/post";
import CallNow from "../components/CallNow";

import { io } from "socket.io-client";
import { Phone, Video, X } from "lucide-react";
import { FaPhone, FaVideo } from "react-icons/fa";
import {
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

import { getUserById } from "@/services/user";
import { searchAccounts } from "@/app/user/search";
import MessagesSidebar from "../components/MessagesSidebar";

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

function formatMessageDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return (
      d.toLocaleDateString([], { weekday: "short" }) +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

// ─── Emoji Picker ──────────────────────────────────────────────────────────────

const EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

function EmojiPicker({ onPick }) {
  return (
    <div className="absolute bottom-9 left-0 bg-white border border-gray-100 rounded-2xl shadow-2xl px-3 py-2.5 flex gap-2 z-30">
      {EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => onPick(e)}
          className="text-lg hover:scale-125 transition-transform duration-150"
        >
          {e}
        </button>
      ))}
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

function Bubble({
  msg,
  myId,
  profileMap,
  messageRequests = [],
  onReply,
  onEdit,
  onDelete,
  onReact,
  onForward,
  onOpenPostDetail,
  onOpenStory,
}) {
  const [hover, setHover] = useState(false);

  const getSharedContent = () => {
    console.log("[Bubble] getSharedContent called for message:", msg._id, "content:", msg.content);
    if (msg.conversation_id) {
      const request = messageRequests.find((r) => r._id === msg.conversation_id);
      if (request?.shared_content) {
        console.log("[Bubble] Found shared_content from message request:", request.shared_content);
        return request.shared_content;
      }
    }
    if (msg.shared_content) {
      console.log("[Bubble] Found shared_content in message:", msg.shared_content);
      return msg.shared_content;
    }
    if (msg.signed_urls?.media) {
      console.log("[Bubble] Found signed_urls in message:", msg.signed_urls);
      return { signed_urls: msg.signed_urls };
    }
    if (msg.media_url) {
      console.log("[Bubble] Found media_url in message:", msg.media_url);
      return {
        media_url: msg.media_url,
        content_type: msg.content_type,
        content_id: msg.content_id,
        signed_urls: { media: [{ type: msg.media_type || "image", url: msg.media_url }] },
      };
    }
    if (msg.shared_content) {
      console.log("[Bubble] Found shared_content in message:", msg.shared_content);
      return msg.shared_content;
    }
    if (msg.content_author_id) {
      console.log("[Bubble] Found content_author_id in message:", msg.content_author_id);
    }
    if (msg.share_id) {
      console.log("[Bubble] Found share_id in message:", msg.share_id);
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith("share_") || key === "latest_share")) {
            const value = sessionStorage.getItem(key);
            if (value) {
              const shareData = JSON.parse(value);
              if (shareData.share_id === msg.share_id || shareData.content_id === msg.content_id) {
                console.log("[Bubble] Found matching share by share_id:", shareData);
                return shareData;
              }
            }
          }
        }
      } catch (e) {
        console.log("[Bubble] Error matching by share_id:", e);
      }
    }
    if (msg.content_id) {
      console.log("[Bubble] Found content_id in message:", msg.content_id);
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith("share_") || key === "latest_share")) {
            const value = sessionStorage.getItem(key);
            if (value) {
              const shareData = JSON.parse(value);
              if (shareData.content_id === msg.content_id) {
                console.log("[Bubble] Found matching share by content_id:", shareData);
                return shareData;
              }
            }
          }
        }
      } catch (e) {
        console.log("[Bubble] Error matching by content_id:", e);
      }
    }
    if (msg.content === "Shared a post") {
      console.log("[Bubble] Message is 'Shared a post', checking for latest_share");
      try {
        const latestShare = sessionStorage.getItem("latest_share");
        if (latestShare) {
          const shareData = JSON.parse(latestShare);
          const now = Date.now();
          if (shareData.timestamp && now - shareData.timestamp < 5 * 60 * 1000) {
            console.log("[Bubble] Found recent latest_share:", shareData);
            return shareData;
          }
        }
      } catch (e) {
        console.log("[Bubble] Error getting latest_share:", e);
      }
    }
    console.log("[Bubble] Checking sessionStorage for ALL messages...");
    try {
      let latestShare = sessionStorage.getItem("latest_share");
      console.log("[Bubble] sessionStorage latest_share:", latestShare);
      if (!latestShare) {
        console.log("[Bubble] No latest_share, checking all sessionStorage keys...");
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith("share_")) {
            const value = sessionStorage.getItem(key);
            console.log("[Bubble] Found share key:", key, "value:", value);
            if (value) {
              latestShare = value;
              break;
            }
          }
        }
      }
      if (latestShare) {
        const shareData = JSON.parse(latestShare);
        const timeDiff = Date.now() - shareData.timestamp;
        console.log("[Bubble] Share data age:", timeDiff, "ms (", Math.floor(timeDiff / 1000), "seconds)");
        if (timeDiff < 600000) {
          console.log("[Bubble] Found valid share data from sessionStorage:", shareData);
          console.log("[Bubble] Returning shareData with signed_urls:", shareData.signed_urls);
          return shareData;
        } else {
          console.log("[Bubble] Share data too old (>10 min):", timeDiff);
        }
      } else {
        console.log("[Bubble] No sessionStorage share data found at all");
      }
    } catch (e) {
      console.log("[Bubble] Error reading sessionStorage:", e);
    }
    console.log("[Bubble] No shared content found, returning null");
    return null;
  };

  const sharedContent = getSharedContent();
  console.log("[Bubble] Assigned sharedContent:", sharedContent);

  useEffect(() => {
    console.log("[Bubble] Message data:", {
      _id: msg._id,
      content: msg.content,
      message_type: msg.message_type,
      shared_content: msg.shared_content,
      media_url: msg.media_url,
      signed_urls: msg.signed_urls,
      conversation_id: msg.conversation_id,
      allKeys: Object.keys(msg),
      sharedContentFound: !!sharedContent,
      hasSignedUrls: !!(sharedContent?.signed_urls?.media),
      hasPreviewUrl: !!sharedContent?.preview_url,
    });
  }, [msg, sharedContent]);

  const isSharedContent =
    msg.content_type === "post" ||
    msg.content_type === "reel" ||
    msg.content_type === "story" ||
    msg.signed_urls?.media?.length > 0 ||
    sharedContent?.preview_url;

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
  const img = profile?.profile_image_url || null;

  const readBy = (msg.read_by || []).filter((id) => id !== senderId);
  const seen = readBy.length > 0;

  const reactionGroups = (msg.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});
  const myReaction = (msg.reactions || []).find(
    (r) => r.user_id === myId || r.user_id?._id === myId
  );

  return (
    <div
      className={`flex items-end gap-2.5 w-full group ${isMe ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPicker(false);
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mb-1">
        <Avatar name={name} imgUrl={img} size={8} />
      </div>

      <div className={`flex flex-col gap-1 max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
        <span className="text-[11px] font-medium text-gray-400 px-1 tracking-wide">{name}</span>

        {msg.reply_to && (
          <div className="text-xs border-l-2 border-pink-400 bg-pink-50 text-gray-500 px-3 py-2 rounded-xl max-w-full truncate shadow-sm">
            ↩ {msg.reply_to?.content || "Message"}
          </div>
        )}

        {msg.forwarded_from && (
          <span className="text-[11px] text-gray-400 flex items-center gap-1 px-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Forwarded
          </span>
        )}

        <div className={`flex items-end gap-2 relative ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          {/* Hover action toolbar */}
          {hover && !msg.is_deleted && (
            <div
              className={`absolute ${
                isMe ? "right-full mr-2" : "left-full ml-2"
              } top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-gray-100 rounded-2xl px-2 py-1.5 shadow-lg z-10`}
            >
              <div className="relative">
                <button
                  onClick={() => setPicker((v) => !v)}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                  title="React"
                >
                  😊
                </button>
                {picker && (
                  <EmojiPicker
                    onPick={(emoji) => {
                      onReact(msg._id, emoji, myReaction);
                      setPicker(false);
                    }}
                  />
                )}
              </div>
              <button
                onClick={() => onReply(msg)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                title="Reply"
              >
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={() => onForward(msg._id)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                title="Forward"
              >
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {isMe && (
                <>
                  <button
                    onClick={() => onEdit(msg)}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(msg._id)}
                    className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Bubble */}
          <div
            className={`px-4 py-2.5 text-sm leading-relaxed break-words transition-all duration-150 ${
              msg.is_deleted
                ? "bg-gray-50 text-gray-400 italic rounded-2xl border border-gray-100"
                : isMe
                ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 rounded-2xl rounded-br-sm shadow-sm"
                : "bg-white text-gray-900 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm"
            }`}
          >
            {msg.is_deleted
              ? "Message deleted"
              : msg.content || (msg.content_type ? "Shared a post" : "")}

            {/* Story content_type */}
            {msg.content_type === "story" && !msg.is_deleted && (
              <div className="mt-2">
                {sharedContent && (sharedContent.preview_url || sharedContent.media_url) ? (
                  <div
                    className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50 max-w-xs cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                    onClick={() => {
                      console.log("[Bubble] Click on story content");
                      if (onOpenStory && sharedContent?.content_id) {
                        const storyId = sharedContent.content_id.replace(/^story_/, "");
                        onOpenStory(storyId);
                      }
                    }}
                  >
                    {sharedContent.preview_url && (
                      <img src={sharedContent.preview_url} alt="Story" className="w-full h-40 object-cover" />
                    )}
                    {sharedContent.media_url && !sharedContent.preview_url && (
                      <img src={sharedContent.media_url} alt="Story" className="w-full h-40 object-cover" />
                    )}
                    <div className="p-2.5 bg-white flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">📖</span>
                      <span className="text-xs font-medium text-gray-600">View Story</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border border-pink-100 rounded-xl p-3 bg-pink-50 max-w-xs cursor-pointer hover:bg-pink-100 transition-colors"
                    onClick={() => {
                      console.log("[Bubble] Click on story message, msg:", msg);
                      const storyId = msg.story_id || msg.content_id || msg.media_id || msg._id;
                      if (onOpenStory && storyId) {
                        const cleanStoryId = storyId.replace(/^story_/, "");
                        onOpenStory(cleanStoryId);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
                        <span className="text-sm">📖</span>
                      </div>
                      <span className="text-sm text-pink-600 font-medium">View Story</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shared content preview */}
            {console.log("[Bubble] Rendering sharedContent:", sharedContent) ||
              (!msg.is_deleted &&
                sharedContent &&
                (sharedContent.preview_url ||
                  sharedContent.media_url ||
                  sharedContent.content_type === "story" ||
                  (sharedContent.signed_urls && sharedContent.signed_urls.media)) && (
                  <div
                    className="mt-2 border border-gray-100 rounded-xl overflow-hidden bg-white max-w-xs cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                    onClick={() => {
                      console.log("[Bubble] Click on shared content");
                      console.log("[Bubble] sharedContent:", sharedContent);
                      console.log("[Bubble] sharedContent.content_type:", sharedContent?.content_type);
                      console.log("[Bubble] sharedContent.content_id:", sharedContent?.content_id);
                      console.log("[Bubble] onOpenStory:", onOpenStory);
                      const isStory =
                        sharedContent?.content_type === "story" ||
                        sharedContent?.content_id?.startsWith("story_");
                      console.log("[Bubble] Is story:", isStory);
                      if (isStory && onOpenStory && sharedContent?.content_id) {
                        const storyId = sharedContent.content_id.replace(/^story_/, "");
                        console.log("[Bubble] Opening story:", storyId);
                        onOpenStory(storyId);
                        return;
                        let authorInfo = null;
                        if (sharedContent.author) {
                          authorInfo = {
                            _id: sharedContent.author.user_id || sharedContent.author._id,
                            username: sharedContent.author.username || sharedContent.author.full_name || "",
                            full_name: sharedContent.author.full_name || sharedContent.author.username || "",
                            profile_image_url: sharedContent.author.profile_image_url || sharedContent.author.avatar || null,
                            is_verified: sharedContent.author.is_verified || false,
                          };
                        } else if (msg.sender_id && typeof msg.sender_id === "object") {
                          authorInfo = {
                            _id: msg.sender_id._id || msg.sender_id.id || msg.sender_id.user_id,
                            username: msg.sender_id.username || msg.sender_id.handle || msg.sender_id.full_name || "",
                            full_name: msg.sender_id.full_name || msg.sender_id.username || "",
                            profile_image_url: msg.sender_id.profile_image_url || msg.sender_id.avatar || null,
                            is_verified: msg.sender_id.is_verified || false,
                          };
                        }
                        console.log("[Bubble] Calling onOpenStory with storyId:", storyId);
                        onOpenStory(storyId);
                        return;
                      } else {
                        console.log("[Bubble] Not a story or onOpenStory is null, checking post/reel");
                      }
                      if (onOpenPostDetail && sharedContent.content_id) {
                        let mediaUrl = sharedContent.media_url || sharedContent.preview_url;
                        if (sharedContent.signed_urls?.media?.[0]?.url) {
                          mediaUrl = sharedContent.signed_urls.media[0].url;
                        }
                        const authorId = sharedContent.content_author_id || msg.content_author_id;
                        const sharerId = sharedContent.sharer_id || msg.sharer_id;
                        const getAuthorProfile = async () => {
                          if (authorId && profileMap) {
                            let authorProfile = profileMap[authorId];
                            if (!authorProfile && authorId?._id) {
                              authorProfile = profileMap[authorId._id];
                            }
                            if (!authorProfile) {
                              authorProfile = Object.values(profileMap).find(
                                (p) => p._id === authorId || p.user_id === authorId
                              );
                            }
                            if (authorProfile) {
                              return {
                                _id: authorProfile._id || authorProfile.user_id,
                                username: authorProfile.username || authorProfile.handle || authorProfile.full_name || "",
                                full_name: authorProfile.full_name || authorProfile.username || "",
                                profile_image_url: authorProfile.profile_image_url || authorProfile.avatar || null,
                                is_verified: authorProfile.is_verified || false,
                              };
                            }
                          }
                          if (authorId) {
                            try {
                              const userId = typeof authorId === "string" ? authorId : authorId._id || authorId.user_id;
                              if (userId) {
                                const response = await getUserById(userId);
                                if (response?.data) {
                                  const user = response.data;
                                  return {
                                    _id: user._id || user.id,
                                    username: user.username || user.handle || user.full_name || "",
                                    full_name: user.full_name || user.username || "",
                                    profile_image_url: user.profile_image_url || user.avatar || null,
                                    is_verified: user.is_verified || false,
                                  };
                                }
                              }
                            } catch (e) {
                              console.log("[Bubble] Error fetching author profile:", e);
                            }
                          }
                          if (sharerId && profileMap) {
                            let sharerProfile = profileMap[sharerId];
                            if (!sharerProfile && sharerId?._id) {
                              sharerProfile = profileMap[sharerId._id];
                            }
                            if (sharerProfile) {
                              return {
                                _id: sharerProfile._id || sharerProfile.user_id,
                                username: sharerProfile.username || sharerProfile.handle || sharerProfile.full_name || "",
                                full_name: sharerProfile.full_name || sharerProfile.username || "",
                                profile_image_url: sharerProfile.profile_image_url || sharerProfile.avatar || null,
                                is_verified: sharerProfile.is_verified || false,
                              };
                            }
                          }
                          return null;
                        };
                        let authorObj = null;
                        if (authorId && profileMap) {
                          let authorProfile = profileMap[authorId];
                          if (!authorProfile)
                            authorProfile = Object.values(profileMap).find(
                              (p) => p._id === authorId || p.user_id === authorId
                            );
                          if (authorProfile) {
                            authorObj = {
                              _id: authorProfile._id || authorProfile.user_id,
                              username: authorProfile.username || authorProfile.handle || authorProfile.full_name || "",
                              full_name: authorProfile.full_name || authorProfile.username || "",
                              profile_image_url: authorProfile.profile_image_url || authorProfile.avatar || null,
                              is_verified: authorProfile.is_verified || false,
                            };
                          }
                        }
                        if (!authorObj && typeof msg.sender_id === "object" && msg.sender_id && msg.sender_id.full_name) {
                          const senderObj = msg.sender_id;
                          authorObj = {
                            _id: senderObj._id || senderObj.id || senderObj.user_id,
                            username: senderObj.username || senderObj.handle || senderObj.full_name || "",
                            full_name: senderObj.full_name || senderObj.username || "",
                            profile_image_url: senderObj.profile_image_url || senderObj.avatar || null,
                            is_verified: senderObj.is_verified || false,
                          };
                        }
                        if (!authorObj && msg.sender_id && profileMap) {
                          const senderProfile =
                            profileMap[msg.sender_id] ||
                            profileMap[msg.sender_id?._id] ||
                            profileMap[msg.sender_id?.id];
                          if (senderProfile) {
                            authorObj = {
                              _id: senderProfile._id || senderProfile.user_id,
                              username: senderProfile.username || senderProfile.handle || senderProfile.full_name || "",
                              full_name: senderProfile.full_name || senderProfile.username || "",
                              profile_image_url: senderProfile.profile_image_url || senderProfile.avatar || null,
                              is_verified: senderProfile.is_verified || false,
                            };
                          }
                        }
                        if (!authorObj && sharedContent.author) {
                          const sharedAuthor = sharedContent.author;
                          authorObj = {
                            _id: sharedAuthor.user_id || sharedAuthor._id,
                            username: sharedAuthor.username || sharedAuthor.full_name || "",
                            full_name: sharedAuthor.full_name || sharedAuthor.username || "",
                            profile_image_url: sharedAuthor.profile_image_url || sharedAuthor.avatar || null,
                            is_verified: sharedAuthor.is_verified || false,
                          };
                        }
                        const fetchFullPost = async () => {
                          try {
                            console.log("[Bubble] Fetching full post details for:", sharedContent.content_id);
                            let fullPost = null;
                            try {
                              const response = await postService.getPost(sharedContent.content_id);
                              console.log("[Bubble] postService response:", response);
                              fullPost = response?.data?.data || response?.data || response;
                            } catch (e) {
                              console.log("[Bubble] postService failed, trying getPostById:", e);
                              fullPost = await getPostById(sharedContent.content_id);
                            }
                            console.log("[Bubble] Full post data received:", fullPost);
                            if (fullPost) {
                              fullPost.post_id = fullPost.post_id || fullPost._id || fullPost.id || sharedContent.content_id;
                              fullPost._id = fullPost._id || fullPost.id || sharedContent.content_id;
                              fullPost.content_type = fullPost.content_type || sharedContent.content_type || "post";
                              if (!fullPost.media || fullPost.media.length === 0) {
                                if (sharedContent.signed_urls?.media) {
                                  fullPost.media = sharedContent.signed_urls.media;
                                } else if (fullPost.media_url) {
                                  fullPost.media = [{ url: fullPost.media_url, type: fullPost.media_type === "video" ? "video" : "image" }];
                                } else if (fullPost.images?.length > 0) {
                                  fullPost.media = fullPost.images.map((img) => ({ url: img.url || img, type: "image" }));
                                } else if (sharedContent.thumbnail || sharedContent.media_url) {
                                  fullPost.media = [{ url: sharedContent.thumbnail || sharedContent.media_url, type: "image" }];
                                }
                              }
                              const postWithAuthor = { ...fullPost, author: fullPost.author || authorObj };
                              console.log("[Bubble] Final postWithAuthor:", postWithAuthor);
                              onOpenPostDetail(postWithAuthor);
                            } else {
                              const postObj = {
                                _id: sharedContent.content_id,
                                post_id: sharedContent.content_id,
                                content_type: sharedContent.content_type || "post",
                                media: [{ url: mediaUrl, type: sharedContent.content_type === "reel" ? "video" : "image" }],
                                content: { text: sharedContent.caption || "", location: sharedContent.location || null },
                                author: authorObj,
                                likes: [],
                                comments: [],
                                shares: [],
                              };
                              onOpenPostDetail(postObj);
                            }
                          } catch (error) {
                            console.error("[Bubble] Error fetching post:", error);
                            const postObj = {
                              _id: sharedContent.content_id,
                              post_id: sharedContent.content_id,
                              content_type: sharedContent.content_type || "post",
                              media: [{ url: mediaUrl, type: sharedContent.content_type === "reel" ? "video" : "image" }],
                              content: { text: sharedContent.caption || "", location: sharedContent.location || null },
                              author: authorObj,
                              likes: [],
                              comments: [],
                              shares: [],
                            };
                            onOpenPostDetail(postObj);
                          }
                        };
                        fetchFullPost();
                      }
                    }}
                  >
                    {msg.sender_id && profileMap && profileMap[msg.sender_id] && (
                      <div className="flex items-center gap-2 p-2.5 border-b border-gray-50">
                        <img
                          src={profileMap[msg.sender_id]?.avatar || "/playymate-logo.png"}
                          alt={profileMap[msg.sender_id]?.full_name || "User"}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-gray-700">
                          {profileMap[msg.sender_id]?.full_name || profileMap[msg.sender_id]?.username || "User"}
                        </span>
                      </div>
                    )}
                    {sharedContent.preview_url ? (
                      <img
                        src={sharedContent.preview_url}
                        alt={sharedContent.caption || "Shared content"}
                        className="w-full max-h-48 object-cover"
                      />
                    ) : sharedContent.media_url ? (
                      <img
                        src={sharedContent.media_url}
                        alt={sharedContent.caption || "Shared content"}
                        className="w-full max-h-48 object-cover"
                      />
                    ) : sharedContent.signed_urls?.media ? (
                      sharedContent.signed_urls.media.map((media, idx) => (
                        <div key={idx} className="overflow-hidden">
                          {media.type === "image" ? (
                            <img src={media.url} alt="Shared content" className="w-full max-h-48 object-cover" />
                          ) : media.type === "video" ? (
                            <video src={media.url} controls className="w-full max-h-48" />
                          ) : null}
                        </div>
                      ))
                    ) : null}
                    {sharedContent.caption && (
                      <p className="text-xs text-gray-500 px-3 py-2 border-t border-gray-50">{sharedContent.caption}</p>
                    )}
                    <div className="px-3 py-2 border-t border-gray-50">
                      <span className="text-[11px] text-pink-500 font-medium">Tap to view →</span>
                    </div>
                  </div>
                ))}

            {/* signed_urls media */}
            {!msg.is_deleted && msg.signed_urls?.media?.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {msg.signed_urls.media.map((media, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden shadow-sm">
                    {media.type === "image" ? (
                      <img src={media.url} alt="Shared content" className="h-60 w-60 rounded-xl object-cover" />
                    ) : media.type === "video" ? (
                      <video src={media.url} controls className="h-60 w-60 rounded-xl object-cover" />
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {!msg.is_deleted && msg.media_url && !msg.signed_urls && (
              <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachment
              </div>
            )}

            {/* Timestamp + read receipt */}
            <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
              <span className="text-[10px] text-gray-400 font-medium">{formatTime(msg.created_at)}</span>
              {isMe && !msg.is_deleted && (
                seen ? (
                  <svg width="18" height="11" viewBox="0 0 18 11" fill="none" className="inline-block">
                    <path d="M1 5.5l3.5 3.5L12 1" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                    <path d="M6 5.5l3.5 3.5L17 1" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="inline-block">
                    <path d="M1.5 5.5l3 3 5-6.5" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              )}
            </div>
          </div>
        </div>

        {/* Reaction pills */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-0.5">
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <span
                key={emoji}
                onClick={() => onReact(msg._id, emoji, myReaction)}
                className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 shadow-sm cursor-pointer hover:bg-gray-50 hover:scale-105 transition-all duration-150 font-medium"
              >
                {emoji}
                {count > 1 ? ` ${count}` : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const myId = getMyId();
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const socketRef = useRef(null);
  const selectedConvRef = useRef(null);

  const [profileMap, setProfileMap] = useState({});
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [messageRequests, setMessageRequests] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvInput, setNewConvInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSearchUser, setSelectedSearchUser] = useState(null);
  const searchDebounceRef = useRef(null);
  const [showRename, setShowRename] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [connected, setConnected] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  const handleOpenStory = async (storyId) => {
    console.log("[handleOpenStory] Opening story:", storyId);
    try {
      const fullStoryId = storyId.startsWith("story_") ? storyId : `story_${storyId}`;
      console.log("[handleOpenStory] Full story ID:", fullStoryId);
      const storyPreview = await getStoryPreview(fullStoryId);
      console.log("[handleOpenStory] API response:", storyPreview);
      if (storyPreview) {
        setSelectedStory(storyPreview);
        setShowStoryViewer(true);
      }
    } catch (error) {
      console.error("[handleOpenStory] Error:", error);
    }
  };

  const handleCloseStoryViewer = () => {
    setShowStoryViewer(false);
    setSelectedStory(null);
  };

  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  const handleOpenPostDetail = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleClosePostDetail = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  const handleEmojiPick = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText((prev) => prev + emoji);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);
    requestAnimationFrame(() => {
      const pos = start + emoji.length;
      textarea.selectionStart = pos;
      textarea.selectionEnd = pos;
      textarea.focus();
    });
  };

  function normalizeUser(user) {
    const id = user.user_id || user.id || user._id || "";
    return {
      _id: id,
      user_id: id,
      id: id,
      username: user.username || user.handle || "",
      full_name: user.full_name || user.name || user.display_name || "",
      avatar: user.avatar || user.profile_image_url || null,
      profile_image_url: user.profile_image_url || user.avatar || null,
    };
  }

  useEffect(() => {
    if (!showNewConv) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedSearchUser(null);
      return;
    }
    clearTimeout(searchDebounceRef.current);
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        console.log("[NewConv] Searching for:", searchQuery.trim());
        const response = await searchAccounts(searchQuery.trim(), 20);
        console.log("[NewConv] Search response:", response);
        if ((response.status === "success" || response.success) && response.data) {
          const results = response.data.items || response.data.results || response.data || [];
          setSearchResults(Array.isArray(results) ? results.map(normalizeUser) : []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("[NewConv] Search error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery, showNewConv]);

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

  const appendMessage = useCallback(
    (msg) => {
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
    },
    [mergeProfiles]
  );

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
      (process.env.NEXT_PUBLIC_API_URL || "").replace("/api/v1", "");
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
      if (selectedConvRef.current?._id) {
        console.log("[Socket] Rejoining room after reconnect:", selectedConvRef.current._id);
        socket.emit("conversation:join", { conversationId: selectedConvRef.current._id });
      }
    });
    socket.on("connect_error", (err) => { console.error("[Socket] Connection error:", err.message); });
    socket.on("disconnect", (reason) => { console.warn("[Socket] Disconnected. Reason:", reason); setConnected(false); });
    socket.on("message:new", (message) => {
      const convId = message.conversation_id;
      console.log("[Socket] message:new received. convId:", convId, "currentConv:", selectedConvRef.current?._id, "msg:", message._id);
      if (selectedConvRef.current?._id === convId) {
        appendMessage(message);
        if (message._id) {
          markMessageRead(message._id).catch((e) => { console.warn("[Socket] markMessageRead failed:", e.message); });
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
            unread_counts: { ...c.unread_counts, [myId]: isOpen ? 0 : (c.unread_counts?.[myId] || 0) + 1 },
          };
        })
      );
    });
    socket.on("message:updated", (message) => {
      console.log("[Socket] message:updated received:", message._id);
      if (selectedConvRef.current?._id === message.conversation_id) {
        setMessages((prev) => prev.map((m) => (m._id === message._id ? { ...m, ...message } : m)));
      }
    });
    socket.on("message:deleted", ({ messageId, conversationId }) => {
      console.log("[Socket] message:deleted received:", messageId);
      if (selectedConvRef.current?._id === conversationId) {
        setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, is_deleted: true, content: "" } : m)));
      }
    });
    socket.on("message:read_ack", ({ messageId, userId, conversationId }) => {
      console.log("[Socket] message:read_ack received. messageId:", messageId, "userId:", userId, "convId:", conversationId);
      if (selectedConvRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, read_by: [...new Set([...(m.read_by || []), userId])] } : m))
        );
      }
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? { ...c, unread_counts: { ...c.unread_counts, [userId]: 0 } } : c))
      );
    });
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
    socket.on("message:reaction", ({ messageId, conversationId, reactions }) => {
      console.log("[Socket] message:reaction received. messageId:", messageId);
      if (selectedConvRef.current?._id === conversationId) {
        setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)));
      }
    });
    socket.on("call:incoming", (data) => {
      console.log("[Socket] Incoming call:", data);
      if (data && data.call_id) {
        if (data.provider_config || data.provider) {
          const callData = {
            provider: data.provider || data.provider_config?.type,
            ws_url: data.provider_config?.ws_url || data.rtc_ws_url,
            token: data.token || data.rtc_token || data.zego_token,
            room_id: data.room_id,
            app_id: data.provider_config?.app_id,
            provider_config: data.provider_config,
          };
          sessionStorage.setItem(`call_${data.call_id}`, JSON.stringify(callData));
        }
        setIncomingCall({
          callId: data.call_id,
          callerId: data.caller_id,
          callerName: data.caller_name || data.caller_username,
          callType: data.call_type || "video",
          roomId: data.room_id,
          provider: data.provider,
          providerConfig: data.provider_config,
        });
        setShowCallModal(true);
      }
    });
    socket.on("call:accepted", (data) => { console.log("[Socket] Call accepted:", data); });
    socket.on("call:declined", (data) => { console.log("[Socket] Call declined:", data); });
    socket.on("call:ended", (data) => { console.log("[Socket] Call ended:", data); });
    return () => {
      console.log("[Socket] Cleaning up socket connection");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [myId]);

  const fetchMessages = useCallback(
    async (convId) => {
      setMsgLoading(true);
      try {
        const data = await getMessages(convId, { limit: 50 });
        const msgs = data?.messages || [];
        setMessages(msgs);
        const users = msgs.map((m) => m.sender_id).filter((s) => s && typeof s === "object" && s.full_name);
        mergeProfiles(users);
        return msgs;
      } catch (e) {
        console.error("fetchMessages:", e.message);
        return [];
      } finally {
        setMsgLoading(false);
      }
    },
    [mergeProfiles]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConv = async (conv) => {
    if (selectedConvRef.current?._id && socketRef.current) {
      console.log("[Socket] Leaving room:", selectedConvRef.current._id);
      socketRef.current.emit("conversation:leave", { conversationId: selectedConvRef.current._id });
    }
    setSelectedConv(conv);
    selectedConvRef.current = conv;
    setReplyTo(null);
    setEditingMsg(null);
    setText("");
    setMessages([]);
    if (socketRef.current) {
      console.log("[Socket] Joining room:", conv._id, "| socket connected:", socketRef.current.connected, "| socket.id:", socketRef.current.id);
      socketRef.current.emit("conversation:join", { conversationId: conv._id });
    } else {
      console.warn("[Socket] socketRef.current is null — cannot join room!");
    }
    const users = (conv.participants || []).map((p) => p.user_id).filter((u) => u && typeof u === "object");
    mergeProfiles(users);
    const msgs = await fetchMessages(conv._id);
    const lastMsg = msgs?.[msgs.length - 1];
    if (lastMsg?._id) {
      try {
        await markMessageRead(lastMsg._id);
        setConversations((prev) =>
          prev.map((c) => (c._id === conv._id ? { ...c, unread_counts: { ...c.unread_counts, [myId]: 0 } } : c))
        );
      } catch (e) {
        console.error("markRead:", e.message);
      }
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedConv) return;
    if (socketRef.current) {
      socketRef.current.emit("typing:stop", { conversationId: selectedConv._id });
    }
    setSending(true);
    try {
      if (editingMsg) {
        await editMessage(editingMsg._id, text.trim());
        setMessages((prev) => prev.map((m) => (m._id === editingMsg._id ? { ...m, content: text.trim() } : m)));
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

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, is_deleted: true, content: "" } : m)));
    } catch (e) { console.error("handleDelete:", e.message); }
  };

  const handleForward = async (msgId) => {
    const targets = conversations.filter((c) => c._id !== selectedConv._id);
    if (!targets.length) return;
    const chosen = prompt(`Forward to:\n${targets.map((c) => getConvName(c, myId)).join("\n")}`);
    if (!chosen) return;
    const target = targets.find((c) => getConvName(c, myId).toLowerCase().includes(chosen.toLowerCase()));
    if (!target) return alert("Not found");
    try {
      await forwardMessage(msgId, [target._id]);
    } catch (e) { console.error("handleForward:", e.message); }
  };

  const handlePin = async () => {
    if (!selectedConv) return;
    const pinned = (selectedConv.pinned_by || []).includes(myId);
    try {
      const u = pinned ? await unpinConversation(selectedConv._id) : await pinConversation(selectedConv._id);
      setSelectedConv((p) => ({ ...p, pinned_by: u.pinned_by }));
    } catch (e) { console.error(e.message); }
  };

  const handleArchive = async () => {
    if (!selectedConv) return;
    const archived = (selectedConv.archived_by || []).includes(myId);
    try {
      const u = archived ? await unarchiveConversation(selectedConv._id) : await archiveConversation(selectedConv._id);
      setSelectedConv((p) => ({ ...p, archived_by: u.archived_by }));
    } catch (e) { console.error(e.message); }
  };

  const handleNewConv = async () => {
    if (!newConvInput.trim()) return;
    try {
      const conv = await createConversation({ participants: [newConvInput.trim()] });
      setShowNewConv(false);
      setNewConvInput("");
      handleSelectConv(conv);
    } catch (e) { alert("Failed: " + e.message); }
  };

  const handleSidebarUserSelect = async (user) => {
    try {
      const userId = user._id || user.user_id || user.id;
      const conv = await createConversation({ participants: [userId] });
      setSearch("");
      handleSelectConv(conv);
    } catch (e) {
      console.error("Failed to start conversation:", e.message);
      alert("Failed to start conversation: " + e.message);
    }
  };

  const handleCreateGroup = async (groupName, userIds) => {
    try {
      console.log("[CreateGroup] Creating group:", groupName, "with users:", userIds);
      const conv = await createConversation({
        is_group: true,
        group_name: groupName,
        participants: userIds,
        allowMemberInvite: true,
        onlyAdminSend: false,
      });
      console.log("[CreateGroup] Group created:", conv);
      let newConversation;
      if (conv?.data) {
        newConversation = {
          _id: conv.data._id || `temp-${Date.now()}`,
          participants: conv.data.participants || [],
          group_name: conv.data.group_name || groupName,
          is_group: conv.data.is_group || true,
          pinned_by: conv.data.pinned_by || [],
          archived_by: conv.data.archived_by || [],
          unread_counts: conv.data.unread_counts || {},
          last_message: conv.data.last_message || null,
          last_message_at: new Date().toISOString(),
          ...conv.data,
        };
        setSelectedConv(newConversation);
        setConversations((prev) => [newConversation, ...prev]);
      } else if (conv?.conversation) {
        newConversation = {
          _id: conv.conversation._id || `temp-${Date.now()}`,
          participants: conv.conversation.participants || [],
          group_name: conv.conversation.group_name || groupName,
          is_group: conv.conversation.is_group || true,
          pinned_by: conv.conversation.pinned_by || [],
          archived_by: conv.conversation.archived_by || [],
          unread_counts: conv.conversation.unread_counts || {},
          last_message: conv.conversation.last_message || null,
          last_message_at: new Date().toISOString(),
          ...conv.conversation,
        };
        setSelectedConv(newConversation);
        setConversations((prev) => [newConversation, ...prev]);
      }
      setSearch("");
    } catch (e) {
      console.error("Failed to create group:", e.message);
      alert("Failed to create group: " + e.message);
    }
  };

  const handleSelectConversationForRename = (conv) => {
    if (conv && conv.is_group) {
      setRenameInput(conv.group_name || "");
      setShowRename(true);
    }
  };

  const handleRename = async () => {
    if (!renameInput.trim() || !selectedConv) return;
    try {
      const response = await updateConversation(selectedConv._id, { group_name: renameInput.trim() });
      const updatedConv = response.data || response;
      setSelectedConv((p) => ({ ...p, group_name: updatedConv.group_name }));
      setShowRename(false);
      setConversations((prev) =>
        prev.map((c) => (c._id === selectedConv._id ? { ...c, group_name: updatedConv.group_name } : c))
      );
    } catch (e) { alert("Failed: " + e.message); }
  };

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
    } catch (e) { console.error(e.message); }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;
    setUploading(true);
    try {
      const key = await uploadMedia(file);
      const type = file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : "file";
      const newMsg = await sendMessage(selectedConv._id, { message_type: type, media_key: key });
      appendMessage(newMsg);
      setConversations((prev) =>
        prev.map((c) => (c._id === selectedConv._id ? { ...c, last_message_at: new Date().toISOString() } : c))
      );
    } catch (e) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const filtered = conversations.filter((c) =>
    getConvName(c, myId).toLowerCase().includes(search.toLowerCase())
  );
  const isPinned = selectedConv && (selectedConv.pinned_by || []).includes(myId);
  const isArchived = selectedConv && (selectedConv.archived_by || []).includes(myId);
  const isTyping = selectedConv
    ? (typingUsers[selectedConv._id] || []).filter((id) => id !== myId).length > 0
    : false;

  return (
    <div className="flex lg:max-h-[560px] rounded-2xl mr-8 overflow-hidden shadow-xl border border-gray-100">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <MessagesSidebar
        connected={connected}
        search={search}
        setSearch={setSearch}
        setShowNewConv={setShowNewConv}
        selectedConv={selectedConv}
        onSelectConv={handleSelectConv}
        onConversationsChange={setConversations}
        onMessageRequestsChange={setMessageRequests}
        myId={myId}
        conversations={conversations}
        onSearchUsers={handleSidebarUserSelect}
        onCreateGroup={handleCreateGroup}
        onSelectConversationForRename={handleSelectConversationForRename}
      />

      {/* ── Chat ─────────────────────────────────────────────────────────── */}
      {!selectedConv ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          {/* Decorative rings */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-36 h-36 rounded-full border border-gray-100 opacity-60" />
            <div className="absolute w-28 h-28 rounded-full border border-gray-100 opacity-80" />
            <div className="w-20 h-20 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <p className="text-base font-semibold text-gray-700 tracking-tight">Your messages</p>
          <p className="mt-1.5 text-sm text-gray-400">Send a message to start a chat.</p>
          <button
            onClick={() => setShowNewConv(true)}
            className="mt-5 px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90 shadow-md"
            style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}
          >
            Start a conversation
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0 bg-white">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={getConvName(selectedConv, myId)} imgUrl={getConvImg(selectedConv, myId)} size={10} />
                {connected && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{getConvName(selectedConv, myId)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isTyping ? (
                    <span className="text-pink-500 font-medium">typing...</span>
                  ) : selectedConv.is_group ? (
                    `${selectedConv.participantCount || selectedConv.participants?.length || 0} members`
                  ) : (
                    "Direct message"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {selectedConv.is_group && (
                <button
                  onClick={() => setShowMembers(true)}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  title="View Members"
                >
                  <svg className="w-4.5 h-4.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              )}
              <CallNow selectedConv={selectedConv} myId={myId} />
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 bg-gray-50/30">
            {msgLoading ? (
              <div className="space-y-5">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className={`flex items-end gap-2.5 ${i % 2 ? "flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                    <div className={`h-10 rounded-2xl bg-gray-200 animate-pulse ${i % 2 ? "w-48" : "w-40"}`} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-2xl">👋</span>
                </div>
                <p className="text-sm font-medium text-gray-500">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const prev = messages[index - 1];
                const showDate =
                  !prev ||
                  new Date(prev.created_at).toDateString() !== new Date(msg.created_at).toDateString();
                return (
                  <div key={msg._id}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[11px] text-gray-400 font-medium px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm">
                          {formatMessageDate(msg.created_at)}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}
                    <Bubble
                      msg={msg}
                      myId={myId}
                      profileMap={profileMap}
                      messageRequests={messageRequests}
                      onReply={(m) => { setReplyTo(m); setEditingMsg(null); }}
                      onEdit={(m) => { setEditingMsg(m); setReplyTo(null); setText(m.content); }}
                      onDelete={handleDelete}
                      onReact={handleReact}
                      onForward={handleForward}
                      onOpenPostDetail={handleOpenPostDetail}
                      onOpenStory={handleOpenStory}
                    />
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex items-end gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0 ring-2 ring-white" />
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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

          {/* ── Compose ── */}
          <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-3 flex-shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            {replyTo && (
              <div className="flex items-center justify-between bg-pink-50 border border-pink-100 rounded-xl px-3.5 py-2 mb-2.5">
                <p className="text-xs text-pink-600 truncate">
                  ↩ <span className="font-semibold">{replyTo.content?.slice(0, 60)}</span>
                </p>
                <button onClick={() => setReplyTo(null)} className="ml-2 text-pink-400 hover:text-pink-600 flex-shrink-0 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {editingMsg && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2 mb-2.5">
                <p className="text-xs text-amber-600 font-medium">✏️ Editing message</p>
                <button
                  onClick={() => { setEditingMsg(null); setText(""); }}
                  className="ml-2 text-amber-400 hover:text-amber-600 flex-shrink-0 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} accept="image/*,video/*,audio/*,.pdf" />

              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors"
                title="Attach file"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                )}
              </button>

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-base transition-colors"
                  title="Emoji"
                >
                  😊
                </button>
                {showEmojiPicker && (
                  <ComposeEmojiPicker onPick={handleEmojiPick} onClose={() => setShowEmojiPicker(false)} />
                )}
              </div>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={editingMsg ? "Edit your message..." : "Type a message..."}
                rows={1}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />

              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all hover:scale-105 shadow-sm"
                style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}
                title="Send"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New conversation modal ── */}
      {showNewConv && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowNewConv(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[520px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-base">New conversation</h3>
                <button
                  onClick={() => setShowNewConv(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people..."
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                  autoFocus
                />
                {searchLoading && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {searchQuery.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeWidth="2" />
                      <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">Type at least 2 characters to search</p>
                </div>
              ) : searchResults.length === 0 && !searchLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-gray-400">No users found</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {(() => {
                    const followingUsers = searchResults.filter((u) => u.following === true || u.following === "true");
                    const otherUsers = searchResults.filter((u) => !u.following || u.following === false || u.following === "false");

                    const renderUserRow = (user) => {
                      const userId = user._id || user.id || user.user_id;
                      const displayName = user.full_name || user.username || "";
                      const handle = user.username || "";
                      const avatarUrl = user.profile_image_url || user.avatar;
                      const isFollowing = user.following === true || user.following === "true" || Boolean(user.following);

                      return (
                        <button
                          key={userId}
                          onClick={async () => {
                            try {
                              console.log("[NewConv] Creating conversation with user:", userId);
                              const conv = await createConversation({ participants: [userId] });
                              console.log("[NewConv] Conversation created:", conv);
                              let newConversation;
                              if (conv?.data?.conversation) {
                                newConversation = {
                                  _id: conv.data.conversation._id || `temp-${Date.now()}`,
                                  participants: conv.data.conversation.participants || [],
                                  group_name: conv.data.conversation.group_name || null,
                                  is_group: conv.data.conversation.is_group || false,
                                  pinned_by: conv.data.conversation.pinned_by || [],
                                  archived_by: conv.data.conversation.archived_by || [],
                                  unread_counts: conv.data.conversation.unread_counts || {},
                                  last_message: conv.data.conversation.last_message || null,
                                  last_message_at: new Date().toISOString(),
                                  ...conv.data.conversation,
                                };
                                setSelectedConv(newConversation);
                                setConversations((prev) => [newConversation, ...prev]);
                              } else if (conv?.conversation) {
                                newConversation = {
                                  _id: conv.conversation._id || `temp-${Date.now()}`,
                                  participants: conv.conversation.participants || [],
                                  group_name: conv.conversation.group_name || null,
                                  is_group: conv.conversation.is_group || false,
                                  pinned_by: conv.conversation.pinned_by || [],
                                  archived_by: conv.conversation.archived_by || [],
                                  unread_counts: conv.conversation.unread_counts || {},
                                  last_message: conv.conversation.last_message || null,
                                  last_message_at: new Date().toISOString(),
                                  ...conv.conversation,
                                };
                                setSelectedConv(newConversation);
                                setConversations((prev) => [newConversation, ...prev]);
                              } else if (conv?.data) {
                                newConversation = {
                                  _id: conv.data._id || `temp-${Date.now()}`,
                                  participants: conv.data.participants || [],
                                  group_name: conv.data.group_name || null,
                                  is_group: conv.data.is_group || false,
                                  pinned_by: conv.data.pinned_by || [],
                                  archived_by: conv.data.archived_by || [],
                                  unread_counts: conv.data.unread_counts || {},
                                  last_message: conv.data.last_message || null,
                                  last_message_at: new Date().toISOString(),
                                  ...conv.data,
                                };
                                setSelectedConv(newConversation);
                                setConversations((prev) => [newConversation, ...prev]);
                              } else {
                                console.warn("[NewConv] Unexpected response format:", conv);
                              }
                              setShowNewConv(false);
                              setSearchQuery("");
                              setSearchResults([]);
                            } catch (err) {
                              console.error("[NewConv] Error creating conversation:", err);
                              alert("Failed to start conversation. Please try again.");
                            }
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${colorFor(userId)}`}>
                              {initials(displayName) || "?"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate">{displayName}</div>
                            {handle && <div className="text-xs text-gray-400 truncate">@{handle}</div>}
                          </div>
                          {isFollowing && (
                            <span className="text-[11px] font-semibold text-pink-500 bg-pink-50 px-2.5 py-1 rounded-full flex-shrink-0 border border-pink-100">
                              Following
                            </span>
                          )}
                        </button>
                      );
                    };

                    return (
                      <>
                        {followingUsers.length > 0 && (
                          <>
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2">
                              Following
                            </div>
                            {followingUsers.map(renderUserRow)}
                          </>
                        )}
                        {otherUsers.length > 0 && (
                          <>
                            {followingUsers.length > 0 && (
                              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2 mt-1">
                                Others
                              </div>
                            )}
                            {otherUsers.map(renderUserRow)}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowNewConv(false)}
                className="w-full py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename modal ── */}
      {showRename && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRename(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 text-base mb-1">Rename group</h3>
            <p className="text-xs text-gray-400 mb-4">Choose a new name for this conversation</p>
            <input
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              placeholder="New group name..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50 focus:bg-white"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleRename}
                className="flex-1 py-2.5 text-white text-sm font-bold rounded-2xl transition-all hover:opacity-90 shadow-sm"
                style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}
              >
                Save
              </button>
              <button
                onClick={() => setShowRename(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Members drawer ── */}
      {showMembers && selectedConv && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end" onClick={() => setShowMembers(false)}>
          <div
            className="w-80 bg-white h-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideInRight 0.2s ease-out" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Group Members</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedConv.participants?.length || 0} members</p>
              </div>
              <button
                onClick={() => setShowMembers(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">{selectedConv.group_name || "Group"}</h4>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {selectedConv.participants?.map((participant, index) => {
                const user = participant.user_id || participant;
                const userId = user._id || user.id || user.user_id;
                const isOwner = participant.role === "owner";
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${colorFor(user.full_name)}`}
                      >
                        {initials(user.full_name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.full_name || user.username || "Unknown"}
                      </p>
                      {user.username && <p className="text-xs text-gray-400 truncate">@{user.username}</p>}
                    </div>
                    {isOwner && (
                      <span className="text-[11px] font-semibold text-pink-500 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100">
                        Admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Post Detail Modal ── */}
      {showPostModal && selectedPost && (
        <UserPostDetailModal post={selectedPost} isLoading={false} onClose={handleClosePostDetail} />
      )}

      {/* ── Story Viewer Modal ── */}
      {showStoryViewer && selectedStory && (
        <UserStory
          userId={selectedStory.author?._id}
          profile={{
            _id: selectedStory.author?._id,
            full_name: selectedStory.author?.full_name,
            username: selectedStory.author?.username,
            profile_image_url: selectedStory.author?.profile_image_url,
          }}
          showRing={false}
          ringColor="bg-gray-200"
          initialStory={selectedStory}
          showUserProfile={false}
        />
      )}

      {/* ── Incoming Call Modal ── */}
      {showCallModal && incomingCall && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-7 w-80 text-center shadow-2xl">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
              style={{ background: "linear-gradient(135deg,#fce7f3,#ffedd5)" }}
            >
              <FaPhone className="w-6 h-6 text-pink-500" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Incoming {incomingCall.callType === "audio" ? "Audio" : "Video"} Call
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {incomingCall.callerName || "Unknown"}
            </h3>
            <div className="flex gap-3 justify-center">
              <button
                onClick={async () => {
                  try {
                    const { acceptCall } = await import("@/app/user/call-now");
                    const res = await acceptCall(incomingCall.callId);
                    const providerConfig = res?.data?.provider_config;
                    const token = res?.data?.token || res?.data?.rtc_token || res?.data?.zego_token;
                    const callData = {
                      provider: incomingCall.provider || providerConfig?.type,
                      ws_url: providerConfig?.ws_url || incomingCall.providerConfig?.ws_url,
                      token: token,
                      room_id: incomingCall.roomId,
                      app_id: providerConfig?.app_id,
                      provider_config: providerConfig,
                    };
                    sessionStorage.setItem(`call_${incomingCall.callId}`, JSON.stringify(callData));
                    const url = `/call/${incomingCall.callId}?type=${incomingCall.callType}`;
                    window.open(url, "_blank");
                  } catch (err) {
                    console.error("Failed to accept call:", err);
                    alert("Failed to accept call");
                  }
                  setShowCallModal(false);
                  setIncomingCall(null);
                }}
                className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-semibold text-sm hover:bg-green-600 transition-colors shadow-sm"
              >
                Accept
              </button>
              <button
                onClick={async () => {
                  try {
                    const { declineCall } = await import("@/app/user/call-now");
                    await declineCall(incomingCall.callId);
                  } catch (err) {
                    console.error("Failed to decline call:", err);
                  }
                  setShowCallModal(false);
                  setIncomingCall(null);
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-semibold text-sm hover:bg-red-600 transition-colors shadow-sm"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
