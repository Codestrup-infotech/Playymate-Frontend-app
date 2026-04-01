"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Search, Contact, Link2, QrCode,
  Copy, Check, Star, Users,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import {
  createInvite,
  searchUsers,
  sendInvite,
  getRecentActivity,
} from "@/lib/api/teamApi";
import { getFollowing, getFollowers } from "@/services/user";

// ─── Get Current User ID ──────────────────────────────────────────────────────

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

// ─── User Card Component ───────────────────────────────────────────────────────

function UserCard({ user, isDark, inputBg, card, border, sub, muted, invitedIds, inviting, handleInvite, getInitials }) {
  const uid       = user._id || user.id;
  const isInvited = invitedIds.has(uid);
  const isSending = inviting === uid;
  const sport     = user.sport || user.category || "";
  const mutual    = user.mutual_friends ?? user.mutual ?? 0;
  const rating    = user.rating ?? user.score ?? null;

  return (
    <div
      className={`${card} border ${border} rounded-2xl px-3 py-3 flex items-center gap-3`}
    >
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
        style={{
          background: isDark ? "#1e1e35" : "#eef0f8",
          color: "#f43f8a",
          border: isDark ? "1.5px solid #2a2a45" : "1.5px solid #e0e4ef",
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          getInitials(user.name || user.user_name)
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] truncate">
          {user.name || user.user_name || "Unknown"}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {sport && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400">
              {sport}
            </span>
          )}
          {mutual > 0 && (
            <span className={`text-[11px] font-medium ${sub}`}>
              {mutual} mutual
            </span>
          )}
          {rating !== null && (
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${sub}`}>
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              {Number(rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Invite button */}
      <button
        onClick={() => !isInvited && handleInvite(uid)}
        disabled={isInvited || isSending}
        className="flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-70"
        style={{
          background: isInvited
            ? "rgba(34,197,94,0.2)"
            : "linear-gradient(135deg,#f43f8a,#f97316)",
          color: isInvited ? "#22c55e" : "#fff",
          minWidth: 68,
        }}
      >
        {isSending ? (
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
          </span>
        ) : isInvited ? (
          <span className="flex items-center gap-1">
            <Check size={13} /> Sent
          </span>
        ) : (
          "Invite"
        )}
      </button>
    </div>
  );
}

export default function InvitePlayers({ teamId: teamIdProp, onClose }) {
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const teamId = teamIdProp || params?.teamId;

  // ── State ──
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);
  const [inviteLink, setInviteLink]       = useState("");
  const [copied, setCopied]               = useState(false);
  const [recentUsers, setRecentUsers]     = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [invitedIds, setInvitedIds]       = useState(new Set());
  const [inviting, setInviting]           = useState(null); // userId being invited
  const [myFollowing, setMyFollowing]    = useState([]);
  const [myFollowers, setMyFollowers]    = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // ── Load my followers and following ──
  const myId = useMemo(() => getMyId(), []);

  useEffect(() => {
    if (!myId) return;

    // Fetch followers and following
    (async () => {
      try {
        setLoadingConnections(true);
        
        // Fetch both in parallel
        const [followersRes, followingRes] = await Promise.all([
          getFollowers(myId, 50),
          getFollowing(myId, 50)
        ]);
        
        // Extract users from response
        const followersData = followersRes?.data?.followers || followersRes?.data || [];
        const followingData = followingRes?.data?.following || followingRes?.data || [];
        
        setMyFollowers(Array.isArray(followersData) ? followersData : []);
        setMyFollowing(Array.isArray(followingData) ? followingData : []);
      } catch (err) {
        console.error("Error fetching connections:", err);
      } finally {
        setLoadingConnections(false);
      }
    })();
  }, [myId]);

  // ── Load invite link + recent activity ──
  useEffect(() => {
    if (!teamId) return;

    // Fetch invite link
    (async () => {
      try {
        const res  = await createInvite(teamId, { invite_type: "link" });
        const data = res.data || res;
        if (data.link) setInviteLink(data.link);
      } catch {
        setInviteLink(`playymate.app/join/${teamId}`);
      }
    })();

    // Fetch recent / suggested users
    (async () => {
      try {
        setLoadingRecent(true);
        const res  = await getRecentActivity(teamId);
        const data = res.data || res;
        setRecentUsers(Array.isArray(data) ? data : []);
      } catch {
        setRecentUsers([]);
      } finally {
        setLoadingRecent(false);
      }
    })();
  }, [teamId]);

  // ── Search debounce with prioritization ──
  useEffect(() => {
    if (!searchQuery.trim()) { 
      setSearchResults([]); 
      return; 
    }
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const res  = await searchUsers(teamId, searchQuery);
        const data = res.data || res;
        const allResults = Array.isArray(data) ? data : [];
        
        // Create a Set of following IDs for quick lookup
        const followingIds = new Set(
          myFollowing.map(u => u._id || u.user_id || u.id).filter(Boolean)
        );
        
        // Sort: prioritize exact match in following, then other results
        const sortedResults = [...allResults].sort((a, b) => {
          const aId = a._id || a.id;
          const bId = b._id || b.id;
          const aInFollowing = followingIds.has(aId);
          const bInFollowing = followingIds.has(bId);
          
          // Exact username match gets highest priority
          const aExactMatch = (a.user_name || a.username || "").toLowerCase() === searchQuery.toLowerCase();
          const bExactMatch = (b.user_name || b.username || "").toLowerCase() === searchQuery.toLowerCase();
          
          // If one is exact match and in following, prioritize
          if (aExactMatch && aInFollowing && !bExactMatch) return -1;
          if (bExactMatch && bInFollowing && !aExactMatch) return 1;
          
          // Then prioritize exact match
          if (aExactMatch && !bExactMatch) return -1;
          if (bExactMatch && !aExactMatch) return 1;
          
          // Then prioritize following
          if (aInFollowing && !bInFollowing) return -1;
          if (bInFollowing && !aInFollowing) return 1;
          
          return 0;
        });
        
        setSearchResults(sortedResults);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, teamId, myFollowing]);

  // ── Copy link ──
  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Send invite ──
  const handleInvite = async (userId) => {
    setInviting(userId);
    try {
      await sendInvite(teamId, { user_id: userId });
      setInvitedIds(prev => new Set([...prev, userId]));
    } catch {
      alert("Failed to send invite");
    } finally {
      setInviting(null);
    }
  };

  // ── Helpers ──
  const getInitials = (name = "") =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const displayList = searchQuery.trim() ? searchResults : recentUsers;
  
  // Separate following and other users for display
  const { following: displayFollowing, others: displayOthers } = useMemo(() => {
    const followingIds = new Set(
      myFollowing.map(u => u._id || u.user_id || u.id).filter(Boolean)
    );
    
    const following = [];
    const others = [];
    
    displayList.forEach(user => {
      const uid = user._id || user.id;
      if (followingIds.has(uid)) {
        following.push(user);
      } else {
        others.push(user);
      }
    });
    
    return { following, others };
  }, [displayList, myFollowing]);

  // ── Theme ──
  const bg       = isDark ? "bg-[#0a0a14]"    : "bg-gray-50";
  const card     = isDark ? "bg-[#12121e]"    : "bg-white";
  const border   = isDark ? "border-[#1e1e35]": "border-gray-200";
  const inputBg  = isDark ? "bg-[#1a1a2e]"    : "bg-gray-100";
  const text     = isDark ? "text-white"       : "text-gray-900";
  const sub      = isDark ? "text-zinc-400"    : "text-gray-500";
  const muted    = isDark ? "text-zinc-600"    : "text-gray-400";

  // Handle back/close action
  const handleBack = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans`}>

      {/* ── Header ── */}
      <div className={`flex items-center gap-3 px-4 pt-5 pb-4 sticky top-0 z-10 ${bg}`}>
        <button
          onClick={handleBack}
          className={`w-9 h-9 flex items-center justify-center rounded-xl ${inputBg} ${text}`}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[17px] font-bold tracking-tight">Invite Players</h1>
      </div>

      <div className="px-4 pb-10 space-y-5">

        {/* ── Search bar ── */}
        <div className={`flex items-center gap-3 ${inputBg} rounded-2xl px-4 py-3`}>
          <Search size={16} className={muted} />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm ${text} placeholder:${muted}`}
          />
          {searching && (
            <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Contact, label: "Contact",   color: "text-pink-400",   bg: "bg-pink-500/10"   },
            { icon: Link2,   label: "Share Link", color: "text-purple-400", bg: "bg-purple-500/10" },
            { icon: QrCode,  label: "QR Code",    color: "text-pink-400",   bg: "bg-pink-500/10"   },
          ].map(({ icon: Icon, label, color, bg: ibg }) => (
            <button
              key={label}
              className={`${card} border ${border} rounded-2xl py-4 flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform`}
            >
              <div className={`w-11 h-11 rounded-xl ${ibg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <span className={`text-xs font-600 ${sub}`}>{label}</span>
            </button>
          ))}
        </div>

        {/* ── Invite Link ── */}
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest ${muted} mb-2`}>
            Invite Link
          </p>
          <div className={`flex items-center gap-2 ${inputBg} rounded-2xl p-1 pl-4`}>
            <span className={`flex-1 text-sm ${sub} truncate`}>
              {inviteLink || "Generating link…"}
            </span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#f43f8a,#f97316)" }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* ── Recent / Search Results ── */}
        <div>
          {searchQuery.trim() ? (
            <>
              {/* Show following first in search results */}
              {displayFollowing.length > 0 && (
                <div className="mb-4">
                  <p className={`text-xs font-semibold uppercase tracking-widest ${muted} mb-2`}>
                    Your Following
                  </p>
                  <div className="space-y-2.5">
                    {displayFollowing.map((user) => (
                      <UserCard 
                        key={user._id || user.id} 
                        user={user}
                        isDark={isDark}
                        inputBg={inputBg}
                        card={card}
                        border={border}
                        sub={sub}
                        muted={muted}
                        invitedIds={invitedIds}
                        inviting={inviting}
                        handleInvite={handleInvite}
                        getInitials={getInitials}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Show other users */}
              {displayOthers.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${muted} mb-2`}>
                    Other Users
                  </p>
                  <div className="space-y-2.5">
                    {displayOthers.map((user) => (
                      <UserCard 
                        key={user._id || user.id} 
                        user={user}
                        isDark={isDark}
                        inputBg={inputBg}
                        card={card}
                        border={border}
                        sub={sub}
                        muted={muted}
                        invitedIds={invitedIds}
                        inviting={inviting}
                        handleInvite={handleInvite}
                        getInitials={getInitials}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {displayFollowing.length === 0 && displayOthers.length === 0 && (
                <div className="text-center py-10">
                  <div className={`w-14 h-14 rounded-2xl ${inputBg} flex items-center justify-center mx-auto mb-3`}>
                    <Users size={24} className={muted} />
                  </div>
                  <p className={`text-sm ${sub}`}>No users found</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Show recent users with following indicator */}
              {loadingRecent ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`${card} border ${border} rounded-2xl p-3 flex items-center gap-3 animate-pulse`}>
                      <div className={`w-11 h-11 rounded-xl ${inputBg}`} />
                      <div className="flex-1 space-y-2">
                        <div className={`h-3 w-28 rounded ${inputBg}`} />
                        <div className={`h-2.5 w-20 rounded ${inputBg}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayList.length === 0 ? (
                <div className="text-center py-10">
                  <div className={`w-14 h-14 rounded-2xl ${inputBg} flex items-center justify-center mx-auto mb-3`}>
                    <Users size={24} className={muted} />
                  </div>
                  <p className={`text-sm ${sub}`}>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayList.map((user) => (
                    <UserCard 
                      key={user._id || user.id} 
                      user={user}
                      isDark={isDark}
                      inputBg={inputBg}
                      card={card}
                      border={border}
                      sub={sub}
                      muted={muted}
                      invitedIds={invitedIds}
                      inviting={inviting}
                      handleInvite={handleInvite}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}