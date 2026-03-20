"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { shareExternal, shareViaDM } from "@/app/user/share";

// ─── API helpers ──────────────────────────────────────────────────────────────
// Adjust BASE_URL / field names to match your actual followers/following endpoints

const BASE_URL = "/api/v1";

function getAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch merged list of followers + following for the current user.
 * Adjust endpoints + response field names to match your API.
 * Returns array of: { _id, username, full_name, avatar, relation }
 */
async function fetchConnections() {
  const [followersRes, followingRes] = await Promise.allSettled([
    fetch(`${BASE_URL}/users/me/followers?limit=50`, { headers: getAuthHeaders() }),
    fetch(`${BASE_URL}/users/me/following?limit=50`, { headers: getAuthHeaders() }),
  ]);

  const parse = async (settled) => {
    if (settled.status !== "fulfilled" || !settled.value.ok) return [];
    const json = await settled.value.json();
    return json?.data?.users || json?.data?.followers || json?.data?.following || [];
  };

  const followers = (await parse(followersRes)).map((u) => ({ ...u, relation: "follower" }));
  const following = (await parse(followingRes)).map((u) => ({ ...u, relation: "following" }));

  // merge + de-dupe by _id, mark mutual
  const map = new Map();
  for (const u of [...followers, ...following]) {
    if (map.has(u._id)) map.get(u._id).relation = "mutual";
    else map.set(u._id, { ...u });
  }
  return Array.from(map.values());
}

/**
 * Search users by query string. Adjust endpoint as needed.
 */
async function searchUsers(query) {
  const res = await fetch(
    `${BASE_URL}/users/search?q=${encodeURIComponent(query)}&limit=20`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.users || [];
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconLink = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconWhatsApp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const IconTwitter = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const IconFacebook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = 40 }) {
  const initials = (user?.full_name || user?.username || "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const palette = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#0891b2"];
  const bg = palette[(user?._id?.charCodeAt(0) || 0) % palette.length];

  if (user?.avatar) {
    return (
      <img src={user.avatar} alt={user.username}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 600, color: "#fff", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── Relation badge ───────────────────────────────────────────────────────────

function RelationBadge({ relation }) {
  const cfg = { mutual: ["Mutual", "#7c3aed"], following: ["Following", "#2563eb"], follower: ["Follower", "#059669"] }[relation];
  if (!cfg) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99,
      background: cfg[1] + "25", color: cfg[1],
      letterSpacing: "0.02em", textTransform: "uppercase",
    }}>{cfg[0]}</span>
  );
}

// ─── DM tab: user picker + compose ───────────────────────────────────────────

