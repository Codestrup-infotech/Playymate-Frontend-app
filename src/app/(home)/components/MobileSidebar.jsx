"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Home, Search, Map, User, PlusSquare,
  Calendar, ShoppingCart, Users, Trophy, Wallet,
  Zap, BookOpen, Flame, Compass, Video,
  Bell, HelpCircle, Image, Circle,
  Settings, LogOut, X,
} from "lucide-react";

import { useTheme } from "@/lib/ThemeContext";
import { useFeedRefresh } from "@/context/FeedRefreshContext";
import { performLogout } from "@/services/logout";

// ─── Drawer items ─────────────────────────────────────────────────────────────
const DRAWER_ITEMS = [
  { name: "Booking",        icon: <Calendar size={19} />,     path: "/bookings" },
  { name: "Shopping",       icon: <ShoppingCart size={19} />, path: "/shopping" },
  { name: "Event",          icon: <Zap size={19} />,          path: "/events" },
  { name: "Teams",          icon: <Users size={19} />,        path: "/teams" },
  { name: "Leaderboard",    icon: <Trophy size={19} />,       path: "/leaderboard" },
  { name: "Community",      icon: <Users size={19} />,        path: "/community" },
  { name: "Help & Support", icon: <HelpCircle size={19} />,   path: "/home/support" },
  { name: "Explore",        icon: <Compass size={19} />,      path: "/home/explore" },
  { name: "Reels",          icon: <Video size={19} />,        path: "/home/reels" },
  { name: "Streak",         icon: <Flame size={19} />,        path: "/home/streak" },
  { name: "Passport",       icon: <BookOpen size={19} />,     path: "/passport" },
  { name: "Wallet",         icon: <Wallet size={19} />,       path: "/wallet" },
  { name: "Subscription",   icon: <Zap size={19} />,          path: "/home/subscription" },
  { name: "Notifications",  icon: <Bell size={19} />,         path: "/home/notifications" },
  { name: "Settings",       icon: <Settings size={19} />,     path: "/home/settings" },
];

