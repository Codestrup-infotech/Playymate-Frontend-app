"use client";
import Sidebar from "./components/Sidebar";
// import Topbar from "./components/Topbar";
import { useState } from "react";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import MessagesFloatingButton from "@/app/(home)/home/components/MessagesFloatingButton";
import { usePathname } from "next/navigation";
import MessagesPage from "./home/messages/page";
import { FeedRefreshProvider } from "@/context/FeedRefreshContext";

function AppLayoutInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();
  const pathname = usePathname();

  // Only show messages button on the home page
  const showMessagesButton = pathname === "/home";

  return (
    <div
      className={`flex h-screen overflow-hidden font-Poppins transition-colors duration-300 ${theme === "dark"
        ? "bg-[#0f0f1a] text-white"
        : "bg-[#F2F4F7] text-gray-900"
        }`}
    >
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      {/* Main Content Area */}
      <div
        style={{ marginLeft: sidebarOpen ? "250px" : "72px" }}
        className="flex flex-col flex-1 mt-[25px] transition-all duration-300 ease-in-out"
      >
        {/* Fixed Topbar */}
        {/* <Topbar isSidebarOpen={sidebarOpen} /> */}

        {/* Scrollable Content */}
        <main className="flex-1  overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating Messages Button — only shown on Home page */}
      {showMessagesButton && <MessagesFloatingButton count="9+" />}
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