function DMUserPicker({ contentType, contentId }) {
  const [search, setSearch] = useState("");
  const [connections, setConnections] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState([]);
  const [sendStatus, setSendStatus] = useState({});
  const [sendError, setSendError] = useState("");
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Load connections once
  useEffect(() => {
    fetchConnections()
      .then(setConnections)
      .catch(() => setConnections([]))
      .finally(() => setLoadingConnections(false));
  }, []);

  // Focus search input on mount
  useEffect(() => { setTimeout(() => searchRef.current?.focus(), 120); }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!search.trim()) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try { setSearchResults(await searchUsers(search.trim())); }
      catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 380);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const displayList = useMemo(
    () => search.trim() ? searchResults : connections,
    [search, searchResults, connections]
  );

  // Send DM
  const handleSend = async () => {
    if (!selectedUser) return;
    setSending(true); setSendError("");
    setSendStatus((p) => ({ ...p, [selectedUser._id]: "sending" }));
    try {
      await shareViaDM(contentType, contentId, selectedUser._id, message.trim());
      setSendStatus((p) => ({ ...p, [selectedUser._id]: "success" }));
      setSentTo((p) => [...p, selectedUser._id]);
      setTimeout(() => { setSelectedUser(null); setMessage(""); }, 1400);
    } catch (err) {
      setSendStatus((p) => ({ ...p, [selectedUser._id]: "error" }));
      setSendError(
        err.code === "SHARING_DISABLED"
          ? "Sharing is disabled for this content."
          : err.message || "Failed to send. Try again."
      );
    } finally { setSending(false); }
  };

  // ── Step 2: compose view ───────────────────────────────────────────────────
  if (selectedUser) {
    const sent = sendStatus[selectedUser._id] === "success";
    return (
      <div className="sp-dm-tab">
        <div className="sp-compose-header">
          <button className="sp-back-btn"
            onClick={() => { setSelectedUser(null); setMessage(""); setSendError(""); }}>
            <IconArrowLeft />
          </button>
          <Avatar user={selectedUser} size={38} />
          <div className="sp-compose-meta">
            <span className="sp-compose-name">{selectedUser.full_name || selectedUser.username}</span>
            <span className="sp-compose-handle">@{selectedUser.username}</span>
          </div>
        </div>

        {sent ? (
          <div className="sp-status success">
            <IconCheck /> Sent to {selectedUser.full_name || "@" + selectedUser.username}!
          </div>
        ) : (
          <>
            <textarea
              className="sp-dm-textarea"
              placeholder="Add a message… (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              autoFocus
            />
            {sendError && <p className="sp-error-inline">{sendError}</p>}
            <button className="sp-send-btn" onClick={handleSend} disabled={sending}>
              {sending
                ? <span style={{ opacity: 0.7 }}>Sending…</span>
                : <><IconSend /> Send</>}
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Step 1: user list view ─────────────────────────────────────────────────
  return (
    <div className="sp-dm-tab">
      {/* Search */}
      <div className="sp-search-wrap">
        <span className="sp-search-icon"><IconSearch /></span>
        <input
          ref={searchRef}
          className="sp-search-input"
          placeholder="Search people…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {searchLoading && (
          <span className="sp-search-spinner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ animation: "sp-spin 0.75s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </span>
        )}
      </div>

      {/* Section label */}
      <p className="sp-section-label">
        {search.trim()
          ? searchLoading
            ? "Searching…"
            : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
          : loadingConnections
            ? "Loading…"
            : `Followers & Following · ${connections.length}`}
      </p>

      {/* List */}
      <div className="sp-user-list">
        {loadingConnections && !search.trim()
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="sp-skeleton-row">
                <div className="sp-skeleton-avatar" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="sp-skeleton-line" style={{ width: "55%" }} />
                  <div className="sp-skeleton-line" style={{ width: "35%" }} />
                </div>
              </div>
            ))
          : displayList.length === 0
            ? (
              <div className="sp-empty">
                <span style={{ fontSize: 30 }}>👥</span>
                <p>{search.trim() ? "No users found" : "No followers or following yet"}</p>
              </div>
            )
            : displayList.map((user) => {
                const isSent = sentTo.includes(user._id);
                return (
                  <button
                    key={user._id}
                    className={`sp-user-row ${isSent ? "sent" : ""}`}
                    onClick={() => !isSent && setSelectedUser(user)}
                    disabled={isSent}
                  >
                    <Avatar user={user} size={42} />
                    <div className="sp-user-info">
                      <span className="sp-user-name">{user.full_name || user.username}</span>
                      <span className="sp-user-handle">@{user.username}</span>
                    </div>
                    <div className="sp-user-right">
                      {user.relation && !search.trim() && <RelationBadge relation={user.relation} />}
                      {isSent
                        ? <span className="sp-sent-label"><IconCheck /> Sent</span>
                        : <span className="sp-arrow">→</span>}
                    </div>
                  </button>
                );
              })}
      </div>
    </div>
  );
}

// ─── Main SharePopup ──────────────────────────────────────────────────────────

/**
 * <SharePopup
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   contentType="post"                        // "post" | "reel" | "story"
 *   contentId="post_mmv02pwmtnfhrt"
 *   thumbnail="/path/to/thumb.jpg"            // optional
 *   title="My awesome post"                   // optional
 * />
 */