// ─── Create Bottom Sheet ──────────────────────────────────────────────────────
function CreateSheet({ isOpen, onClose, isDark, router }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 998,
          background: "rgba(0,0,0,0.5)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s",
        }}
      />
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          zIndex: 999,
          borderRadius: "24px 24px 0 0",
          overflow: "hidden",
          background: isDark ? "#1a1a2e" : "#ffffff",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)",
          }} />
        </div>
        <p style={{
          textAlign: "center", fontSize: 14, fontWeight: 600,
          padding: "8px 0 12px",
          color: isDark ? "#f0f0f0" : "#111",
        }}>Create</p>
        <div style={{ padding: "0 16px 40px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { icon: <Image size={20} />, label: "Post",  path: "/home/create-post" },
            { icon: <Video size={20} />, label: "Reel",  path: "/home/create-reel" },
            { icon: <Circle size={20}/>, label: "Story", path: "/home/create-story" },
          ].map(({ icon, label, path }) => (
            <button
              key={label}
              onClick={() => { router.push(path); onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 16px", borderRadius: 12,
                border: "none", cursor: "pointer",
                background: "transparent",
                color: isDark ? "#e5e7eb" : "#374151",
                fontSize: 14, fontWeight: 500,
              }}
            >
              {icon}{label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────
export default function MobileSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { theme }          = useTheme();
  const { triggerRefresh } = useFeedRefresh();

  const isDark = theme === "dark";
  const SIDEBAR_W = 200;
  const EDGE_ZONE = 28;

  const [open, setOpen]             = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [liveX, setLiveX]           = useState(0);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const dragging    = useRef(false);

  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragging.current    = false;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx) + 10) return;

    if (!open && touchStartX.current <= EDGE_ZONE && dx > 0) {
      dragging.current = true;
      setLiveX(Math.min(dx, SIDEBAR_W));
      e.preventDefault();
    } else if (open && dx < 0) {
      dragging.current = true;
      setLiveX(Math.max(dx, -SIDEBAR_W));
      e.preventDefault();
    }
  }, [open]);

  const onTouchEnd = useCallback(() => {
    if (!dragging.current) { touchStartX.current = null; return; }
    if (!open && liveX >  SIDEBAR_W * 0.35) setOpen(true);
    if ( open && liveX < -(SIDEBAR_W * 0.35)) setOpen(false);
    setLiveX(0);
    dragging.current    = false;
    touchStartX.current = null;
  }, [open, liveX]);

  useEffect(() => {
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove",  onTouchMove,  { passive: false });
    document.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      document.removeEventListener("touchend",   onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const sidebarTranslate = (() => {
    if (dragging.current) {
      return !open ? Math.min(liveX - SIDEBAR_W, 0) : Math.min(0, liveX);
    }
    return open ? 0 : -SIDEBAR_W;
  })();

  const handleHomeClick = (e) => {
    if (pathname === "/home") { e.preventDefault(); triggerRefresh(); }
  };

  const BOTTOM_TABS = [
    { name: "Home",    icon: <Home size={22} />,    path: "/home",        onClick: handleHomeClick },
    { name: "Search",  icon: <Search size={22} />,  path: "/home/search" },
    { name: "Post",    icon: null,                   path: null,           isCreate: true },
    { name: "Map",     icon: <Map size={22} />,      path: "/map" },
    { name: "Profile", icon: <User size={22} />,     path: "/home/profile" },
  ];

  return (
    <>
      {/* ── Thin backdrop — NO blur, just slight dim ── */}
      {open && (
        <div
          className="pmm"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 996,
            background: "rgba(0,0,0,0.25)",
            /* NO backdropFilter — intentionally omitted */
          }}
        />
      )}

      {/* ── Sidebar panel ── */}
      <div
        className="pmm pmm-sidebar"
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          transform: `translateX(${sidebarTranslate}px) translateY(-50%)`,
          transition: dragging.current ? "none" : "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          width: SIDEBAR_W,
          height: "auto",
          maxHeight: "80vh",
          zIndex: 997,
          display: "flex",
          flexDirection: "column",
          borderRadius: "0 24px 24px 0",
          overflow: "hidden",
          background: isDark ? "#111122" : "#e5e7eb",
          boxShadow: isDark
            ? "4px 0 32px rgba(0,0,0,0.6)"
            : "4px 0 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* ── Scrollable nav list ──
            Each item is padding 13px top + 13px bottom + 19px icon ≈ 45px
            5 items × 45px = 225px — fix height so only 5 show, rest scroll  */}
        <div
          className="pmm-scroll"
          style={{
            flex: "0 0 auto",
            overflowY: "scroll",
            overflowX: "hidden",
            padding: "8px 0 0",
            height: 225, /* exactly 5 items visible */
          }}
        >
          {DRAWER_ITEMS.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 20px",
                  textDecoration: "none",
                  color: isActive
                    ? (isDark ? "#ffffff" : "#111111")
                    : isDark ? "rgba(255,255,255,0.75)" : "#374151",
                  background: isActive
                    ? isDark
                      ? "linear-gradient(90deg, rgba(147,51,234,0.25), rgba(249,115,22,0.18))"
                      : "linear-gradient(90deg, rgba(147,51,234,0.12), rgba(249,115,22,0.08))"
                    : "transparent",
                  borderLeft: isActive ? "3px solid #9333ea" : "3px solid transparent",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  transition: "background 0.15s, color 0.15s",
                  animation: open ? `pmm-in 0.2s ${idx * 0.03}s both` : "none",
                  WebkitTapHighlightColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
                    e.currentTarget.style.color = isDark ? "#fff" : "#111";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.75)" : "#374151";
                  }
                }}
              >
                <span style={{
                  color: isActive ? "#f97316" : isDark ? "rgba(255,255,255,0.5)" : "#6b7280",
                  flexShrink: 0,
                  transition: "color 0.15s",
                }}>
                  {item.icon}
                </span>
                <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* ── Logout — pinned bottom ── */}
        <div style={{
          flexShrink: 0,
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"}`,
          padding: "6px 0 10px",
        }}>
          <button
            onClick={() => { setOpen(false); performLogout(); }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              width: "100%",
              padding: "13px 20px",
              border: "none", cursor: "pointer",
              background: "transparent",
              color: "#ef4444",
              fontSize: 14, fontWeight: 500,
              borderLeft: "3px solid transparent",
              transition: "background 0.15s",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <LogOut size={18} style={{ color: "#ef4444" }} />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* ── Gradient pill — visible when sidebar closed ── */}
      <div
        className="pmm"
        style={{
          position: "fixed",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 994,
          width: 4,
          height: 88,
          borderRadius: "0 4px 4px 0",
          background: "linear-gradient(180deg,#9333ea,#f97316)",
          animation: "pmm-glow 2.4s ease-in-out infinite",
          opacity: open ? 0 : 1,
          transition: "opacity 0.25s",
          pointerEvents: "none",
        }}
      />

      {/* ── Create Sheet ── */}
      <CreateSheet
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        isDark={isDark}
        router={router}
      />

      {/* ── Bottom Navigation Bar ── */}
      <nav
        className="pmm"
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 995,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          background: isDark ? "rgba(12,12,28,0.97)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
          boxShadow: isDark ? "0 -4px 32px rgba(0,0,0,0.55)" : "0 -4px 20px rgba(0,0,0,0.07)",
        }}
      >
        {BOTTOM_TABS.map((tab) => {
          if (tab.isCreate) {
            return (
              <button
                key="Post"
                onClick={() => setCreateOpen(true)}
                style={{
                  width: 52, height: 52,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#9333ea,#f97316)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2.5px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 4px 22px rgba(147,51,234,0.55)",
                  cursor: "pointer",
                  marginBottom: 18,
                  flexShrink: 0,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <PlusSquare size={26} color="#fff" strokeWidth={2.2} />
              </button>
            );
          }

          const isActive = pathname === tab.path;
          const col = isActive ? "#9333ea" : isDark ? "#6b7280" : "#9ca3af";

          return (
            <Link
              key={tab.name}
              href={tab.path}
              onClick={tab.onClick}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 3, minWidth: 48,
                paddingTop: 6, paddingBottom: 4,
                position: "relative",
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ color: col, transition: "color 0.2s" }}>{tab.icon}</span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: col, transition: "color 0.2s",
                letterSpacing: "0.01em",
              }}>
                {tab.name}
              </span>
              {isActive && (
                <span style={{
                  position: "absolute",
                  bottom: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: 18, height: 3,
                  borderRadius: 2,
                  background: "linear-gradient(90deg,#9333ea,#f97316)",
                }} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}