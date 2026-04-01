"use client";
import Sidebar from "./components/Sidebar";
import MobileSidebar from "./components/MobileSidebar";
import { useState } from "react";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import MessagesFloatingButton from "@/app/(home)/home/components/MessagesFloatingButton";
import { usePathname } from "next/navigation";
import { FeedRefreshProvider } from "@/context/FeedRefreshContext";

function AppLayoutInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();
  const pathname = usePathname();

  const showMessagesButton = pathname === "/home";

  return (
    <div
      className={`flex h-screen overflow-hidden font-Poppins transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#0f0f1a] text-white"
          : "bg-[#F2F4F7] text-gray-900"
      }`}
    >
      {/* Desktop Sidebar — hidden below 800px */}
      <style>{`
        @media (max-width: 799px) {
          .desktop-sidebar { display: none !important; }
          .desktop-main    { margin-left: 0 !important; }
        }
      `}</style>

      <div className="desktop-sidebar">
        <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      </div>

      {/* Main Content Area */}
      <div
        className="desktop-main flex flex-col flex-1 pt-10 transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? "250px" : "72px" }}
      >
        {/* Scrollable Content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Floating Messages Button */}
      {showMessagesButton && <MessagesFloatingButton count="9+" />}

      {/* Mobile Bottom Nav — hidden above 800px (handled inside MobileSidebar) */}
      <MobileSidebar />
    </div>
  );
}

export default function AppLayout({ children }) {
  return (
    <ThemeProvider>
      <FeedRefreshProvider>
        <AppLayoutInner>{children}</AppLayoutInner>
      </FeedRefreshProvider>
    </ThemeProvider>
  );
}