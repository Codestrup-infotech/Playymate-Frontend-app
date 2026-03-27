"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Home, Calendar, User, ShoppingCart, Users, Trophy, Wallet, Map,
  HelpCircle, Compass, Flame, Zap, Menu, BookOpen,
  Search, LogOut, Sun, Moon, PlusSquare, Image, Video, Circle,
  MoreHorizontal, Settings, Bookmark, Bell, Shield, Eye,
  UserCheck, Flag, Accessibility, Info, ChevronRight, X,
  Activity
} from "lucide-react";

import { useTheme } from "@/lib/ThemeContext";
import { useFeedRefresh } from "@/context/FeedRefreshContext";
import { performLogout } from "@/services/logout";

// ─── More Menu Popup ──────────────────────────────────────────────────────────

function MoreMenuPopup({ isOpen, onClose, anchorRef, isDark, onLogout, onTheme, theme }) {
  const popupRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const sections = [
    {
       label: "Account",
      items: [
        { icon: <Settings size={18} />, label: "Settings", path: "/home/settings" },
        // { icon: <Activity size={18} />, label: "Your Activity", path: "/home/activity" },
        { icon: <Bookmark size={18} />, label: "Saved", path: "/home/saved" },
        { icon: <Bell size={18} />, label: "Notifications", path: "/home/notifications" },
      ],
    },
  
    {
      label: "More",
      items: [
      
        { icon: <Info size={18} />, label: "About", path: "/home/about" },
        {
          icon: theme === "dark" ? <Sun size={18} /> : <Moon size={18} />,
          label: theme === "dark" ? "Switch to Light" : "Switch to Dark",
          action: "theme",
        },
      ],
    },
    {
      items: [
        { icon: <LogOut size={18} />, label: "Log out", action: "logout", danger: true },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop blur on mobile */}
      <div
        className="fixed inset-0 z-[998] sm:hidden"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      <div
        ref={popupRef}
        className="fixed z-[999]"
        style={{
          bottom: 80,
          left: 12,
          width: 270,
          background: isDark ? "#1a1a2e" : "#ffffff",
          borderRadius: 16,
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          boxShadow: isDark
            ? "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)"
            : "0 8px 40px rgba(0,0,0,0.15)",
          overflow: "hidden",
          animation: "more-pop 0.18s cubic-bezier(0.34,1.1,0.64,1)",
        }}
      >
        <style>{`
          @keyframes more-pop {
            from { opacity: 0; transform: translateY(10px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1); }
          }
        `}</style>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          }}
        >
          <span
            className="font-semibold text-sm"
            style={{ color: isDark ? "#f0f0f0" : "#111" }}
          >
            More options
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            style={{
              background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
              color: isDark ? "#aaa" : "#555",
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Sections */}
        <div className="py-2 max-h-[65vh]  overflow-y-auto scrollbar-hide">
          {sections.map((section, si) => (
            <div key={si}>
              {/* Divider between sections */}
              {si > 0 && (
                <div
                  style={{
                    height: 1,
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    margin: "6px 0",
                  }}
                />
              )}

              {/* Section label */}
              {section.label && (
                <p
                  className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: isDark ? "#444" : "#bbb" }}
                >
                  {section.label}
                </p>
              )}

              {section.items.map((item) => {
                const isLogout = item.action === "logout";
                const isTheme = item.action === "theme";

                const baseStyle = {
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "9px 16px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s",
                  color: isLogout
                    ? "#ef4444"
                    : isDark ? "#d1d5db" : "#374151",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                };

                const hoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

                const iconStyle = {
                  opacity: isLogout ? 1 : 0.7,
                  flexShrink: 0,
                };

                const content = (
                  <>
                    <span style={iconStyle}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {!isLogout && !isTheme && (
                      <ChevronRight size={14} style={{ opacity: 0.3 }} />
                    )}
                  </>
                );

                if (isLogout) {
                  return (
                    <button
                      key={item.label}
                      style={baseStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => { onClose(); onLogout(); }}
                    >
                      {content}
                    </button>
                  );
                }

                if (isTheme) {
                  return (
                    <button
                      key={item.label}
                      style={baseStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => { onTheme(); }}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    style={baseStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={onClose}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { triggerRefresh } = useFeedRefresh();

  const isDark = theme === "dark";
  const [isHover, setIsHover] = useState(false);
  const [openCreateMenu, setOpenCreateMenu] = useState(false);
  const [openMoreMenu, setOpenMoreMenu] = useState(false);
  const createMenuRef = useRef(null);
  const moreButtonRef = useRef(null);

  // Close create menu on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpenCreateMenu(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close create menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target)) {
        setOpenCreateMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    // Call the logout API, clear all tokens, and redirect to login
    // Uses window.location.replace to clear browser history and prevent back navigation
    performLogout();
  };

  const handleCreatePost = () => { router.push("/home/create-post"); setOpenCreateMenu(false); };
  const handleCreateReel = () => { router.push("/home/create-reel"); setOpenCreateMenu(false); };
  const handleCreateStory = () => { router.push("/home/create-story"); setOpenCreateMenu(false); };
  const toggleCreateMenu = () => setOpenCreateMenu((p) => !p);

  const handleHomeClick = (e) => {
    // If already on home page, trigger refresh
    if (pathname === "/home") {
      e.preventDefault();
      triggerRefresh();
      return;
    }
    // Otherwise, let the Link navigate normally
  };

  // Main nav items — removed Logout, Switch Mode (moved to More menu)
  const menu = [
    { name: "Home",         icon: <Home size={22} />,         path: "/home", onClick: handleHomeClick },
    { name: "Search",       icon: <Search size={22} />,       path: "/home/search" },
    { name: "Explore",      icon: <Compass size={22} />,      path: "/home/explore" },
    { name: "Reels",        icon: <Video size={22} />,        path: "/home/reels" },
    { name: "Listings",     icon: <Menu size={22} />,         path: "/home/listings" },
    { name: "Streak",       icon: <Flame size={22} />,        path: "/home/streak" },
    { name: "Map",          icon: <Map size={22} />,          path: "/map" },
    { name: "Passport",     icon: <BookOpen size={22} />,     path: "/passport" },
    { name: "Shopping",     icon: <ShoppingCart size={22} />, path: "/shopping" },
    { name: "Events",       icon: <Calendar size={22} />,     path: "/events" },
    { name: "Teams",        icon: <Users size={22} />,        path: "/teams" },
    { name: "Leaderboard",  icon: <Trophy size={22} />,       path: "/leaderboard" },
    { name: "Community",    icon: <Users size={22} />,        path: "/community" },
    { name: "Bookings",     icon: <Calendar size={22} />,     path: "/bookings" },
    { name: "Wallet",       icon: <Wallet size={22} />,       path: "/wallet" },
    { name: "Subscription", icon: <Zap size={22} />,          path: "/home/subscription" },
    { name: "Profile",      icon: <User size={22} />,         path: "/home/profile" },
    { name: "Notifications",icon: <Bell size={22} />,  path: "/home/notifications" },

    // Create — opens submenu
    { name: "Create",       icon: <PlusSquare size={22} />,   path: "/home/create-post", isCreatePost: true },
  ];

  const activeColor = "bg-gradient-to-r from-purple-600 to-orange-500 text-white";
  const inactiveColor = isDark
    ? "text-gray-300 hover:bg-gray-800"
    : "text-gray-700 hover:bg-gray-200";

  return (
    <>
      <div
        ref={createMenuRef}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => { setIsHover(false); }}
        className={`fixed left-0 top-0 h-screen
          ${isHover ? "w-[240px]" : "w-[72px]"}
          transition-all duration-300 ease-in-out
          z-50 overflow-visible flex flex-col
          ${isDark ? "bg-[#121226]" : "bg-gray-100"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-3 flex-shrink-0">
          <img
            src="/playymate-icon.png"
            alt="Playymate Icon"
            className={`w-10 h-10 object-contain transition-all duration-300 ${
              isHover ? "opacity-0 w-0" : "opacity-100 w-10 mx-auto"
            }`}
          />
          <img
            src="/playymate-logo.png"
            alt="Playymate Logo"
            className={`h-8 object-contain transition-all duration-300 ${
              isHover ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
            }`}
          />
        </div>

        {/* Scrollable nav */}
        <div className="flex flex-col flex-1 px-2 mt-2 overflow-y-auto scrollbar-hide min-h-0 pb-2 space-y-1">
          {menu.map((item) => {
            // CREATE submenu button
            if (item.isCreatePost) {
              return (
                <div key={item.name} className="relative">
                  <button
                    onClick={toggleCreateMenu}
                    className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-300
                      ${pathname === item.path || openCreateMenu ? activeColor : inactiveColor}`}
                  >
                    <div className="min-w-[22px] flex justify-center">{item.icon}</div>
                    <span className={`whitespace-nowrap font-medium transition-all duration-300
                      ${isHover ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                      {item.name}
                    </span>
                  </button>

                  {openCreateMenu && (
                    <div className={`ml-4 mt-1 rounded-lg overflow-hidden transition-all duration-200
                      ${isDark ? "bg-[#1a1a2e]" : "bg-white"}
                      shadow-lg border ${isDark ? "border-gray-700" : "border-gray-200"}
                      ${isHover ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
                    >
                      {[
                        { icon: <Image size={16} />, label: "Post",  fn: handleCreatePost },
                        { icon: <Video size={16} />, label: "Reel",  fn: handleCreateReel },
                        { icon: <Circle size={16}/>, label: "Story", fn: handleCreateStory },
                      ].map(({ icon, label, fn }) => (
                        <button
                          key={label}
                          onClick={fn}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
                            ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                          {icon}
                          <span className="whitespace-nowrap">{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Regular link
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={item.onClick}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-300
                  ${pathname === item.path ? activeColor : inactiveColor}`}
              >
                <div className="min-w-[22px] flex justify-center">{item.icon}</div>
                <span className={`whitespace-nowrap font-medium transition-all duration-300
                  ${isHover ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ── More button — pinned at bottom ── */}
        <div className="flex-shrink-0 px-2 py-3 border-t"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}
        >
          <button
            ref={moreButtonRef}
            onClick={() => setOpenMoreMenu((p) => !p)}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-300
              ${openMoreMenu ? activeColor : inactiveColor}`}
          >
            <div className="min-w-[22px] flex justify-center">
              <MoreHorizontal size={22} />
            </div>
            <span className={`whitespace-nowrap font-medium transition-all duration-300
              ${isHover ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
              More
            </span>
          </button>
        </div>
      </div>

      {/* ── More menu popup — rendered outside sidebar to avoid overflow clipping ── */}
      <MoreMenuPopup
        isOpen={openMoreMenu}
        onClose={() => setOpenMoreMenu(false)}
        anchorRef={moreButtonRef}
        isDark={isDark}
        onLogout={handleLogout}
        onTheme={toggleTheme}
        theme={theme}
      />
    </>
  );
}