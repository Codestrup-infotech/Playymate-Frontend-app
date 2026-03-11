"use client";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { useState } from "react";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import MessagesFloatingButton from "@/app/(home)/home/components/MessagesFloatingButton";

function AppLayoutInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();

  return (
    <div
      className={`flex h-screen overflow-hidden font-Poppins transition-colors duration-300 ${theme === "dark"
        ? "bg-[#0f0f1a] text-white"
        : "bg-gray-100 text-gray-900"
        }`}
    >
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      {/* Main Content Area */}
      <div
        style={{ marginLeft: sidebarOpen ? "240px" : "72px" }}
        className="flex flex-col flex-1 mt-[50px] transition-all duration-300 ease-in-out"
      >
        {/* Fixed Topbar */}
        <Topbar isSidebarOpen={sidebarOpen} />

        {/* Scrollable Content */}
        <main className="flex-1 pt-24 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating Messages Button — rendered at root level so it is truly viewport-fixed */}
      <MessagesFloatingButton count="9+" />
    </div>
  );
}

export default function AppLayout({ children }) {
  return (
    <ThemeProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </ThemeProvider>
  );
}