export default function SharePopup({
  isOpen,
  onClose,
  contentType = "post",
  contentId,
  thumbnail = null,
  title = null,
}) {
  const [tab, setTab] = useState("share");
  const [copied, setCopied] = useState(false);
  const [externalLoading, setExternalLoading] = useState(false);
  const overlayRef = useRef(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${contentType}/${contentId}`
      : `/${contentType}/${contentId}`;

  useEffect(() => {
    if (!isOpen) setTimeout(() => { setTab("share"); setCopied(false); }, 300);
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (e) => { if (e.target === overlayRef.current) onClose(); }, [onClose]
  );

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      setExternalLoading(true);
      await shareExternal(contentType, contentId);
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      if (err.code === "SHARING_DISABLED") { alert("Sharing is disabled for this content."); return; }
      try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }
      catch { /* denied */ }
    } finally { setExternalLoading(false); }
  };

  const handlePlatformShare = async (platform) => {
    try { await shareExternal(contentType, contentId); } catch { /* ignore */ }
    const u = encodeURIComponent(shareUrl), t = encodeURIComponent(title || "Check this out!");
    const urls = {
      whatsapp: `https://wa.me/?text=${t}%20${u}`,
      twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try { await shareExternal(contentType, contentId); await navigator.share({ title: title || "Check this out!", url: shareUrl }); }
    catch { /* cancelled */ }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        @keyframes sp-fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes sp-slide-up { from{transform:translateY(64px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes sp-pop-in   { from{transform:scale(0.92);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes sp-spin     { to{transform:rotate(360deg)} }
        @keyframes sp-shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        .sp-overlay {
          position:fixed;inset:0;z-index:9999;
          background:rgba(0,0,0,0.62);backdrop-filter:blur(8px);
          display:flex;align-items:flex-end;justify-content:center;
          animation:sp-fade-in 0.18s ease;
        }
        @media(min-width:640px){.sp-overlay{align-items:center;}}

        .sp-panel {
          font-family:'DM Sans',sans-serif;
          background:#111114;border:1px solid rgba(255,255,255,0.07);
          border-radius:24px 24px 0 0;
          width:100%;max-width:460px;
          max-height:88dvh;
          display:flex;flex-direction:column;overflow:hidden;
          animation:sp-slide-up 0.28s cubic-bezier(0.34,1.1,0.64,1);
          box-shadow:0 -16px 70px rgba(0,0,0,0.75);
        }
        @media(min-width:640px){
          .sp-panel{border-radius:20px;animation:sp-pop-in 0.24s cubic-bezier(0.34,1.1,0.64,1);}
        }

        .sp-drag{width:36px;height:4px;background:rgba(255,255,255,0.11);border-radius:99px;margin:12px auto 0;flex-shrink:0;}
        @media(min-width:640px){.sp-drag{display:none;}}

        .sp-header{
          display:flex;align-items:center;justify-content:space-between;
          padding:14px 18px 12px;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;
        }
        .sp-title{font-size:15px;font-weight:600;color:#f0f0f0;letter-spacing:-0.01em;}
        .sp-close{
          width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.07);
          border:none;color:#777;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          transition:background 0.15s,color 0.15s;
        }
        .sp-close:hover{background:rgba(255,255,255,0.13);color:#fff;}

        .sp-preview{
          display:flex;align-items:center;gap:12px;
          margin:12px 18px;padding:10px 12px;
          background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;
          flex-shrink:0;
        }
        .sp-preview-thumb{
          width:44px;height:44px;border-radius:8px;object-fit:cover;
          background:rgba(255,255,255,0.08);flex-shrink:0;
          display:flex;align-items:center;justify-content:center;font-size:20px;
        }
        .sp-preview-meta{flex:1;min-width:0;}
        .sp-preview-type{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#444;margin-bottom:2px;}
        .sp-preview-title{font-size:13px;font-weight:500;color:#d1d5db;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

        .sp-tabs{
          display:flex;margin:0 18px 14px;
          background:rgba(255,255,255,0.04);border-radius:10px;padding:3px;gap:2px;
          flex-shrink:0;
        }
        .sp-tab{
          flex:1;padding:7px 10px;border:none;border-radius:8px;
          font-family:inherit;font-size:13px;font-weight:500;
          cursor:pointer;transition:background 0.15s,color 0.15s;
          background:transparent;color:#555;
        }
        .sp-tab.active{background:rgba(255,255,255,0.09);color:#f0f0f0;}

        /* ── Share tab ── */
        .sp-share-tab{padding:0 18px 20px;overflow-y:auto;}
        .sp-copy-row{
          display:flex;align-items:center;gap:10px;
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
          border-radius:12px;padding:9px 12px;margin-bottom:16px;
        }
        .sp-copy-url{flex:1;font-size:12px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sp-copy-btn{
          flex-shrink:0;display:flex;align-items:center;gap:5px;
          padding:6px 14px;border-radius:8px;border:none;
          font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;
          transition:all 0.15s;background:#f0f0f0;color:#111;
        }
        .sp-copy-btn.copied{background:#22c55e;color:#fff;}
        .sp-copy-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .sp-platforms-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#3a3a3a;margin-bottom:10px;}
        .sp-platforms{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        .sp-platform-btn{
          display:flex;flex-direction:column;align-items:center;gap:7px;
          padding:14px 8px;border-radius:12px;
          border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);
          cursor:pointer;transition:background 0.15s,border-color 0.15s,transform 0.1s;
          font-family:inherit;color:#bbb;font-size:11.5px;font-weight:500;
        }
        .sp-platform-btn:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.14);transform:translateY(-1px);}
        .sp-platform-btn:active{transform:translateY(0);}
        .sp-platform-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
        .sp-platform-icon.wa{background:#25D366;color:#fff;}
        .sp-platform-icon.tw{background:#000;color:#fff;border:1px solid rgba(255,255,255,0.15);}
        .sp-platform-icon.fb{background:#1877F2;color:#fff;}
        .sp-native-btn{
          width:100%;padding:10px;border-radius:12px;
          border:1px dashed rgba(255,255,255,0.1);background:transparent;
          color:#555;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;
          transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .sp-native-btn:hover{border-color:rgba(255,255,255,0.18);color:#888;}

        /* ── DM tab ── */
        .sp-dm-tab{
          padding:0 18px 20px;
          overflow-y:auto;flex:1;
          display:flex;flex-direction:column;
          min-height:0;
        }

        .sp-search-wrap{position:relative;display:flex;align-items:center;margin-bottom:10px;}
        .sp-search-icon{position:absolute;left:12px;color:#444;display:flex;pointer-events:none;}
        .sp-search-spinner{position:absolute;right:12px;color:#555;display:flex;}
        .sp-search-input{
          width:100%;box-sizing:border-box;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
          border-radius:12px;padding:10px 36px;
          font-family:inherit;font-size:13.5px;color:#f0f0f0;outline:none;
          transition:border-color 0.15s;
        }
        .sp-search-input::placeholder{color:#444;}
        .sp-search-input:focus{border-color:rgba(255,255,255,0.18);}

        .sp-section-label{
          font-size:11px;font-weight:600;text-transform:uppercase;
          letter-spacing:0.07em;color:#333;margin-bottom:6px;flex-shrink:0;
        }

        .sp-user-list{
          flex:1;overflow-y:auto;
          display:flex;flex-direction:column;gap:1px;
          margin:0 -4px;
          /* custom scrollbar */
          scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.08) transparent;
        }
        .sp-user-list::-webkit-scrollbar{width:4px;}
        .sp-user-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px;}

        .sp-user-row{
          display:flex;align-items:center;gap:12px;
          padding:8px 10px;border-radius:12px;border:none;
          background:transparent;cursor:pointer;text-align:left;
          transition:background 0.12s;width:100%;
        }
        .sp-user-row:hover{background:rgba(255,255,255,0.05);}
        .sp-user-row.sent{opacity:0.45;cursor:default;}
        .sp-user-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;}
        .sp-user-name{font-size:13.5px;font-weight:500;color:#e5e7eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sp-user-handle{font-size:12px;color:#4b5563;}
        .sp-user-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .sp-arrow{color:#2a2a2a;font-size:16px;transition:color 0.15s;}
        .sp-user-row:hover .sp-arrow{color:#666;}
        .sp-sent-label{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#22c55e;}

        /* Skeleton */
        .sp-skeleton-row{display:flex;align-items:center;gap:12px;padding:8px 10px;}
        .sp-skeleton-avatar{
          width:42px;height:42px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.05) 75%);
          background-size:200% 100%;animation:sp-shimmer 1.5s infinite;
        }
        .sp-skeleton-line{
          height:9px;border-radius:6px;
          background:linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.05) 75%);
          background-size:200% 100%;animation:sp-shimmer 1.5s infinite;
        }

        .sp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:32px 0;color:#3a3a3a;}
        .sp-empty p{font-size:13px;}

        /* Compose (step 2) */
        .sp-compose-header{
          display:flex;align-items:center;gap:12px;
          margin-bottom:16px;padding-bottom:14px;
          border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;
        }
        .sp-back-btn{
          width:32px;height:32px;border-radius:50%;
          background:rgba(255,255,255,0.06);border:none;
          color:#aaa;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          transition:background 0.15s,color 0.15s;flex-shrink:0;
        }
        .sp-back-btn:hover{background:rgba(255,255,255,0.12);color:#fff;}
        .sp-compose-meta{display:flex;flex-direction:column;gap:2px;min-width:0;}
        .sp-compose-name{font-size:14px;font-weight:600;color:#f0f0f0;}
        .sp-compose-handle{font-size:12px;color:#4b5563;}

        .sp-dm-textarea{
          width:100%;box-sizing:border-box;
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
          border-radius:12px;padding:11px 13px;
          font-family:inherit;font-size:13.5px;color:#f0f0f0;outline:none;
          transition:border-color 0.15s;resize:none;height:90px;margin-bottom:12px;
        }
        .sp-dm-textarea::placeholder{color:#444;}
        .sp-dm-textarea:focus{border-color:rgba(255,255,255,0.18);}

        .sp-send-btn{
          width:100%;padding:11px;border-radius:12px;border:none;
          font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;
          transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:8px;
          background:#f0f0f0;color:#111;flex-shrink:0;
        }
        .sp-send-btn:hover{background:#d4d4d4;}
        .sp-send-btn:disabled{opacity:0.5;cursor:not-allowed;}

        .sp-status{
          padding:10px 12px;border-radius:10px;font-size:13px;font-weight:500;
          display:flex;align-items:center;gap:8px;
        }
        .sp-status.success{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#4ade80;}
        .sp-status.error{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;}
        .sp-error-inline{font-size:12px;color:#f87171;margin-bottom:10px;flex-shrink:0;}
      `}</style>

      <div className="sp-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="sp-panel" role="dialog" aria-modal="true" aria-label="Share">
          <div className="sp-drag" />

          {/* Header */}
          <div className="sp-header">
            <span className="sp-title">
              Share {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </span>
            <button className="sp-close" onClick={onClose} aria-label="Close">
              <IconClose />
            </button>
          </div>

          {/* Preview */}
          <div className="sp-preview">
            {thumbnail
              ? <img src={thumbnail} alt="" className="sp-preview-thumb" />
              : <div className="sp-preview-thumb">
                  {contentType === "reel" ? "🎬" : contentType === "story" ? "✨" : "🖼️"}
                </div>}
            <div className="sp-preview-meta">
              <div className="sp-preview-type">{contentType}</div>
              <div className="sp-preview-title">{title || contentId}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sp-tabs">
            <button className={`sp-tab ${tab === "share" ? "active" : ""}`} onClick={() => setTab("share")}>
              Share to…
            </button>
            <button className={`sp-tab ${tab === "dm" ? "active" : ""}`} onClick={() => setTab("dm")}>
              Send via DM
            </button>
          </div>

          {/* ── Share tab ── */}
          {tab === "share" && (
            <div className="sp-share-tab">
              <div className="sp-copy-row">
                <span className="sp-copy-url">{shareUrl}</span>
                <button
                  className={`sp-copy-btn ${copied ? "copied" : ""}`}
                  onClick={handleCopyLink}
                  disabled={externalLoading}
                >
                  {copied ? <><IconCheck /> Copied</> : "Copy link"}
                </button>
              </div>

              <p className="sp-platforms-label">Share on</p>
              <div className="sp-platforms">
                <button className="sp-platform-btn" onClick={() => handlePlatformShare("whatsapp")}>
                  <span className="sp-platform-icon wa"><IconWhatsApp /></span>
                  WhatsApp
                </button>
                <button className="sp-platform-btn" onClick={() => handlePlatformShare("twitter")}>
                  <span className="sp-platform-icon tw"><IconTwitter /></span>
                  X (Twitter)
                </button>
                <button className="sp-platform-btn" onClick={() => handlePlatformShare("facebook")}>
                  <span className="sp-platform-icon fb"><IconFacebook /></span>
                  Facebook
                </button>
              </div>

              {typeof navigator !== "undefined" && navigator.share && (
                <button className="sp-native-btn" onClick={handleNativeShare}>
                  <IconLink /> More options…
                </button>
              )}
            </div>
          )}

          {/* ── DM tab ── */}
          {tab === "dm" && (
            <DMUserPicker contentType={contentType} contentId={contentId} />
          )}
        </div>
      </div>
    </>
  );
}